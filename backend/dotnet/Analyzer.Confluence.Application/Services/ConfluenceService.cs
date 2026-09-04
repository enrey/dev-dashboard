using Analyzer.Confluence.Application.Configuration;
using Analyzer.Confluence.Application.Dto;
using DiffMatchPatch;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.Intrinsics.Arm;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Analyzer.Confluence.Application.Services
{

    public class ConfluenceService
    {
        const int ISSUE_STEP = 50;

        private readonly ConfluenceFetcher _confluenceFetcher;
        private readonly ILogger<ConfluenceService> _logger;
        private readonly ConfluenceConfig _config;

        public ConfluenceService(ConfluenceFetcher confluenceFetcher, IOptionsMonitor<ConfluenceConfig> config, ILogger<ConfluenceService> logger)
        {
            if (config.CurrentValue.DomainPostfix == null) { throw new ArgumentNullException("confluenceConfig.DomainPostfix"); }

            _confluenceFetcher = confluenceFetcher;
            _logger = logger;
            _config = config.CurrentValue;
        }

        public async Task<IList<ConfluenceInfoDto>> GetInfo(DateTimeOffset from, DateTimeOffset till)
        {
            var startAt = 0;
            var firstInfo = _confluenceFetcher.SearchQuery(from, till, startAt, 1);

            await Task.WhenAll(firstInfo);

            var total = (firstInfo.Result.totalSize as JValue).Value<int>();

            Console.WriteLine("Total issues to retreive: " + total);

            var tasks = new List<Task<dynamic>>();
            while (startAt < total)
            {
                var task = _confluenceFetcher.SearchQuery(from, till, startAt, ISSUE_STEP);
                tasks.Add(task);
                Console.WriteLine("Task: " + startAt);

                startAt += ISSUE_STEP;
            }

            await Task.WhenAll(tasks);

            var result = tasks
                .Select(x => x.Result.results)
                .SelectMany(o =>
                {
                    List<dynamic> lines = new List<dynamic>();
                    foreach (var result in o)
                    {
                        var res = result as JObject;

                        var line = new
                        {
                            dt = res.SelectToken("history.lastUpdated.when").Value<DateTime>(),
                            version = res.SelectToken("history.lastUpdated.number").Value<int>(),
                            changeType = res.SelectToken("type").Value<string>(),
                            id = res.SelectToken("id").Value<int>(),
                            pageTitle = res.SelectToken("title").Value<string>(),
                            userName = res.SelectToken("history.lastUpdated.by.username").Value<string>(),
                            userFio = res.SelectToken("history.lastUpdated.by.displayName").Value<string>(),
                            url = res.SelectToken("_links.webui").Value<string>(),
                        };

                        lines.Add(line);
                    }
                    return lines;
                })
                .ToList();
            
            var enriched = await EnrichWithStats(result);

            return enriched;
        }

        private async Task<List<ConfluenceInfoDto>> EnrichWithStats(List<dynamic> result)
        {
            List<ConfluenceInfoDto> enriched = new List<ConfluenceInfoDto>();

            foreach (var line in result)
            {
                var item = new ConfluenceInfoDto
                {
                    Date = line.dt,
                    Changer = line.userName.ToLower() + _config.DomainPostfix,
                    ChangerFio = line.userFio,
                    ObjectId = line.id,
                    Version = line.version,
                    PageTitle = line.pageTitle,
                    ChangeType = line.changeType,
                    Url = _config.Host + line.url,
                };

                if (line.changeType == "page")
                {
                    if (line.version != 1)
                    {
                        var newContent = await _confluenceFetcher.GetContent(line.id, line.version);
                        var prevContent = await _confluenceFetcher.GetContent(line.id, line.version - 1);

                        newContent = StripHTML(newContent);
                        prevContent = StripHTML(prevContent);

                        diff_match_patch dmp = new diff_match_patch();
                        List<Diff> diff = dmp.diff_main(prevContent, newContent);
                        dmp.diff_cleanupSemantic(diff);

                        item.Added = diff.Where(o => o.operation == Operation.INSERT).Sum(o => o.text.Length);
                        item.Deleted = diff.Where(o => o.operation == Operation.DELETE).Sum(o => o.text.Length);
                        item.Churn = dmp.diff_levenshtein(diff);                        
                    }
                    else
                    {
                        var content = await _confluenceFetcher.GetContent(line.id, line.version);
                        var pureContent = StripHTML(content);

                        item.Added = pureContent.Length;
                        item.Deleted = 0;
                        item.Churn = pureContent.Length;                        
                    }
                }
                // здесь добавили картинку
                else if (line.changeType == "attachment")
                {
                    // допустим вес картинки условные 100 рубашек
                    item.Added = 100;
                    item.Deleted = 0;
                    item.Churn = 100;
                }
                else
                {
                    throw new NotImplementedException();
                }

                enriched.Add(item);
            }

            return enriched;
        }

        private static string StripHTML(string input)
        {
            return Regex.Replace(input, "<.*?>", String.Empty);
        }
    }
}
