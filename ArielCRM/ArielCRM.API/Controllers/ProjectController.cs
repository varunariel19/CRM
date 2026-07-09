using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/projects")]
    [Authorize]
    public class ProjectController(
        IProjectService projectService,
        IDocumentService documentService,
        ILogger<ProjectController> logger,
        INotificationService notificationService) : ControllerBase
    {
        // GET: api/projects
        [HttpGet]
        [Authorize(Policy = "Permission:Projects.View")]
        public async Task<IActionResult> GetProjects()
        {
            try
            {
                var projects = await projectService.GetAllAsync(HttpContext);
                return Ok(new { Success = true, Data = projects });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        // GET: api/projects/{projectId}
        [HttpGet("{projectId}")]
        [Authorize(Policy = "Permission:Projects.View")]
        public async Task<IActionResult> GetProjectById(string projectId)
        {
            try
            {
                var project = await projectService.GetByIdAsync(projectId);
                if (project == null)
                    return NotFound(new { Success = false, Message = "Project not found" });

                return Ok(new { Success = true, Data = project });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        // POST: api/projects
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize(Policy = "Permission:Projects.Create")]
        public async Task<IActionResult> CreateProject([FromForm] CreateProjectDto dto)
        {
            try
            {
                var projectId = await projectService.FinalizeCreateAsync(dto);
                if (!string.IsNullOrEmpty(projectId))
                {
                    try
                    {
                        if (!string.IsNullOrWhiteSpace(dto.ProjectLeadId))
                        {
                            await notificationService.CreateAsync(new CreateNotificationDto
                            {
                                UserIds = [dto.ProjectLeadId],
                                Title = "New project assigned to you",
                                Message = $"You've been assigned as project lead for \"{dto.Name}\"",
                                EntityType = "Project",
                                EntityId = projectId,
                                Link = "projects"
                            });
                        }
                    }
                    catch (Exception notifyEx)
                    {
                        logger.LogError(notifyEx, "Failed to send assignment notification for project {projectId}", projectId);
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

        // POST: api/projects/for-lead
        [HttpPost("for-lead")]
        [Authorize(Policy = "Permission:Projects.Create")]
        public async Task<IActionResult> CreateProjectForLead([FromBody] CreateProjectForLeadDto dto)
        {
            try
            {
                var project = await projectService.CreateProjectForLeadAsync(dto);
                return Ok(new
                {
                    Success = true,
                    Message = "Project added to lead successfully",
                    Data = project
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

        // PUT: api/projects/{projectId}
        [HttpPut("{projectId}")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> UpdateProject(string projectId, [FromForm] UpdateProjectDto dto)
        {
            try
            {
                await projectService.UpdateAsync(projectId, dto);

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

        // DELETE: api/projects/{projectId}
        [HttpDelete("{projectId}")]
        [Authorize(Policy = "Permission:Projects.Delete")]
        public async Task<IActionResult> DeleteProject(string projectId)
        {
            try
            {
                await projectService.DeleteAsync(projectId);

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

        // PATCH: api/projects/add-member
        [HttpPatch("add-member")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> AddMemberToProject([FromQuery] string projectId, [FromQuery] string memberId)
        {
            try
            {
                await projectService.AddMemberToProjectAsync(projectId, memberId);
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

        // PATCH: api/projects/remove-member
        [HttpPatch("remove-member")]
        [Authorize(Policy = "Permission:Projects.Edit")]
        public async Task<IActionResult> RemoveMemberFromProject([FromQuery] string projectId, [FromQuery] string memberId)
        {
            try
            {
                await projectService.RemoveMemberFromProjectAsync(projectId, memberId);

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


        [HttpGet("changes")]
        public async Task<IActionResult> GetChanges([FromQuery] DateTime since)
        {
            var result = await projectService.GetUpdatedTasksAsync(HttpContext, since);
            return Ok(result);
        }


        [HttpDelete("remove-document/{docId}")]
        public async Task<IActionResult> RemoveDocument(string docId)
        {
            var deleted = await documentService.DeleteDocumentAsync(docId);

            if (!deleted)
                return NotFound(new { message = $"Document '{docId}' not found." });

            return NoContent();
        }


        [HttpPost("add-document/{projectId}")]
        public async Task<IActionResult> AddDocumentAsync(string projectId, [FromForm] List<IFormFile> documents)
        {
            try
            {
                var uploaded = await documentService.UploadDocumentsAsync(documents, projectId);
                return Ok(uploaded);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


    }
}
