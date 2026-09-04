using System;
using System.Collections.Generic;

namespace Analyzer.Confluence.Application.Dto
{
    public class ConfluenceInfoResponseDto
    {
        public IEnumerable<ConfluenceInfoDto> Items { get; set; }
        public DateTime? DtStorageMax { get; set; }
    }
} 