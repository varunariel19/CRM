using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.EntityFrameworkCore.Storage;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IDocumentManagementRepository
    {
        Task<List<RootDrive>> GetRootDrivesAsync();

        Task<RootDrive?> GetRootDriveByIdAsync(Guid driveId);
        Task<List<Folder>> GetFoldersByParentIdAsync(Guid parentFolderId, string AccessLevelId, string userId);
        Task<List<DocumentFile>> GetFilesByParentIdAsync(Guid parentFolderId, string accessLevelId, string userId);
        Task<Folder?> GetByIdAsync(Guid folderId);
        Task<Folder> CreateFolderAsync(Folder folder);
        Task<DocumentFile> CreateFileAsync(DocumentFile file);

        // --- new ---
        Task<Folder?> GetFolderByIdAsync(Guid folderId);
        Task<DocumentFile?> GetFileByIdAsync(Guid fileId);
        Task<bool> IsFolderNameTakenAsync(Guid? parentFolderId, string name, Guid excludeFolderId);
        Task<bool> IsFileNameTakenAsync(Guid parentFolderId, string name, Guid excludeFileId);
        Task<Folder> RenameFolderAsync(Guid folderId, string newName);
        Task<DocumentFile> RenameFileAsync(Guid fileId, string newName);



        Task<bool> IsFolderAncestorOfAsync(Guid folderId, Guid? targetFolderId);
        Task<Folder> MoveFolderAsync(Guid folderId, Guid? targetFolderId);
        Task<DocumentFile> MoveFileAsync(Guid fileId, Guid targetFolderId);
        Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId, string? newName = null, bool isTopLevelCall = true);
        Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId, string? newName = null, bool isTopLevelCall = true);


        Task<DocumentFile> DeleteFileAsync(Guid fileId, bool isDeletedAsRoot);
        Task<Folder> DeleteFolderAsync(Guid folderId, bool isDeletedAsRoot);


        Task<List<Folder>> BinDeletedFoldersAsync(string userId);
        Task<List<DocumentFile>> BinDeletedFilesAsync(string userId);


        Task<Folder> RestoreFolderAsync(Guid folderId, bool isRoot);
        Task<DocumentFile> RestoreFileAsync(Guid fileId, bool isRoot);
        Task PermanentlyDeleteFolderAsync(Guid folderId);
        Task PermanentlyDeleteFileAsync(Guid fileId);
        Task<IDbContextTransaction> BeginTransactionAsync();

        Task EmptyRecycleBinAsync();

        Task UpdateAsync(Folder folder);

        Task UpdateRootDriveAsync(RootDrive rootDrive);

        Task<DocumentFile?> GetDeletedFileByIdAsync(Guid fileId);
        Task<Folder?> GetDeletedFolderByIdAsync(Guid folderId);

        Task UpdateItemPropertiesAsync(UpdateItemPropertiesDto dto, string requestingUserId);
    }



}