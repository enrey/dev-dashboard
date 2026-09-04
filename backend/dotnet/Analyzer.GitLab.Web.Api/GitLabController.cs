using Analyzer.Gitlab.Application.Dto;
using Analyzer.Gitlab.Application.Services;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Analyzer.GitLab.Web.Api
{
    /// <summary>
    /// Контроллер для работы с данными из GitLab
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class GitLabController : ControllerBase
    {
        private readonly IGitLabService _gitLabService;
        private readonly GitLabElasticService _gitLabElasticService;

        /// <summary>
        /// Контроллер для работы с данными из GitLab
        /// </summary>
        public GitLabController(IGitLabService gitLabService, GitLabElasticService gitLabElasticService)
        {
            _gitLabService = gitLabService;
            _gitLabElasticService = gitLabElasticService;
        }

        /// <summary>
        /// Получение статистики по мерджреквестам из GitLab'а
        /// </summary>
        /// <param name="startDate">Дата начала периода в формате YYYY-MM-DD</param>
        /// <param name="endDate">Дата окончания периода в формате YYYY-MM-DD</param>
        /// <returns></returns>
        [HttpGet("merge-requests")]
        [ProducesResponseType(typeof(IEnumerable<UserMergeRequestsStatisicsDto>), StatusCodes.Status200OK)]
        public IActionResult GetMergeRequests(DateTime startDate, DateTime endDate)
        {
            var dtos = _gitLabElasticService.GetMergeRequestsStatistics(startDate, endDate);

            return Ok(dtos);
        }

        /// <summary>
        /// Получение статистики по таскам
        /// </summary>
        /// <param name="startDate">Дата начала периода в формате YYYY-MM-DD</param>
        /// <param name="endDate">Дата окончания периода в формате YYYY-MM-DD</param>
        /// <returns></returns>
        [HttpGet("tasks/{startDate}/{endDate}")]
        [ProducesResponseType(typeof(IEnumerable<TaksDto>), StatusCodes.Status200OK)]
        public IActionResult GetTasks(DateTime startDate, DateTime endDate)
        {
            var dtos = _gitLabElasticService.GetTasks(startDate, endDate);

            var a = dtos.SelectMany(o => o.Titles).Distinct().ToList();
            var b = string.Join("         ", a);

            return Ok(dtos);
        }

        /// <summary>
        /// Получение статистики по мерджреквест комментам из GitLab'а
        /// </summary>
        /// <param name="startDate">Дата начала периода в формате YYYY-MM-DD</param>
        /// <param name="endDate">Дата окончания периода в формате YYYY-MM-DD</param>
        /// <returns></returns>
        [HttpGet("comments")]
        [ProducesResponseType(typeof(IEnumerable<CommentsStatisicsDto>), StatusCodes.Status200OK)]
        public IActionResult GetMergeRequestsComments(DateTime startDate, DateTime endDate)
        {
            var dtos = _gitLabElasticService.GetMergeRequestsCommentsStatistics(startDate, endDate);

            return Ok(dtos);
        }

        /// <summary>
        /// Получение пользователей GitLab'а
        /// </summary>
        [HttpGet("gitlabUsers")]
        [ProducesResponseType(typeof(IEnumerable<UsersDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetGitlabUsers()
        {
            var dtos = await _gitLabService.GetUsers();

            return Ok(dtos);
        }

        /// <summary>
        /// Возвращает список активных с начала указанной даты репозиториев 
        /// <param name="sinceDate">Начало периода активности в формате YYYY-MM-DD</param>
        /// </summary>
        [HttpGet("gitlab-active-repositories/{sinceDate}")]
        [ProducesResponseType(typeof(IEnumerable<RepositoryInfoDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetActiveRepositories(DateTime sinceDate)
        {
            var repositories = await _gitLabService.GetActiveRepositories(sinceDate);

            return Ok(repositories);
        }

        /// <summary>
        /// Обновление данных в elastic
        /// </summary>
        /// <returns></returns>
        [HttpPost("update-elastic")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> UpdateRepositories()
        {
            await _gitLabElasticService.Update();

            return NoContent();
        }
    }
}
