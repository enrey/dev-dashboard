namespace Analyzer.Common.Infrastructure
{
    /// <summary>
    /// Конфигурация Elastic
    /// </summary>
    public class ElasticConfig
    {
        public string ElasticSearchUrl { get; set; }

        public int UpdatePeriodMinutes { get; set; }
    }
}
