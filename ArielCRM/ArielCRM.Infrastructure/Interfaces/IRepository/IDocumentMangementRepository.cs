using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IDocumentManagemntRepository
    {
        Task<List<Folder>> GetRootFoldersAsync();
        Task<List<Folder>> GetFoldersByParentIdAsync(Guid parentFolderId);
        Task<List<DocumentFile>> GetFilesByParentIdAsync(Guid parentFolderId);
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
        Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId);
        Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId);


        Task<DocumentFile> DeleteFileAsync(Guid fileId);
        Task<Folder> DeleteFolderAsync(Guid folderId);


        Task<List<Folder>> BinDeletedFoldersAsync(string userId);
        Task<List<DocumentFile>> BinDeletedFilesAsync(string userId);


        Task<Folder> RestoreFolderAsync(Guid folderId);
        Task<DocumentFile> RestoreFileAsync(Guid fileId);
        Task PermanentlyDeleteFolderAsync(Guid folderId);
        Task PermanentlyDeleteFileAsync(Guid fileId);
    }



}