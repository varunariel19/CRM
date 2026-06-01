using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CrmTasksController(ICrmTaskService service, ILogger<CrmTasksController> logger) : ControllerBase
    {
        private readonly ICrmTaskService _service = service;
        private readonly ILogger<CrmTasksController> _logger = logger;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var tasks = await _service.GetAllAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all CRM tasks.");
                return StatusCode(500, new { message = "An internal server error occurred while processing your request." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCrmTaskDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetAll), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a CRM task.");
                return StatusCode(500, new { message = "An internal server error occurred while processing your request." });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await _service.DeleteAsync(id);
                if (!deleted) return NotFound();
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting CRM task with ID: {TaskId}", id);
                return StatusCode(500, new { message = "An internal server error occurred while processing your request." });
            }
        }

        [HttpPatch("update-status")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateTaskStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var isUpdated = await _service.UpdateTaskStatusAsync(dto);
                if (!isUpdated)
                {
                    return NotFound(new { message = $"Task with ID {dto.Id} not found or update failed." });
                }

                return Ok(new { message = "Task status updated successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating status for CRM task with ID: {TaskId}", dto.Id);
                return StatusCode(500, new { message = "An internal server error occurred while processing your request." });
            }
        }
    }
}