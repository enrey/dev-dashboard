using Analyzer.Common.Infrastructure;
using Analyzer.Confluence.Application.Configuration;
using Analyzer.Confluence.Application.Dto;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Analyzer.Confluence.Application.Services
{
    public class ConflueceElasticService
    {
        private const int MAX_ROWS = 10000;
        private const string INDEX_NAME = "confluence";

        private readonly ElasticConfig _elasticConfig;
        private readonly ILogger<ConflueceElasticService> _logger;

        public ConflueceElasticService(IOptionsMonitor<ElasticConfig> elasticConfig, ILogger<ConflueceElasticService> logger)
        {
            _elasticConfig = elasticConfig.CurrentValue;
            _logger = logger;
        }

        public ConfluenceInfoResponseDto GetConfluenceInfo(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            // Получаем коллекцию за период
            var collection = client.Search<ConfluenceInfoDto>(s => s
                .From(0)
                .Size(MAX_ROWS)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Date)
                        .GreaterThanOrEquals(from.DateTime)
                        .LessThanOrEquals(till.DateTime)
                    )
                )
            ).Documents.ToList();

            // Получаем максимальную дату из всех записей
            var maxDateResponse = client.Search<ConfluenceInfoDto>(s => s
                .Size(0)
                .Query(q => q
                    .Exists(e => e
                        .Field(f => f.Date)
                    )
                )
                .Aggregations(a => a
                    .Max("max_date", m => m
                        .Field(f => f.Date)
                    )
                )
            );

            var maxDate = maxDateResponse.Aggregations.Max("max_date").Value;
            DateTime? maxDateTime = maxDate.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds((long)maxDate.Value).DateTime : (DateTime?)null;

            return new ConfluenceInfoResponseDto
            {
                Items = collection,
                DtStorageMax = maxDateTime
            };
        }

        public DateTime? GetMaxDate()
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var response = client.Search<ConfluenceInfoDto>(s => s
                .Size(0)
                .Aggregations(a => a
                    .Max("max_date", m => m
                        .Field(f => f.Date)
                    )
                )
            );

            var maxDate = response.Aggregations.Max("max_date").Value;
            return maxDate.HasValue ? DateTimeOffset.FromUnixTimeMilliseconds((long)maxDate.Value).DateTime : null;
        }

        public async Task Update(IList<ConfluenceInfoDto> dtos, DateTimeOffset startDate, DateTimeOffset endDate)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);
            var response = await client.DeleteByQueryAsync<ConfluenceInfoDto>(q => q
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Date)
                        .GreaterThanOrEquals(startDate.Date)
                        .LessThanOrEquals(endDate.Date)
                        )
                    )
            );

            foreach (var a in dtos)
            {
                var indexResponse = await client.IndexDocumentAsync(a);
                if (!indexResponse.IsValid)
                {
                    _logger.LogError("Not valid document :(");
                    _logger.LogError(indexResponse.OriginalException.ToString());
                    _logger.LogError(indexResponse.DebugInformation.ToString());
                }
            }
        }
    }

}
