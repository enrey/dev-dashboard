namespace Analyzer.Confluence.Application.Configuration
{
    /// <summary>
    /// Конфигурация Confluence
    /// </summary>
    public class ConfluenceConfig
    {
        public string Host { get; set; }

        public string Username { get; set; }

        public string Pwd { get; set; }

        public string DomainPostfix { get; set; }
    }
}
