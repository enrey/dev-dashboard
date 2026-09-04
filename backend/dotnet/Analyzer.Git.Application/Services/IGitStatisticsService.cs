using Analyzer.Git.Application.Dto;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Analyzer.Git.Application.Services
{
    /// <summary>
    /// Сервис для получения статистики из GIT репозиториев
    /// </summary>
    public interface IGitStatisticsService
    {
        /// <summary>
        /// Получить статистику по всем репозиториям за период
        /// </summary>
        /// <param name="startDate"></param>
        /// <param name="endDate"></param>
        /// <returns></returns>
        Task<IEnumerable<PeriodStatisticsDto>> GetAllRepositoriesStatisticsAsync(DateTimeOffset startDate, DateTimeOffset endDate);

        /// <summary>
        /// Обновление всех репозиториев
        /// </summary>
        Task<UpdateResultDto> UpdateAllRepositories();

        /// <summary>
        /// Обновление репозитория
        /// </summary>
        Task UpdateRepository(string repoUrl);
    }
}
