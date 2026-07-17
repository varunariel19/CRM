using ArielCRM.Infrastructure.DTOs.ArielCRM.Application.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{
    public interface IDocumentMangementService
    {
        Task<List<FolderDto>> GetRootFoldersAsync();
        Task<FolderDto> CreateFolderAsync(CreateFolderRequest request, HttpContext context);
        Task<List<FileDto>> UploadFilesToFolderAsync(Guid? parentFolderId, List<IFormFile> files, string userId);
        Task<List<FolderDto>> GetFoldersByParentIdAsync(Guid parentFolderId);
    }
}