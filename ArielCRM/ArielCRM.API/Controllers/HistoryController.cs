using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HistoryController(IHistoryService historyService) : ControllerBase
    {
        private readonly IHistoryService _historyService = historyService;

        // GET api/history
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] HistoryFilterDto filter)
        {
            try
            {
                var result = await _historyService.GetAllAsync(filter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET api/history/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var result = await _historyService.GetByIdAsync(id);
                return result is null
                    ? NotFound(new { message = $"Audit log '{id}' not found." })
                    : Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET api/history/entity/{entityName}/{entityId}
        [HttpGet("entity/{entityName}/{entityId}")]
        public async Task<IActionResult> GetByEntity(string entityName, string entityId)
        {
            try
            {
                var result = await _historyService.GetByEntityAsync(entityName, entityId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET api/history/batch/{batchId}
        [HttpGet("batch/{batchId}")]
        public async Task<IActionResult> GetByBatch(string batchId)
        {
            try
            {
                var result = await _historyService.GetByBatchAsync(batchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET api/history/{id}/children
        [HttpGet("{id}/children")]
        public async Task<IActionResult> GetChildLogs(string id)
        {
            try
            {
                var result = await _historyService.GetChildLogsAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // GET api/history/{id}/revert-history
        [HttpGet("{id}/revert-history")]
        public async Task<IActionResult> GetRevertHistory(string id)
        {
            try
            {
                var result = await _historyService.GetRevertHistoryAsync(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", details = ex.Message });
            }
        }

        // POST api/history/{id}/revert
        [HttpPost("{id}/revert")]
        public async Task<IActionResult> Revert(string id)
        {
            try
            {
                await _historyService.RevertAsync(id);
                return Ok(new { message = $"Audit log '{id}' reverted successfully." });
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
    }
}