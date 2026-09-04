using Analyser.BackgroundJobs.Application.Jobs.Metadata;
using Hangfire;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    /// <summary>
    /// Базовый класс фонового задания
    /// </summary>
    public abstract class RecurringJobRunnerBase<TInfo> : IRecurringJobRunner
        where TInfo : RecurringJobMetadataBase, new()
    {
        /// <summary>
        /// Метод - обработчик задания
        /// </summary>
        public abstract Task Execute();

        /// <summary>
        /// Принудительный запуск задачи
        /// </summary>
        public static void TriggerNow()
        {
            RecurringJob.Trigger(new TInfo().Id);
        }
    }
}
