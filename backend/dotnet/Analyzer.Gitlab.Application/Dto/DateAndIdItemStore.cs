using System;

namespace Analyzer.Gitlab.Application.Dto
{
    public class DateAndIdItemStore
    {
        public EventType EventType { get; set; }

        /// <summary>
        /// Email пользователя
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// Username пользователя
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Заполняется только для типа Comment
        /// </summary>
        public string Comment { get; set; }

        public string Title { get; set; }

        public DateTime Dt { get; set; }

        public string Url { get; set; }

        /// <summary>
        /// Здесь всегда ID MR, для коммента соответственно - того в котором коммент
        /// </summary>
        public int Iid { get; set; }

        /// <summary>
        /// Здесь всегда ID проекта, т.к. айдишник mr-а уникален только в рамках id проекта
        /// </summary>
        public int ProjectId { get; set; }

        public string Repo { get; set; }
    }
}
