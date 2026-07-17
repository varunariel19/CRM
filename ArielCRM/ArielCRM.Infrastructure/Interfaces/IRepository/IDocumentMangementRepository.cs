using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IDocumentManagemntRepository
    {
        Task<List<Folder>> GetRootFoldersAsync();
        Task<List<Folder>> GetFoldersByParentIdAsync(Guid parentFolderId);
        Task<DocumentFile> CreateFileAsync(DocumentFile file);
        Task<Folder> CreateFolderAsync(Folder folder);
        Task<Folder?> GetByIdAsync(Guid folderId);
    }
}