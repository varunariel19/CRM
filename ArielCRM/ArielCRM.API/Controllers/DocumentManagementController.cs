using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs.ArielCRM.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.Api.Controllers
{
    [ApiController]
    [Route("api/folders")]
    [Authorize]
    public class DocumentManagementController(IDocumentMangementService folderService) : ControllerBase
    {
        private readonly IDocumentMangementService _folderService = folderService;

        [HttpGet("root-folders")]
        public async Task<IActionResult> GetRootFolders()
        {
            var folders = await _folderService.GetRootFoldersAsync();
            return Ok(folders);
        }

        [HttpPost("create-folder")]
        public async Task<ActionResult<FolderDto>> CreateFolder([FromBody] CreateFolderRequest request)
        {
            try
            {
                var folder = await _folderService.CreateFolderAsync(request, HttpContext);
                return Ok(folder);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("upload-file")]
        public async Task<ActionResult<List<FileDto>>> UploadFile([FromForm] UploadFileRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                var result = await _folderService.UploadFilesToFolderAsync(request.ParentFolderId, request.Files, userId);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{parentFolderId:guid}/children")]
        public async Task<IActionResult> GetFoldersByParentId(Guid parentFolderId)
        {
            try
            {
                var folders = await _folderService.GetFoldersByParentIdAsync(parentFolderId);
                return Ok(folders);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}