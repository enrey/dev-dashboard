using Analyzer.Common.DataContracts;
using Analyzer.Common.Infrastructure;
using Analyzer.Confluence.Application.Configuration;
using Analyzer.Confluence.Application.Dto;
using Analyzer.Confluence.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace Analyzer.Confluence.Web.Api
{
    /// <summary> Информация по Confluence </summary>
    [ApiController]
    [Route("api/confluence")]
    public class ConfluenceController : Controller
    {
        private readonly ILogger<ConfluenceController> _logger;
        private readonly ConfluenceService _confluenceService;
        private readonly ConflueceElasticService _confluenceElasticService;

        /// <summary> Информация по Confluence </summary>
        public ConfluenceController(ILogger<ConfluenceController> logger, ConfluenceService confluenceService, ConflueceElasticService confluenceElasticService, IOptionsMonitor<ElasticConfig> elasticConfig, IOptionsMonitor<ConfluenceConfig> confluenceConfig)
        {
            if (elasticConfig.CurrentValue.ElasticSearchUrl == null) { throw new ArgumentNullException("ElasticConfig.ElasticSearchUrl"); }
            if (confluenceConfig.CurrentValue.Host == null) { throw new ArgumentNullException("ConfluenceConfig.Host"); }

            _logger = logger;
            _confluenceService = confluenceService;
            _confluenceElasticService = confluenceElasticService;
        }

        /// <summary>
        /// Получить информацию по правкам статей за период YYYY-MM-dd
        /// </summary>
        /// <param name="startDate">Начальная дата периода. По умолчанию: 30 дней назад</param>
        /// <param name="endDate">Конечная дата периода. По умолчанию: текущая дата</param>
        [HttpGet("articles")]
        [ProducesResponseType(typeof(ConfluenceInfoResponseDto), StatusCodes.Status200OK)]
        public async Task<IActionResult> Get(DateTimeOffset? startDate = null, DateTimeOffset? endDate = null)
        {
            var effectiveStartDate = startDate ?? DateTimeOffset.Now.AddDays(-30);
            var effectiveEndDate = endDate ?? DateTimeOffset.Now;

            _logger.LogInformation($"Querying for {effectiveStartDate.DateTime.ToShortDateString()} - {effectiveEndDate.DateTime.ToShortDateString()}");

            var result = _confluenceElasticService.GetConfluenceInfo(effectiveStartDate.Date, effectiveEndDate.Date);

            _logger.LogInformation("Ended");
            return Json(result);
        }

        /// <summary>
        /// Синхронизация (по умолчанию за последний месяц)
        /// </summary>
        [HttpPost("update-elastic")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update(DateTimeOffset? startDate, DateTimeOffset? endDate)
        {
            var dtos = await _confluenceService.GetInfo(startDate ?? DateTimeOffset.Now.AddDays(-30), endDate ?? DateTimeOffset.Now);
            await _confluenceElasticService.Update(dtos, startDate ?? DateTimeOffset.Now.AddDays(-30), endDate ?? DateTimeOffset.Now);

            return Ok(new ResultDto<string>($"Success dtos count: {dtos.Count}"));
        }
    }
}
