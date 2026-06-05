using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        // GET api/history
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] HistoryFilterDto filter)
        {
            var result = await _historyService.GetAllAsync(filter);
            return Ok(result);
        }

        // DELETE api/history/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                await _historyService.DeleteAsync(id);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // DELETE api/history
        [HttpDelete]
        public async Task<IActionResult> DeleteAll()
        {
            await _historyService.DeleteAllAsync();
            return NoContent();
        }

        // POST api/history/{id}/revert
        [Authorize]
        [HttpPost("{id}/revert")]
        public async Task<IActionResult> Revert(string id)
        {
            var initiatedById = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(initiatedById))
                return Unauthorized(new { message = "User is not authenticated." });

            try
            {
                await _historyService.RevertAsync(id, initiatedById);
                return Ok(new { message = $"History entry '{id}' reverted successfully." });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (NotSupportedException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
