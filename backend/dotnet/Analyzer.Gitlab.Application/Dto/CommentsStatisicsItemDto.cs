using System;

namespace Analyzer.Gitlab.Application.Dto
{
    public class CommentsStatisicsItemDto
    {
        public DateTime Dt { get; set; }

        public string Comment { get; set; }

        public string MRTitle { get; set; }

        public int MRId { get; set; }

        public int ProjectId { get; set; }
    }
}
