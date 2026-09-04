using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Analyzer.Gitlab.Application.Dto;

namespace Analyzer.Gitlab.Application.Services
{
    /// <summary>
    /// Сервис для взаимодействия с GitLab
    /// </summary>
    public interface IGitLabService
    {
        /// <summary>
        /// Получить статистику пользователей по мерджреквестам
        /// </summary>
        Task<IEnumerable<UserMergeRequestsStatisicsDto>> GetMergeRequestsStatistics(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Получить статистику пользователей по мерджреквестам
        /// </summary>
        Task<IEnumerable<CommentsStatisicsDto>> GetMergeRequestsCommentsStatistics(DateTime startDate, DateTime endDate);

        /// <summary>
        /// Получить всех пользователей
        /// </summary>
        Task<IEnumerable<UsersDto>> GetUsers();

        /// <summary>
        /// Получить активные репозитории GitLab'а (использует Git)
        /// </summary>
        Task<IEnumerable<RepositoryInfoDto>> GetActiveRepositories(DateTime sinceDate);
    }
}
