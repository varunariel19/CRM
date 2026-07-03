using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/team")]
    [Authorize]
    public class TeamController(ITeamService teamService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetMembers()
        {
            try
            {
                var members = await teamService.GetAllAsync();
                return Ok(members);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while retrieving team members.", details = ex.Message });
            }
        }

        [HttpPost("register")]
        [Authorize(Policy = "Permission:TeamMembers.Create")]
        public async Task<IActionResult> CreateMember([FromForm] CreateTeamDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await teamService.CreateAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while registering user.", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(string id, UpdateTeamDto dto)
        {
            try
            {
                var result = await teamService.UpdateAsync(id, dto);

                if (result == null)
                    return NotFound();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"An error occurred while updating team member {id}.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMember(string id)
        {
            try
            {
                var deleted = await teamService.DeleteAsync(id);

                if (!deleted)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"An error occurred while deleting team member {id}.", details = ex.Message });
            }
        }
    }
}