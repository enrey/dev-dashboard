using Refit;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public interface IGitClient
    {
        [Post("/api/git/update-elastic")]
        Task RunUpdate();

        [Get("/api/git/update-repositories")]
        Task RunUpdateRepos();
    }
}
