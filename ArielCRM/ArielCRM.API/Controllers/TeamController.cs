using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeamController(ITeamService teamService) : ControllerBase
    {
        private readonly ITeamService _teamService = teamService;

        [HttpGet]
        public async Task<IActionResult> GetMembers()
        {
            return Ok(await _teamService.GetAllAsync());
        }


        // [Authorize(Policy = "Permission:TeamMembers.Create")]
        [HttpPost("register")]
        public async Task<IActionResult> CreateMember(CreateTeamDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                return Ok(await _teamService.CreateAsync(dto));

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while registering user.", error = ex.Message });
            }

        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(string id, UpdateTeamDto dto)
        {
            var result = await _teamService.UpdateAsync(id, dto);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            var deleted = await _teamService.DeleteAsync(id);

            if (!deleted)
                return NotFound();

            return NoContent();
        }
    }


}