using Analyser.BackgroundJobs.Application.Constants;
using Analyser.BackgroundJobs.Application.Dto;
using Analyzer.Common.DataContracts;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public class UpdateStatusService : IUpdateStatusService
    {
        private readonly ILogger<UpdateStatusService> _logger;
        private readonly IConnectionMultiplexer _redis;

        public UpdateStatusService(ILogger<UpdateStatusService> logger, IConnectionMultiplexer redis)
        {
            _logger = logger;
            _redis = redis;
        }
        public async Task<IEnumerable<JobStatusDto>> GetJobs()
        {
            var db = _redis.GetDatabase();

            var names = JobNames.GetAll();
            var tasks = new List<Task<OperationResult>>(names.Count);

            foreach (var job in names)
            {
                tasks.Add(GetOperationResult(db, job));
            }

            await Task.WhenAll(tasks);

            return tasks.Select(t => new JobStatusDto { JobName = t.Result.JobName, LastUpdate = t.Result.Completed, Success = t.Result.Success });
        }

        private async Task<OperationResult> GetOperationResult(IDatabase db, string jobName)
        {
            var value = await db.StringGetAsync($"{jobName}LastUpdate");
            if (value.HasValue)
                return JsonSerializer.Deserialize<OperationResult>(value);

            return new OperationResult { Success = false, Completed = DateTime.MinValue, JobName = jobName };
        }
    }
}
