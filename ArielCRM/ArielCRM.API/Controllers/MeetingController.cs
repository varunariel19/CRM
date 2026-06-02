using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MeetingsController(IMeetingService service, ILogger<MeetingsController> logger) : ControllerBase
    {
        private readonly IMeetingService _service = service;
        private readonly ILogger<MeetingsController> _logger = logger;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var meetings = await _service.GetAllMeetingsAsync();
                return Ok(meetings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all meetings.");
                return StatusCode(500, new { message = "An internal server error occurred while retrieving meetings." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMeetingDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var created = await _service.ScheduleMeetingAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while scheduling a new meeting.");
                return StatusCode(500, new { message = "An internal server error occurred while scheduling the meeting." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var success = await _service.DeleteMeetingAsync(id);
                if (!success) return NotFound(new { message = $"Meeting with ID {id} not found." });

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting meeting with ID: {MeetingId}", id);
                return StatusCode(500, new { message = "An internal server error occurred while deleting the meeting." });
            }
        }
    }
}
