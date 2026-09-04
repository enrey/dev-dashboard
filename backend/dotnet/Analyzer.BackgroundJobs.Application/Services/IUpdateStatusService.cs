using Analyser.BackgroundJobs.Application.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Application.Services
{
    public interface IUpdateStatusService
    {
        Task<IEnumerable<JobStatusDto>> GetJobs();
    }
}
