namespace Analyzer.Gitlab.Application.Configuration
{
    /// <summary>
    /// Конфигурация для работы с GitLab.
    /// </summary>
    public class GitLabConfig
    {
        /// <summary>
        /// Базовый URL API.
        /// </summary>
        public string ApiUrl { get; set; }

        /// <summary>
        /// GitLab UI URL.
        /// </summary>
        public string WebUrl { get; set; }

        /// <summary>
        /// Токен авторизации.
        /// </summary>
        public string PrivateToken { get; set; }
    }
}
