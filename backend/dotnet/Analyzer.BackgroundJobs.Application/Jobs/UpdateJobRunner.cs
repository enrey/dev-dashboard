using Analyser.BackgroundJobs.Application.Exceptions;
using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Analyzer.Common.DataContracts;
using Microsoft.Extensions.Logging;
using Refit;
using StackExchange.Redis;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    public abstract class UpdateJobRunner<TInfo> : RecurringJobRunnerBase<TInfo>
        where TInfo : RecurringJobMetadataBase, new()
    {
        private readonly ILogger<UpdateJobRunner<TInfo>> _logger;
        private readonly IConnectionMultiplexer _redis;

        protected UpdateJobRunner(ILogger<UpdateJobRunner<TInfo>> logger, IConnectionMultiplexer redis)
        {
            _logger = logger;
            _redis = redis;
        }

        protected virtual async Task Update(string name, Func<Task> call)
        {
            var operationResult = new OperationResult
            {
                JobName = name
            };

            try
            {
                await call();
                operationResult.Success = true;
            }
            catch (Exception ex)
            {
                ErrorDto error = null;

                if (ex is ApiException exception)
                {
                    error = await exception.GetContentAsAsync<ErrorDto>();
                }
                if (error == null)
                {
                    error = new ErrorDto(0, ex.Message, ex.StackTrace);
                }

                var msg = $"Error {error.Message}; Stack trace {error.StackTrace}";
                operationResult.ErrorMessage = msg;
                _logger.LogError(msg);
                _logger.LogError(ex, $"Error occured due {name} update operation");

                throw new DashboardException(msg);//send to dashboard
            }
            finally
            {
                operationResult.Completed = DateTime.Now;

                var db = _redis.GetDatabase();
                await db.StringSetAsync($"{name}LastUpdate", JsonSerializer.Serialize(operationResult));
            }
        }
    }
}
