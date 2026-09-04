using Analyzer.Gitlab.Application.Configuration;
using Analyzer.Gitlab.Application.Dto;
using Analyzer.Gitlab.Application.Services;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Analyzer.Common.Infrastructure;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Analyzer.Gitlab.Application.Services
{
    public class GitLabElasticService
    {
        private const string INDEX_NAME = "gitlab";

        private const int MAX_ROWS = 10000;

        private readonly GitLabConfig _gitLabConfig;
        private readonly ElasticConfig _elasticConfig;
        private readonly IGitLabService _gitLabService;
        private readonly ILogger<GitLabElasticService> _logger;

        public GitLabElasticService(IOptionsMonitor<GitLabConfig> gitLabConfig, IOptionsMonitor<ElasticConfig> elasticConfig, IGitLabService gitLabService, ILogger<GitLabElasticService> logger)
        {
            _gitLabConfig = gitLabConfig.CurrentValue;
            _elasticConfig = elasticConfig.CurrentValue;
            _gitLabService = gitLabService;
            _logger = logger;
        }

        public IList<CommentsStatisicsDto> GetMergeRequestsCommentsStatistics(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var collection = client.Search<DateAndIdItemStore>(s => s
                .From(0)
                .Size(MAX_ROWS)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(from.DateTime)
                        .LessThanOrEquals(till.DateTime)
                    )
                )
            ).Documents;

            return MapCommentsFromStorage(collection.Where(o => o.EventType == EventType.Comment).ToList());
        }

        public IList<UserMergeRequestsStatisicsDto> GetMergeRequestsStatistics(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var collection = client.Search<DateAndIdItemStore>(s => s
                .From(0)
                .Size(MAX_ROWS)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(from.DateTime)
                        .LessThanOrEquals(till.DateTime)
                    )
                )
            ).Documents;

            return MapBack(collection.Where(o => o.EventType != EventType.Comment).ToList());
        }

        public IList<TaksDto> GetTasks(DateTimeOffset from, DateTimeOffset till)
        {
            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var collection = client.Search<DateAndIdItemStore>(s => s
                .From(0)
                .Size(MAX_ROWS)
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(from.DateTime)
                        .LessThanOrEquals(till.DateTime)
                    )
                )
            ).Documents;

            // это группировка по mr
            var r = collection.GroupBy(a => new { a.ProjectId, a.Iid })
                .Select(o => new 
                {
                    Task = GetTask(o.Select(a => a.Title).Distinct().Single()),
                    Titles = o.Select(a => a.Title).Distinct().ToList(),
                    Opened = o.Where(k => k.EventType == EventType.Opened)/*.Select(MapMr)*/.ToList(),
                    Merged = o.Where(k => k.EventType == EventType.Merged)/*.Select(MapMr)*/.ToList(),
                    Comments = o.Where(k => k.EventType == EventType.Comment)/*.Select(MapComment)*/.ToList(),
                }
                )
                .GroupBy(o => new { o.Task })
                .Select(o => new TaksDto
                {
                    Task = o.Key.Task,
                    Titles = o.SelectMany(a => a.Titles).ToList(),
                    Opened = o.SelectMany(a => a.Opened).ToList(),
                    Merged = o.SelectMany(a => a.Merged).ToList(),
                    Comments = o.SelectMany(a => a.Comments).ToList(),
                })
                .ToList();

            return r;
        }

        // TODO: убрать пасту
        private string GetTask(string title)
        {
            var regex = new Regex(@"([a-zA-Z0-9]{2,})-\d+|;", RegexOptions.IgnoreCase);

            var match = regex.Match(title);

            if (match.Success)
            {
                return match.Value.ToUpper();
            }

            return "???";
        }

        private IList<CommentsStatisicsDto> MapCommentsFromStorage(List<DateAndIdItemStore> list)
        {
            return list.GroupBy(o => new { o.Email, o.Username }).Select(o => new CommentsStatisicsDto
            {
                Email = o.Key.Email,
                Username = o.Key.Username,
                TotalComments = o.Count(),
                Items = o.Select(MapComment).ToList(),

            }).ToList();
        }

        private IList<UserMergeRequestsStatisicsDto> MapBack(List<DateAndIdItemStore> list)
        {
            return list.GroupBy(o => new { o.Email, o.Username }).Select(o => new UserMergeRequestsStatisicsDto
            {
                Email = o.Key.Email,
                Username = o.Key.Username,
                OpenedTotal = o.Where(i => i.EventType == EventType.Opened).Count(),
                MergedTotal = o.Where(i => i.EventType == EventType.Merged).Count(),
                OpenedDates = o.Where(i => i.EventType == EventType.Opened).Select(MapMr).ToList(),
                MergedDates = o.Where(i => i.EventType == EventType.Merged).Select(MapMr).ToList(),
            }).ToList();
        }

        private static DateAndIdItem MapMr(DateAndIdItemStore k)
        {
            return new DateAndIdItem
            {
                Dt = k.Dt,
                Iid = k.Iid,
                ProjectId = k.ProjectId,
                Repo = k.Repo,
                Url = k.Url,
                Title = k.Title
            };
        }

        private static CommentsStatisicsItemDto MapComment(DateAndIdItemStore k)
        {
            return new CommentsStatisicsItemDto
            {
                Dt = k.Dt,
                Comment = k.Comment,
                MRTitle = k.Title,
                MRId = k.Iid,
                ProjectId = k.ProjectId
            };
        }
        private DateAndIdItemStore GetStoreItem(UserMergeRequestsStatisicsDto dto, DateAndIdItem item, EventType eventType)
        {
            return new DateAndIdItemStore
            {
                Username = dto.Username,
                Email = dto.Email,
                EventType = eventType,
                Dt = item.Dt,
                Iid = item.Iid,
                ProjectId = item.ProjectId,
                Repo = item.Repo,
                Url = item.Url,
                Title = item.Title
            };
        }
        private IEnumerable<DateAndIdItemStore> GetStoreItems(IEnumerable<UserMergeRequestsStatisicsDto> items)
        {
            foreach (var a in items)
            {
                foreach (var mr in a.MergedDates)
                {
                    yield return GetStoreItem(a, mr, EventType.Merged);
                }
                foreach (var mr in a.OpenedDates)
                {
                    yield return GetStoreItem(a, mr, EventType.Opened);
                }
            }
        }

        private IEnumerable<DateAndIdItemStore> GetStoreCommentToStorage(IEnumerable<CommentsStatisicsDto> items)
        {
            foreach (var a in items)
            {
                foreach (var dto in a.Items)
                {
                    yield return new DateAndIdItemStore
                    {
                        Username = a.Username,
                        Email = a.Email,
                        EventType = EventType.Comment,
                        Dt = dto.Dt,
                        Comment = dto.Comment,
                        Title = dto.MRTitle,
                        Iid = dto.MRId,
                        ProjectId = dto.ProjectId
                    };
                }
            }
        }


        public async Task Update()
        {
            var dtFrom = DateTimeOffset.Now.AddDays(-30).Date;
            var dtTill = DateTimeOffset.Now.Date;

            var result = await _gitLabService.GetMergeRequestsStatistics(dtFrom, dtTill);
            var items = GetStoreItems(result).ToList();

            var resultComments = await _gitLabService.GetMergeRequestsCommentsStatistics(dtFrom, dtTill);
            items = items.Concat(GetStoreCommentToStorage(resultComments)).ToList();

            var client = ElasticHelper.GetClient(_elasticConfig.ElasticSearchUrl, INDEX_NAME);

            var response = await client.DeleteByQueryAsync<DateAndIdItemStore>(q => q
                .Query(q => q
                    .DateRange(r => r
                        .Field(f => f.Dt)
                        .GreaterThanOrEquals(dtFrom)
                        .LessThanOrEquals(dtTill)
                        )
                    )
            );

            foreach (var a in items)
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
