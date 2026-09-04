namespace Analyzer.Git.Application.Services
{
    public class UpdateResultDto
    {
        public int ReposCount { get; set; }

        public int UpdateSucceed { get; set; }
        public int CloneError { get; set; }
        public int PullError { get; set; }

        public int Deleted { get; set; }
    }
}