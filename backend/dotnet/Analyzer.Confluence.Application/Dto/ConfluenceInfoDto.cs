using System;

namespace Analyzer.Confluence.Application.Dto
{

    public class ConfluenceInfoDto
    {
        /// <summary> Дата события </summary>
        public DateTime? Date { get; set; }

        public int ObjectId { get; set; }
        
        public int Version{ get; set; }

        public string PageTitle { get; set; }

        public string Changer { get; set; }

        public string ChangerFio { get; set; }

        public string ChangeType { get; set; }

        public int Added { get; set; }
        
        public int Deleted { get; set; }
        
        public int Churn{ get; set; }

        public string Url { get; set; }
    }
}
