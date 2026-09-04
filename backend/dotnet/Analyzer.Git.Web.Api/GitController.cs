using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Analyzer.Git.Application.Dto;
using Analyzer.Git.Application.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Analyzer.Git.Web.Api
{
    /// <summary>
    /// Контроллер для работы со статистикой GIT репозиториев
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class GitController : ControllerBase
    {
        private readonly IGitStatisticsService _gitStatisticsService;
        private readonly GitElasticService _gitElasticService;

        /// <summary>
        /// Контроллер для раьоты со статистикой GIT репозиториев
        /// </summary>
        public GitController(
            IGitStatisticsService gitStatisticsService,
            GitElasticService gitElasticService)
        {
            _gitStatisticsService = gitStatisticsService;
            _gitElasticService = gitElasticService;
        }

        /// <summary>
        /// Получение статистики по коммитам
        /// </summary>
        /// <param name="startDate">Дата начала периода в формате YYYY-MM-DD</param>
        /// <param name="endDate">Дата окончания периода в формате YYYY-MM-DD</param>
        /// <returns></returns>
        [HttpGet("commits")]
        [ProducesResponseType(typeof(IEnumerable<PersonStatisticsResultDto>), StatusCodes.Status200OK)]
        public IActionResult GetCommitsInfo(DateTimeOffset startDate, DateTimeOffset endDate)
        {
            var result = _gitElasticService.GetInfo(startDate, endDate);

            return Ok(result);
        }

        /// <summary>
        /// Получение статистики по таскам
        /// </summary>
        /// <param name="startDate">Дата начала периода в формате YYYY-MM-DD</param>
        /// <param name="endDate">Дата окончания периода в формате YYYY-MM-DD</param>
        /// <returns></returns>
        [HttpGet("tasks")]
        [ProducesResponseType(typeof(IEnumerable<TaksResultDto>), StatusCodes.Status200OK)]
        public IActionResult GetTasksInfo(DateTime startDate, DateTime endDate)
        {
            var dtos = _gitElasticService.GetTasks(startDate, endDate);

            return Ok(dtos);
        }

        /// <summary>
        /// Обновление GIT репозиториев
        /// </summary>
        /// <returns></returns>
        [HttpGet("update-repositories")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateRepositories()
        {
            var result = await _gitStatisticsService.UpdateAllRepositories();

            return new JsonResult(result);
        }

        /// <summary>
        /// Обновление конкретного GIT репозитория
        /// </summary>
        /// <returns></returns>
        [HttpGet("update-repositories/{repositoryUrl}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateRepositories(string repositoryUrl)
        {
            await _gitStatisticsService.UpdateRepository(repositoryUrl);

            return NoContent();
        }

        /// <summary>
        /// Обновление данных в хранилище Elastic
        /// </summary>
        /// <returns></returns>
        [HttpPost("update-elastic")]
        [ProducesResponseType(typeof(string), StatusCodes.Status200OK)]
        public async Task<IActionResult> Update()
        {
            await _gitElasticService.UpdateMonth();

            return Ok();
        }
    }
}