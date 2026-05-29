using ArielCRM.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController(IAdminService adminService) : Controller
    {

        private readonly IAdminService _adminService = adminService;

        [HttpGet("team-members")]
        public async Task<IActionResult> GetTeamMembers()
        {
            var result = await _adminService.GetTeamMembersAsync();
            return Ok(result);
        }
    }
}




