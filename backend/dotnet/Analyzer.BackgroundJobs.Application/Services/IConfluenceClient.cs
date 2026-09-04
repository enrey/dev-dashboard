using Refit;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public interface IConfluenceClient
    {
        [Post("/api/confluence/update-elastic")]
        Task RunUpdate();
    }
}
