using ArielCRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/ticket-history")]
    [Authorize]
    public class TicketHistoryController(ITicketHistoryService service, ILogger<TicketHistoryController> logger) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await service.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch ticket history");
                return StatusCode(500, new { message = "An error occurred while fetching ticket history." });
            }
        }

        [HttpGet("{ticketId}")]
        public async Task<IActionResult> GetByTicketId(string ticketId)
        {
            try
            {
                var result = await service.GetByTicketIdAsync(ticketId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to fetch ticket history for TicketId {TicketId}", ticketId);
                return StatusCode(500, new { message = "An error occurred while fetching ticket history." });
            }
        }
    }
}