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
    public class TaskManagementController(ITaskManagementService service, ILogger<ProjectController> logger, INotificationService notificationService) : ControllerBase
    {
        private readonly INotificationService _notificationService = notificationService;
        private readonly ILogger<ProjectController> _logger = logger;
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
                var task = await _service.CreateAsync(dto, userId);


                if (task != null && !string.IsNullOrEmpty(task.TaskId))
                {
                    try
                    {
                        await _notificationService.CreateAsync(new CreateNotificationDto
                        {
                            UserIds = [dto.AssignToId ?? ""],
                            Title = "New ticket assigned to you",
                            Message = $"You've been assigned to ticket \"{dto.Title[..15]}...\"",
                            EntityType = "Ticket",
                            EntityId = task.TaskId,
                            Link = "tickets"
                        });
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogError(notifyEx, "Failed to send assignment notification for task {taskId}", task.TaskId);
                    }
                }


                return Ok(new
                {
                    Success = true,
                    task
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
                var existing = await _service.GetByIdAsync(taskId);
                if (existing == null) return BadRequest("No ticket exists with this task Id");

                var changes = new List<string>();
                if (dto.Status.HasValue && dto.Status.ToString() != existing.Status)
                    changes.Add($"status to {dto.Status}");
                if (dto.Priority.HasValue && dto.Priority.ToString() != existing.Priority)
                    changes.Add($"priority to {dto.Priority}");
                if (dto.AssignToId is not null && dto.AssignToId != existing.Assignee.Id)
                    changes.Add("assignee");
                if (!string.IsNullOrWhiteSpace(dto.Title) && dto.Title != existing.Title)
                    changes.Add("title");
                if (!string.IsNullOrWhiteSpace(dto.Description) && dto.Description != existing.Description)
                    changes.Add("description");

                var updated = await _service.UpdateAsync(taskId, dto);
                if (!updated) return NotFound();

                if (changes.Count > 0)
                {
                    var recipientId = dto.AssignToId ?? existing.Assignee.Id;

                    if (!string.IsNullOrWhiteSpace(recipientId))
                    {
                        try
                        {
                            var ticketLabel = !string.IsNullOrWhiteSpace(existing.Title) ? $"\"{existing.Title}\"" : "your ticket";
                            var changeSummary = string.Join(", ", changes);

                            await _notificationService.CreateAsync(new CreateNotificationDto
                            {
                                UserIds = [recipientId],
                                Title = "Ticket updated",
                                Message = $"{ticketLabel} was updated ({changeSummary})",
                                EntityType = "Ticket",
                                EntityId = taskId,
                                Link = "task-management"
                            });
                        }
                        catch (Exception notifyEx)
                        {
                            _logger.LogError(notifyEx, "Failed to send update notification for task {TaskId}", taskId);
                        }
                    }
                }

                return Ok(new { Success = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating task {TaskId}", taskId);
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