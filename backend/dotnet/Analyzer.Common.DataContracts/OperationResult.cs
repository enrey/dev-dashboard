using System;

namespace Analyzer.Common.DataContracts
{
    public class OperationResult
    {
        public string JobName { get; set; }

        public DateTime Completed { get; set; }

        public bool Success { get; set; }

        public string ErrorMessage { get; set; }
    }
}
