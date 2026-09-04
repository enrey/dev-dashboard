using Nest;
using System;

namespace Analyzer.Common.Infrastructure
{
    public static class ElasticHelper
    {
        public static ElasticClient GetClient(string elasticSearchUrl, string indexName)
        {
            var settings = new ConnectionSettings(new Uri(elasticSearchUrl)).DefaultIndex(indexName);
            settings.EnableDebugMode();
            var client = new ElasticClient(settings);

            var response = client.Ping();

            if (response.OriginalException != null)
            {
                throw new Exception("Недоступен Elasticsearch", response.OriginalException);
            }

            return client;
        }
    }
}