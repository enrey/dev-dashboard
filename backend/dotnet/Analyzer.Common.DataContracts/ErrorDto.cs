using System;

namespace Analyzer.Common.DataContracts
{
    public class ErrorDto
    {
        public ErrorDto(int code, string message, string stackTrace)
        {
            Code = code;
            Message = message;
            StackTrace = stackTrace;
        }

        public int Code { get; }

        public string Message { get; }

        public string StackTrace { get;}
    }
}
