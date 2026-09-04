using System;

namespace Analyser.BackgroundJobs.Application.Jobs.Metadata
{
    /// <summary>
    /// Базовый класс информации о предопределенном фоновом задании
    /// </summary>
    public abstract class RecurringJobMetadataBase
    {
        /// <summary>
        /// Идентификатор задания
        /// </summary>
        public abstract string Id { get; }

        /// <summary>
        /// Название задания
        /// </summary>
        public abstract string Name { get; }

        /// <summary>
        /// Тип обработчика задания
        /// </summary>
        public abstract Type RunnerType { get; }
    }
}
