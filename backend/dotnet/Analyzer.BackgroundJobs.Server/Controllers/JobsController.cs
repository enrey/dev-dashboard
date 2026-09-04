using Analyser.BackgroundJobs.Application.Dto;
using Analyser.BackgroundJobs.Application.Services;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Analyser.BackgroundJobs.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobsController : ControllerBase
    {
        private readonly IUpdateStatusService _statusService;

        public JobsController(IUpdateStatusService statusService)
        {
            _statusService = statusService;
        }

        [HttpGet("list")]
        public async Task<IEnumerable<JobStatusDto>> Get()
        {
            return await _statusService.GetJobs();
        }
    }
}
