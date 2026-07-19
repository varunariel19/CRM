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

        public async Task<List<DocumentFile>> GetFilesByParentIdAsync(Guid parentFolderId)
        {
            return await _context.DocumentFiles
                .AsNoTracking()
                .Where(f => f.FolderId == parentFolderId)
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

        public async Task<Folder?> GetFolderByIdAsync(Guid folderId)
        {
            return await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == folderId);
        }

        public async Task<DocumentFile?> GetFileByIdAsync(Guid fileId)
        {
            return await _context.DocumentFiles
                .FirstOrDefaultAsync(f => f.Id == fileId);
        }

        public async Task<bool> IsFolderNameTakenAsync(Guid? parentFolderId, string name, Guid excludeFolderId)
        {
            return await _context.Folders.AnyAsync(f =>
                f.ParentFolderId == parentFolderId &&
                f.Id != excludeFolderId &&
                f.Name.ToLower() == name.ToLower());
        }

        public async Task<bool> IsFileNameTakenAsync(Guid parentFolderId, string name, Guid excludeFileId)
        {
            return await _context.DocumentFiles
                .Where(f => !f.IsDeleted)
                .AnyAsync(f =>
                    f.FolderId == parentFolderId &&
                    f.Id != excludeFileId &&
                    f.Name.ToLower() == name.ToLower());
        }

        public async Task<Folder> RenameFolderAsync(Guid folderId, string newName)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException($"Folder {folderId} not found.");

            folder.Name = newName;
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DocumentFile> RenameFileAsync(Guid fileId, string newName)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException($"File {fileId} not found.");

            file.Name = newName;
            string extension = file.FileName.ToString().Split('.')[1];
            file.FileName = $"{newName}.{extension}";
            await _context.SaveChangesAsync();
            return file;
        }


        public async Task<bool> IsFolderAncestorOfAsync(Guid folderId, Guid? targetFolderId)
        {
            var currentId = targetFolderId;
            while (currentId != null)
            {
                if (currentId == folderId) return true;
                var current = await _context.Folders
                    .AsNoTracking()
                    .FirstOrDefaultAsync(f => f.Id == currentId);
                currentId = current?.ParentFolderId;
            }
            return false;
        }

        public async Task<Folder> MoveFolderAsync(Guid folderId, Guid? targetFolderId)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            folder.ParentFolderId = targetFolderId;
            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DocumentFile> MoveFileAsync(Guid fileId, Guid targetFolderId)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            var nameTaken = await _context.DocumentFiles
                .Where(d => !d.IsDeleted)
                .AnyAsync(d => d.FolderId == targetFolderId
                            && d.Id != fileId
                            && d.Name.ToLower() == file.Name.ToLower());

            if (nameTaken)
                throw new InvalidOperationException("A file with this name already exists in the target folder.");

            file.FolderId = targetFolderId;
            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId)
        {
            var original = await _context.DocumentFiles.AsNoTracking().FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            var copy = new DocumentFile
            {
                Id = Guid.NewGuid(),
                Name = original.Name,
                FileName = original.FileName,
                ContentType = original.ContentType,
                StoragePath = original.StoragePath,
                Url = original.Url,
                UrlExpiresAt = original.UrlExpiresAt,
                Size = original.Size,
                IsHidden = original.IsHidden,
                IsDeleted = false,
                DeletedAt = null,
                FolderId = targetFolderId,
                UserId = original.UserId,
                UploadedAt = DateTime.UtcNow,
                UpdatedAt = null,
                RowVersion = null,
                AllowedUsersId = original.AllowedUsersId,
            };

            _context.DocumentFiles.Add(copy);
            await _context.SaveChangesAsync();
            return copy;
        }

        public async Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId)
        {
            var original = await _context.Folders.AsNoTracking().FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var copy = new Folder
            {
                Id = Guid.NewGuid(),
                Name = original.Name,
                FolderKey = Guid.NewGuid().ToString(),
                ParentFolderId = targetFolderId,
                IsSystem = false,
                CanCreate = original.CanCreate,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Folders.Add(copy);
            await _context.SaveChangesAsync();

            var childFolders = await _context.Folders.AsNoTracking()
                .Where(f => f.ParentFolderId == folderId).ToListAsync();
            foreach (var child in childFolders)
                await CopyFolderAsync(child.Id, copy.Id);

            var childFiles = await _context.DocumentFiles.AsNoTracking()
                .Where(f => f.FolderId == folderId).ToListAsync();
            foreach (var child in childFiles)
                await CopyFileAsync(child.Id, copy.Id);

            return copy;
        }


        public async Task<DocumentFile> DeleteFileAsync(Guid fileId)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            file.IsDeleted = true;
            file.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<Folder> DeleteFolderAsync(Guid folderId)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            folder.IsDeleted = true;
            folder.DeletedAt = DateTime.UtcNow;

            var childFolders = await _context.Folders
                .Where(f => f.ParentFolderId == folderId && !f.IsDeleted)
                .ToListAsync();
            foreach (var child in childFolders)
                await DeleteFolderAsync(child.Id);

            var childFiles = await _context.DocumentFiles
                .Where(f => f.FolderId == folderId && !f.IsDeleted)
                .ToListAsync();
            foreach (var file in childFiles)
                await DeleteFileAsync(file.Id);

            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<List<Folder>> BinDeletedFoldersAsync(string userId)
        {
            return await _context.Folders
            .IgnoreQueryFilters()
                .Where(f => f.IsDeleted &&
                            (f.UserId == userId || f.AllowedUsersId.Contains(userId)))
                .OrderByDescending(f => f.DeletedAt)
                .ToListAsync();
        }

        public async Task<List<DocumentFile>> BinDeletedFilesAsync(string userId)
        {
            return await _context.DocumentFiles
            .IgnoreQueryFilters()
                .Where(f => f.IsDeleted == true &&
                            (f.UserId == userId || f.AllowedUsersId.Contains(userId)))
                .OrderByDescending(f => f.DeletedAt)
                .ToListAsync();
        }

        public async Task<Folder> RestoreFolderAsync(Guid folderId)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            folder.IsDeleted = false;
            folder.DeletedAt = null;

            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DocumentFile> RestoreFileAsync(Guid fileId)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            file.IsDeleted = false;
            file.DeletedAt = null;

            await _context.SaveChangesAsync();
            return file;
        }

        public async Task PermanentlyDeleteFolderAsync(Guid folderId)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var childFolders = await _context.Folders
                .Where(f => f.ParentFolderId == folderId)
                .ToListAsync();
            foreach (var child in childFolders)
                await PermanentlyDeleteFolderAsync(child.Id);

            var childFiles = await _context.DocumentFiles
                .Where(f => f.FolderId == folderId)
                .ToListAsync();
            foreach (var file in childFiles)
                await PermanentlyDeleteFileAsync(file.Id);

            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync();
        }

        public async Task PermanentlyDeleteFileAsync(Guid fileId)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            _context.DocumentFiles.Remove(file);
            await _context.SaveChangesAsync();
        }


    }


}