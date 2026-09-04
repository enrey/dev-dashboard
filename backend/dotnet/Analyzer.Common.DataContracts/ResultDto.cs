namespace Analyzer.Common.DataContracts
{
    public class ResultDto<T>
    {
        public T Result { get; set; }

        public bool Success => string.IsNullOrEmpty(ErrorMessage);

        public string ErrorMessage { get; set; }

        public ResultDto(T result = default, string errorMessage = null)
        {
            Result = result;
            ErrorMessage = errorMessage;
        }
    }
}
