using Refit;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public interface IGitLabClient
    {
        [Post("/api/gitlab/update-elastic")]
        Task RunUpdate();
    }
}
