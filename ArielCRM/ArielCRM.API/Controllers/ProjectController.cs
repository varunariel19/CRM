using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [Route("api/projects")]
    [Authorize]
    [ApiController]
    public class ProjectController(IProjectService projectService, ILogger<ProjectController> logger, INotificationService notificationService) : ControllerBase
    {
        private readonly INotificationService _notificationService = notificationService;
        private readonly IProjectService _projectService = projectService;
        private readonly ILogger<ProjectController> _logger = logger;

        [HttpPost]
        [Authorize(Policy = "Permission:Projects.Create")]
        public async Task<IActionResult> Create([FromForm] CreateProjectDto dto)
        {
            try
            {
                var projectId = await _projectService.CreateAsync(dto);
                if (!string.IsNullOrEmpty(projectId))
                {
                    try
                    {
                        await _notificationService.CreateAsync(new CreateNotificationDto
                        {
                            UserIds = [dto.ProjectLeadId],
                            Title = "New project assigned to you",
                            Message = $"You've been assigned as project lead for \"{dto.Name}\"",
                            EntityType = "Lead",
                            EntityId = projectId,
                            Link = "projects"
                        });
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogError(notifyEx, "Failed to send assignment notification for project {projectId}", projectId);
                    }
                }

                return Ok(new
                {
                    Success = true,
                    Message = "Project created successfully",
                    ProjectId = projectId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpPut("{projectId}")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> Update(string projectId, [FromForm] UpdateProjectDto dto)
        {
            try
            {
                await _projectService.UpdateAsync(projectId, dto);

                return Ok(new
                {
                    Success = true,
                    Message = "Project updated successfully"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpDelete("{projectId}")]
        [Authorize(Policy = "Permission:Projects.Delete")]
        public async Task<IActionResult> Delete(string projectId)
        {
            try
            {
                await _projectService.DeleteAsync(projectId);

                return Ok(new
                {
                    Success = true,
                    Message = "Project deleted successfully"
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Success = false,
                    Message = ex.Message
                });
            }
        }

        [HttpGet]
        [Authorize(Policy = "Permission:Projects.View")]
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {

                var projects = await _projectService.GetAllAsync(HttpContext);
                return Ok(new { Success = true, Data = projects });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{projectId}")]
        [Authorize(Policy = "Permission:Projects.View")]
        public async Task<IActionResult> GetProjectById(string projectId)
        {
            try
            {
                var project = await _projectService.GetByIdAsync(projectId);
                if (project == null)
                    return NotFound(new { Success = false, Message = "Project not found" });

                return Ok(new { Success = true, Data = project });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        [HttpPatch("add-member")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> AddMemberToProject([FromQuery] string projectId, [FromQuery] string memberId)
        {
            try
            {
                var result = await _projectService.AddMemberToProjectAsync(projectId, memberId);
                return Ok(new
                {
                    Message = "Member added successfully."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }


        [HttpPatch("remove-member")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> RemoveMemberFromProject([FromQuery] string projectId, [FromQuery] string memberId)
        {

            try
            {
                await _projectService.RemoveMemberFromProjectAsync(projectId, memberId);

                return Ok(new
                {
                    Message = "Member removed successfully."
                });

            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }
    }
}