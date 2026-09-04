using Analyzer.Common.DataContracts;
using Analyzer.Jira.Application.Dto;
using Analyzer.Jira.Application.Services;
using Atlassian.Jira;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Analyzer.Jira.Web.Api
{
    /// <summary> Информация по Jira </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class JiraController : Controller
    {
        private readonly ILogger<JiraController> _logger;
        private readonly JiraService _jiraService;
        private readonly JiraElasticService _jiraElasticService;

        /// <summary> Информация по Jira </summary>
        public JiraController(ILogger<JiraController> logger, JiraService jiraService, JiraElasticService jiraElasticService)
        {
            _logger = logger;
            _jiraService = jiraService;
            _jiraElasticService = jiraElasticService;
        }

        /// <summary>
        /// Получить информацию по таскам за период
        /// </summary>
        [HttpGet("tasks")]
        [ProducesResponseType(typeof(IEnumerable<JiraInfoDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            _logger.LogInformation($"Querying for {startDate.DateTime.ToShortDateString()} - {endDate.DateTime.ToShortDateString()}");

            var collection = _jiraElasticService.GetJiraInfo(startDate, endDate);

            _logger.LogInformation("Ended");
            return Json(collection);
        }

        /// <summary>
        /// Получить текущих пользователей (онлайн из джиры)
        /// </summary>
        [HttpGet("users")]
        [ProducesResponseType(typeof(IEnumerable<JiraUser>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUsers()
        {
            var collection = await _jiraService.GetUsers();

            return Json(collection);
        }

        // TODO: возможность за год..
        /// <summary>
        /// Синхронизация (по умолчанию за последний месяц)
        /// </summary>
        [HttpPost("update-elastic")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update(DateTimeOffset? startDate, DateTimeOffset? endDate, bool getHistoric = false)
        {
            var result = await _jiraService.GetJiraInfo(startDate ?? DateTimeOffset.Now.AddDays(-30), endDate ?? DateTimeOffset.Now, getHistoric);
            await _jiraElasticService.Update(result, startDate ?? DateTimeOffset.Now.AddDays(-30), endDate ?? DateTimeOffset.Now);

            return Ok(new ResultDto<string>("ok"));
        }
    }
}
