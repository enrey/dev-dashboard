using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Jobs
{
    /// <summary>
    /// Интерфейс раннера фоновых заданий
    /// </summary>
    public interface IRecurringJobRunner
    {
        /// <summary>
        /// Метод - обработчик задания
        /// </summary>
        public Task Execute();
    }
}
