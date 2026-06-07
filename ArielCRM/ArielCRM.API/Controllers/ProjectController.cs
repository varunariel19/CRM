using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [Route("api/projects")]
    [ApiController]
    public class ProjectController(IProjectService projectService) : ControllerBase
    {
        private readonly IProjectService _projectService = projectService;

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateProjectDto dto)
        {
            try
            {
                var projectId = await _projectService.CreateAsync(dto);
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
        public async Task<IActionResult> GetAllProjects()
        {
            try
            {
                var projects = await _projectService.GetAllAsync();
                return Ok(new { Success = true, Data = projects });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("{projectId}")]
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

    }
}