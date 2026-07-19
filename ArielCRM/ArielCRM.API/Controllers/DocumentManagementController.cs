using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.Api.Controllers
{
    [ApiController]
    [Route("api/documents")]
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
                var folders = await _folderService.GetFoldersAndFilesByParentIdAsync(parentFolderId);
                return Ok(folders);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }


        [HttpPatch("folders/{folderId:guid}/rename")]
        public async Task<IActionResult> RenameFolder(Guid folderId, [FromQuery] string newName)
        {
            try
            {
                var folder = await _folderService.RenameFolderAsync(folderId, newName);
                return Ok(folder);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPatch("files/{fileId:guid}/rename")]
        public async Task<IActionResult> RenameFile(Guid fileId, [FromQuery] string newName)
        {
            try
            {
                var file = await _folderService.RenameFileAsync(fileId, newName);
                return Ok(file);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }


        [HttpPatch("folders/{folderId:guid}/move")]
        public async Task<IActionResult> MoveFolder(Guid folderId, [FromQuery] Guid? targetFolderId)
        {
            try
            {
                var folder = await _folderService.MoveFolderAsync(folderId, targetFolderId);
                return Ok(folder);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        [HttpPatch("files/{fileId:guid}/move")]
        public async Task<IActionResult> MoveFile(Guid fileId, [FromQuery] Guid targetFolderId)
        {
            try
            {
                var file = await _folderService.MoveFileAsync(fileId, targetFolderId);
                return Ok(file);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        [HttpPost("folders/{folderId:guid}/copy")]
        public async Task<IActionResult> CopyFolder(Guid folderId, [FromQuery] Guid? targetFolderId)
        {
            try
            {
                var folder = await _folderService.CopyFolderAsync(folderId, targetFolderId);
                return Ok(folder);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }

        [HttpPost("files/{fileId:guid}/copy")]
        public async Task<IActionResult> CopyFile(Guid fileId, [FromQuery] Guid targetFolderId)
        {
            try
            {
                var file = await _folderService.CopyFileAsync(fileId, targetFolderId);
                return Ok(file);
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        }



        [HttpDelete("files/{fileId:guid}")]
        public async Task<ActionResult<DocumentFile>> DeleteFile(Guid fileId)
        {
            try
            {
                return Ok(await _folderService.DeleteFileAsync(fileId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("folders/{folderId:guid}")]
        public async Task<ActionResult<Folder>> DeleteFolder(Guid folderId)
        {
            try
            {
                return Ok(await _folderService.DeleteFolderAsync(folderId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }



        [HttpGet("bin/folders")]
        public async Task<ActionResult<List<Folder>>> GetBinFolders()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            return Ok(await _folderService.GetBinFoldersAsync(userId));
        }

        [HttpGet("bin/files")]
        public async Task<ActionResult<List<DocumentFile>>> GetBinFiles()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            return Ok(await _folderService.GetBinFilesAsync(userId));
        }




        [HttpPut("bin/folders/{folderId:guid}/restore")]
        public async Task<ActionResult<Folder>> RestoreFolder(Guid folderId)
        {
            try
            {
                return Ok(await _folderService.RestoreFolderAsync(folderId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("bin/files/{fileId:guid}/restore")]
        public async Task<ActionResult<DocumentFile>> RestoreFile(Guid fileId)
        {
            try
            {
                return Ok(await _folderService.RestoreFileAsync(fileId));
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("bin/folders/{folderId:guid}")]
        public async Task<IActionResult> PermanentlyDeleteFolder(Guid folderId)
        {
            try
            {
                await _folderService.PermanentlyDeleteFolderAsync(folderId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("bin/files/{fileId:guid}")]
        public async Task<IActionResult> PermanentlyDeleteFile(Guid fileId)
        {
            try
            {
                await _folderService.PermanentlyDeleteFileAsync(fileId);
                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


    }


}