using System.Collections.Generic;

namespace Analyzer.Gitlab.Application.Dto
{
    /// <summary>
    /// DTO для данных о мердж реквестах пользователя GitLab
    /// </summary>
    public class CommentsStatisicsDto
    {
        /// <summary>
        /// Email пользователя
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Username пользователя
        /// </summary>
        public string Username { get; set; }

        public int TotalComments { get; set; }

        public IList<CommentsStatisicsItemDto> Items { get; set; }
    }
}
