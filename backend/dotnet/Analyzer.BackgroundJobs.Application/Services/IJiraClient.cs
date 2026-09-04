using Refit;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public interface IJiraClient
    {
        [Post("/api/jira/update-elastic")]
        Task RunUpdate();
    }
}
