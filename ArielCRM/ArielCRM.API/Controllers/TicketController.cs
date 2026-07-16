using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{

        [ApiController]
        [Route("api/[controller]")]
        [Authorize]
        public class TicketsController(ITicketService service, ILogger<TicketsController> logger) : ControllerBase
        {
            private readonly ITicketService _service = service;
            private readonly ILogger<TicketsController> _logger = logger;

        [HttpGet]
        public async Task<ActionResult<List<TicketDto>>> GetAll()
        {
           try
            {
                var tickets = await _service.GetAllTicketsAsync();
                return Ok(tickets);
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

            [HttpPost]
            public async Task<ActionResult<TicketDto>> Create([FromBody] CreateTicketDto dto)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                try
                {
                    var created = await _service.CreateTicketAsync(dto);
                    return CreatedAtAction(nameof(Search), new { searchTerm = "" }, created);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while creating a ticket.");
                    return StatusCode(500, new { message = "An error occurred while creating the ticket." });
                }
            }

            [HttpPatch("update-status")]
            public async Task<IActionResult> UpdateStatus([FromBody] UpdateTicketStatusDto dto)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                try
                {
                    var success = await _service.UpdateStatusAsync(dto);
                    if (!success) return NotFound(new { message = $"Ticket with ID {dto.Id} not found." });

                    return Ok(new { message = "Ticket status updated successfully." });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating status for ticket {TicketId}", dto.Id);
                    return StatusCode(500, new { message = "An error occurred while modifying status." });
                }
            }

            [HttpPatch("update-priority")]
            public async Task<IActionResult> UpdatePriority([FromBody] UpdateTicketPriorityDto dto)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                try
                {
                    var success = await _service.UpdatePriorityAsync(dto);
                    if (!success) return NotFound(new { message = $"Ticket with ID {dto.Id} not found." });

                    return Ok(new { message = "Ticket priority updated successfully." });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating priority for ticket {TicketId}", dto.Id);
                    return StatusCode(500, new { message = "An error occurred while modifying priority." });
                }
            }

            [HttpPatch("update-assignee")]
            public async Task<IActionResult> UpdateAssignee([FromBody] UpdateTicketAssigneeDto dto)
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);

                try
                {
                    var success = await _service.UpdateAssigneeAsync(dto);
                    if (!success) return NotFound(new { message = $"Ticket with ID {dto.Id} not found." });

                    return Ok(new { message = "Ticket assignee updated successfully." });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while updating assignee for ticket {TicketId}", dto.Id);
                    return StatusCode(500, new { message = "An error occurred while modifying assignee." });
                }
            }

            [HttpDelete("{id}")]
            public async Task<IActionResult> Delete(string id)
            {
                try
                {
                    var success = await _service.DeleteTicketAsync(id);
                    if (!success) return NotFound();

                    return NoContent();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while deleting ticket {TicketId}", id);
                    return StatusCode(500, new { message = "An error occurred while processing deletion." });
                }
            }

            [HttpGet("search")]
            public async Task<IActionResult> Search([FromQuery] string searchTerm = "")
            {
                try
                {
                    var results = await _service.SearchTicketsAsync(searchTerm);
                    return Ok(results);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred during ticket search for phrase: {SearchTerm}", searchTerm);
                    return StatusCode(500, new { message = "An error occurred while gathering search configurations." });
                }
            }
        }
}
