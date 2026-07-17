using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class DocumentManagementRepository(AppDbContext context) : IDocumentManagemntRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<List<Folder>> GetRootFoldersAsync()
        {
            return await _context.Folders
                .Where(f => f.ParentFolderId == null)
                .Include(f => f.ChildFolders)
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<List<Folder>> GetFoldersByParentIdAsync(Guid parentFolderId)
        {
            return await _context.Folders
                .Where(f => f.ParentFolderId == parentFolderId)
                .Include(f => f.ChildFolders)
                .Include(f => f.Files)
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<Folder?> GetByIdAsync(Guid folderId)
        {
            return await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == folderId);
        }

        public async Task<Folder> CreateFolderAsync(Folder folder)
        {
            _context.Folders.Add(folder);
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DocumentFile> CreateFileAsync(DocumentFile file)
        {
            _context.DocumentFiles.Add(file);
            await _context.SaveChangesAsync();
            return file;
        }
    }
}