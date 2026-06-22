using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TaskManagementController(ITaskManagementService service) : ControllerBase
    {
        private readonly ITaskManagementService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetAllTasksAsync()
        {
            try
            {
                var tasks = await _service.GetAllAsync();
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while retrieving tasks.", Details = ex.Message });
            }
        }

        [HttpGet("{taskId}")]
        public async Task<IActionResult> GetTaskByIdAsync(string taskId)
        {
            try
            {
                var task = await _service.GetByIdAsync(taskId);

                if (task == null)
                    return NotFound();

                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"An error occurred while retrieving task {taskId}.", Details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateTaskAsync(CreateTaskDto dto)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
                var taskId = await _service.CreateAsync(dto, userId);

                return Ok(new
                {
                    Success = true,
                    TaskId = taskId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while creating the task.", Details = ex.Message });
            }
        }

        [HttpPut("{taskId}")]
        public async Task<IActionResult> UpdateTaskAsync(string taskId, UpdateTaskDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(taskId, dto);

                if (!updated)
                    return NotFound();

                return Ok(new
                {
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"An error occurred while updating task {taskId}.", Details = ex.Message });
            }
        }

        [HttpDelete("{taskId}")]
        public async Task<IActionResult> DeleteTaskAsync(string taskId)
        {
            try
            {
                var deleted = await _service.DeleteAsync(taskId);

                if (!deleted)
                    return NotFound();

                return Ok(new
                {
                    Success = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = $"An error occurred while deleting task {taskId}.", Details = ex.Message });
            }
        }
    }
}