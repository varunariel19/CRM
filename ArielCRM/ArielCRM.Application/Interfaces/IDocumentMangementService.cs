using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{
    public interface IDocumentMangementService
    {
        Task<List<RootDrive>> GetRootDrivesAsync();
        Task<FolderDto> CreateFolderAsync(CreateFolderRequest request, HttpContext context);
        Task<List<DocumentFile>> UploadFilesToFolderAsync(Guid? parentFolderId, List<IFormFile> files, string userId);
        Task<FolderContentsDto> GetFoldersAndFilesByParentIdAsync(Guid parentFolderId, string UserId);

        Task<Folder> RenameFolderAsync(Guid folderId, string newName);
        Task<DocumentFile> RenameFileAsync(Guid fileId, string newName);
        Task<Folder> MoveFolderAsync(Guid folderId, Guid? targetFolderId);

        Task<DocumentFile> MoveFileAsync(Guid fileId, Guid targetFolderId);
        Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId, string? newName);
        Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId, string? newName);

        Task<DocumentFile> DeleteFileAsync(Guid fileId);
        Task<Folder> DeleteFolderAsync(Guid folderId);


        Task<List<Folder>> GetBinFoldersAsync(string userId);
        Task<List<DocumentFile>> GetBinFilesAsync(string userId);


        Task<Folder> RestoreFolderAsync(Guid folderId);
        Task<DocumentFile> RestoreFileAsync(Guid fileId);
        Task PermanentlyDeleteFolderAsync(Guid folderId);
        Task PermanentlyDeleteFileAsync(Guid fileId);
        Task UpdateItemPropertiesAsync(UpdateItemPropertiesDto updateItemPropertiesDto, string requestingUserId);
        Task EmptyRecycleBinAsync();


    }
}