using System.Text.RegularExpressions;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Configuration;

namespace ArielCRM.Infrastructure.Repositories
{
    public class DocumentManagementRepository(AppDbContext context, IAppwriteStorageService storageService, IConfiguration configuration) : IDocumentManagementRepository
    {
        private readonly AppDbContext _context = context;
        private readonly IAppwriteStorageService _storageService = storageService;

        private readonly IConfiguration _configuration = configuration;

        public async Task<List<RootDrive>> GetRootDrivesAsync()
        {
            return await _context.RootDrives
                .Include(f => f.Folders)
                .OrderBy(f => f.DriveKey)
                .ToListAsync();
        }

        public async Task<List<Folder>> GetFoldersByParentIdAsync(Guid parentFolderId, string accessLevelId, string userId)
        {
            // var isAdmin = _configuration["Seeding:AdminLevel"] == accessLevelId;

            var query = _context.Folders
                .Where(f => f.ParentFolderId == parentFolderId && !f.IsDeleted);

            // if (!isAdmin)
            // {
            //     query = query.Where(f => f.AllowedUsersId.Contains(userId) || f.UserId == userId);
            // }

            return await query
                .Include(f => f.ChildFolders)
                .Include(f => f.Files)
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<List<DocumentFile>> GetFilesByParentIdAsync(Guid parentFolderId, string accessLevelId, string userId)
        {
            // var isAdmin = _configuration["Seeding:AdminLevel"] == accessLevelId;

            var query = _context.DocumentFiles
                .AsNoTracking()
                .Where(f => f.FolderId == parentFolderId);

            // if (!isAdmin)
            // {
            //     query = query.Where(f => f.AllowedUsersId.Contains(userId) || f.UserId == userId);
            // }

            return await query
                .OrderBy(f => f.Name)
                .ToListAsync();
        }

        public async Task<Folder?> GetByIdAsync(Guid folderId)
        {
            return await _context.Folders
                .FirstOrDefaultAsync(f => f.Id == folderId);
        }

        public async Task<RootDrive?> GetRootDriveByIdAsync(Guid driveId)
        {
            return await _context.RootDrives
              .FirstOrDefaultAsync(f => f.Id == driveId);
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


        public async Task<Folder?> GetDeletedFolderByIdAsync(Guid folderId)
        {
            return await _context.Folders.IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.Id == folderId);
        }


        public async Task<DocumentFile?> GetDeletedFileByIdAsync(Guid fileId)
        {
            return await _context.DocumentFiles.IgnoreQueryFilters()
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

        public async Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId, string? newName = null, bool isTopLevelCall = true)
        {
            var original = await _context.DocumentFiles.AsNoTracking().FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            var finalFileName = original.FileName;
            var finalName = original.Name;

            if (isTopLevelCall)
            {
                var siblingFileNames = await _context.DocumentFiles.AsNoTracking()
                    .Where(f => f.FolderId == targetFolderId && !f.IsDeleted)
                    .Select(f => f.FileName)
                    .ToListAsync();

                var baseName = string.IsNullOrWhiteSpace(newName) ? original.FileName : newName;
                finalFileName = GenerateUniqueName(baseName, siblingFileNames, isFile: true);

                // Keep Name in sync with FileName (same base, no extension logic needed
                // if Name never carries an extension in your data — adjust if it does).
                finalName = string.IsNullOrWhiteSpace(newName) ? original.Name : finalFileName;
            }

            var copy = new DocumentFile
            {
                Id = Guid.NewGuid(),
                Name = finalName,
                FileName = finalFileName,
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

        public async Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId, string? newName = null, bool isTopLevelCall = true)
        {
            var original = await _context.Folders.AsNoTracking().FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var finalName = original.Name;

            if (isTopLevelCall)
            {
                var siblingFolderNames = await _context.Folders.AsNoTracking()
                    .Where(f => f.ParentFolderId == targetFolderId)
                    .Select(f => f.Name)
                    .ToListAsync();

                var baseName = string.IsNullOrWhiteSpace(newName) ? original.Name : newName;
                finalName = GenerateUniqueName(baseName, siblingFolderNames, isFile: false);
            }

            var copy = new Folder
            {
                Id = Guid.NewGuid(),
                Name = finalName,
                FolderKey = Guid.NewGuid().ToString(),
                ParentFolderId = targetFolderId,
                IsSystem = false,
                UserId = original.UserId,
                AllowedUsersId = original.AllowedUsersId,
                CanCreate = original.CanCreate,
                CreatedAt = DateTime.UtcNow,
            };
            _context.Folders.Add(copy);
            await _context.SaveChangesAsync();

            var childFolders = await _context.Folders.AsNoTracking()
                .Where(f => f.ParentFolderId == folderId).ToListAsync();
            foreach (var child in childFolders)
                await CopyFolderAsync(child.Id, copy.Id, newName: null, isTopLevelCall: false);

            var childFiles = await _context.DocumentFiles.AsNoTracking()
                .Where(f => f.FolderId == folderId).ToListAsync();
            foreach (var child in childFiles)
                await CopyFileAsync(child.Id, copy.Id, newName: null, isTopLevelCall: false);

            return copy;
        }

        private static readonly Regex CopySuffixRegex = new(@" \(Copy(?: (\d+))?\)$", RegexOptions.Compiled);

        private static string GenerateUniqueName(string baseName, List<string> existingNames, bool isFile)
        {
            var existing = new HashSet<string>(existingNames, StringComparer.OrdinalIgnoreCase);

            string namePart = baseName;
            string ext = "";
            if (isFile)
            {
                var lastDot = baseName.LastIndexOf('.');
                if (lastDot > 0)
                {
                    namePart = baseName[..lastDot];
                    ext = baseName[lastDot..];
                }
            }

            var rootName = CopySuffixRegex.Replace(namePart, "");

            var candidate = $"{rootName} (Copy){ext}";
            if (!existing.Contains(candidate)) return candidate;

            var n = 1;
            candidate = $"{rootName} (Copy {n}){ext}";
            while (existing.Contains(candidate))
            {
                n++;
                candidate = $"{rootName} (Copy {n}){ext}";
            }
            return candidate;
        }


        public async Task<DocumentFile> DeleteFileAsync(Guid fileId, bool isDeletedAsRoot)
        {
            var file = await _context.DocumentFiles.FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            file.IsDeleted = true;
            file.IsDeletedAsRoot = isDeletedAsRoot;
            file.DeletedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return file;
        }

        public async Task<Folder> DeleteFolderAsync(Guid folderId, bool isDeletedAsRoot)
        {
            var folder = await _context.Folders.FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            folder.IsDeleted = true;
            folder.IsDeletedAsRoot = isDeletedAsRoot;
            folder.DeletedAt = DateTime.UtcNow;

            var childFolders = await _context.Folders.IgnoreQueryFilters()
                .Where(f => f.ParentFolderId == folderId && !f.IsDeleted)
                .ToListAsync();
            foreach (var child in childFolders)
            {
                if (!child.IsDeletedAsRoot)
                {
                    await DeleteFolderAsync(child.Id, false);
                }
            }

            var childFiles = await _context.DocumentFiles
                .Where(f => f.FolderId == folderId && !f.IsDeleted)
                .ToListAsync();
            foreach (var file in childFiles)
            {
                if (!file.IsDeletedAsRoot) await DeleteFileAsync(file.Id, false);
            }

            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<List<Folder>> BinDeletedFoldersAsync(string userId)
        {
            return await _context.Folders
            .IgnoreQueryFilters()
                .Where(f => f.IsDeletedAsRoot &&
                            (f.UserId == userId || f.AllowedUsersId.Contains(userId)))
                .OrderByDescending(f => f.DeletedAt)
                .ToListAsync();
        }

        public async Task<List<DocumentFile>> BinDeletedFilesAsync(string userId)
        {
            return await _context.DocumentFiles
            .IgnoreQueryFilters()
                .Where(f => f.IsDeletedAsRoot == true &&
                            (f.UserId == userId || f.AllowedUsersId.Contains(userId)))
                .OrderByDescending(f => f.DeletedAt)
                .ToListAsync();
        }

        public async Task<Folder> RestoreFolderAsync(Guid folderId, bool isRoot)
        {
            var folder = await _context.Folders.IgnoreQueryFilters().FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            // here backtrack the previous parent folder they exists or not if yes just restore them only that folder only 
            if (isRoot) await RestoreParentFolder(folder.ParentFolderId!);


            folder.IsDeleted = false;
            folder.IsDeletedAsRoot = false;
            folder.DeletedAt = null;


            var childFolders = await _context.Folders.IgnoreQueryFilters()
               .Where(f => f.ParentFolderId == folderId && f.IsDeleted)
               .ToListAsync();
            foreach (var child in childFolders)
            {
                if (!child.IsDeletedAsRoot) await RestoreFolderAsync(child.Id, false);
            }

            var childFiles = await _context.DocumentFiles.IgnoreQueryFilters()
                .Where(f => f.FolderId == folderId && f.IsDeleted)
                .ToListAsync();
            foreach (var file in childFiles)
            {
                if (!file.IsDeletedAsRoot) await RestoreFileAsync(file.Id, false);

            }


            await _context.SaveChangesAsync();
            return folder;
        }

        public async Task<DocumentFile> RestoreFileAsync(Guid fileId, bool isRoot)
        {
            var file = await _context.DocumentFiles.IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            if (isRoot) await RestoreParentFolder(file.FolderId);

            file.IsDeleted = false;
            file.IsDeletedAsRoot = false;
            file.DeletedAt = null;
            await _context.SaveChangesAsync();
            return file;
        }


        public async Task PermanentlyDeleteFolderAsync(Guid folderId)
        {
            var folder = await _context.Folders.IgnoreQueryFilters().FirstOrDefaultAsync(f => f.Id == folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            if (!folder.IsDeleted)
            {
                await DeleteRestoredFolder(folder.Id, true);
                return;
            }

            var childFolders = await _context.Folders
                .IgnoreQueryFilters()
                .Where(f => f.ParentFolderId == folderId)
                .ToListAsync();
            foreach (var child in childFolders)
            {
                await PermanentlyDeleteFolderAsync(child.Id);
            }

            var childFiles = await _context.DocumentFiles
                .IgnoreQueryFilters()
                .Where(f => f.FolderId == folderId)
                .ToListAsync();
            foreach (var file in childFiles)
            {
                await PermanentlyDeleteFileAsync(file.Id);
            }

            _context.Folders.Remove(folder);
            await _context.SaveChangesAsync();
        }
        public async Task PermanentlyDeleteFileAsync(Guid fileId)
        {
            var file = await _context.DocumentFiles.IgnoreQueryFilters().FirstOrDefaultAsync(f => f.Id == fileId)
                ?? throw new KeyNotFoundException("File not found.");

            var blobUrl = file.Url;
            _context.DocumentFiles.Remove(file);
            await _context.SaveChangesAsync();

            var reference = await _context.DocumentFiles.IgnoreQueryFilters().FirstOrDefaultAsync(f => f.Url == blobUrl);
            if (reference == null)
            {
                await _storageService.DeleteFileByUrlAsync(blobUrl);
            }
        }


        public async Task EmptyRecycleBinAsync()
        {
            var deletedFolders = await _context.Folders.IgnoreQueryFilters()
                .Where(f => f.IsDeletedAsRoot && f.IsDeleted)
                .ToListAsync();

            foreach (var folder in deletedFolders)
            {
                var stillExists = await _context.Folders.IgnoreQueryFilters()
                    .AnyAsync(f => f.Id == folder.Id);
                if (stillExists)
                {
                    await PermanentlyDeleteFolderAsync(folder.Id);
                }
            }

            // restored by child
            var restoreAndDeleted = await _context.Folders.IgnoreQueryFilters()
                .Where(f => f.IsDeletedAsRoot && !f.IsDeleted)
                .ToListAsync();

            foreach (var folder in restoreAndDeleted)
            {
                var stillExists = await _context.Folders.IgnoreQueryFilters()
                    .AnyAsync(f => f.Id == folder.Id);
                if (stillExists)
                {
                    await DeleteRestoredFolder(folder.Id, true);
                }
            }

            var deletedFiles = await _context.DocumentFiles.IgnoreQueryFilters()
                .Where(f => f.IsDeletedAsRoot && f.IsDeleted)
                .ToListAsync();

            foreach (var file in deletedFiles)
            {
                var stillExists = await _context.DocumentFiles.IgnoreQueryFilters()
                    .AnyAsync(f => f.Id == file.Id);
                if (stillExists)
                {
                    await PermanentlyDeleteFileAsync(file.Id);
                }
            }

            await _context.SaveChangesAsync();
        }


        public async Task UpdateAsync(Folder folder)
        {
            _context.Folders.Update(folder);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateRootDriveAsync(RootDrive rootDrive)
        {
            _context.RootDrives.Update(rootDrive);
            await _context.SaveChangesAsync();

        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }


        public async Task UpdateItemPropertiesAsync(UpdateItemPropertiesDto dto, string requestingUserId)
        {
            switch (dto.TypeOf.ToUpper())
            {
                case "FOLDER":
                    {
                        var folder = await _context.Folders
                            .FirstOrDefaultAsync(f => f.Id == dto.EntityId)
                            ?? throw new KeyNotFoundException("Folder not found.");

                        if (!string.Equals(folder.UserId, requestingUserId, StringComparison.Ordinal))
                            throw new UnauthorizedAccessException("Only the owner can update this folder's properties.");

                        ApplyProperties(
                            dto,
                            setHidden: v => folder.IsHidden = v,
                            setLocked: v => folder.IsLocked = v,
                            setEveryone: v => folder.IAccessibleByEveryone = v,
                            setAllowedUsers: v => folder.AllowedUsersId = v);

                        folder.UpdatedAt = DateTime.UtcNow;
                        break;
                    }

                case "FILE":
                    {
                        var file = await _context.DocumentFiles
                            .FirstOrDefaultAsync(f => f.Id == dto.EntityId)
                            ?? throw new KeyNotFoundException("File not found.");

                        if (!string.Equals(file.UserId, requestingUserId, StringComparison.Ordinal))
                            throw new UnauthorizedAccessException("Only the owner can update this file's properties.");

                        ApplyProperties(
                            dto,
                            setHidden: v => file.IsHidden = v,
                            setLocked: v => file.IsLocked = v,
                            setEveryone: v => file.IAccessibleByEveryone = v,
                            setAllowedUsers: v => file.AllowedUsersId = v);

                        file.UpdatedAt = DateTime.UtcNow;
                        break;
                    }

                default:
                    throw new ArgumentException("Invalid entity type.");
            }

            await _context.SaveChangesAsync();
        }

        private static void ApplyProperties(
            UpdateItemPropertiesDto dto,
            Action<bool> setHidden,
            Action<bool> setLocked,
            Action<bool> setEveryone,
            Action<List<string>> setAllowedUsers)
        {
            if (dto.IsHidden.HasValue)
                setHidden(dto.IsHidden.Value);

            var lockedResult = dto.IsLocked ?? false;
            if (dto.IsLocked.HasValue)
                setLocked(dto.IsLocked.Value);

            if (lockedResult)
            {
                setEveryone(false);
                setAllowedUsers([]);
                return;
            }

            if (dto.IsAccessibleByEveryone.HasValue)
                setEveryone(dto.IsAccessibleByEveryone.Value);

            if (dto.AllowedUsersId is not null)
                setAllowedUsers(dto.IsAccessibleByEveryone == true ? [] : dto.AllowedUsersId);
        }


        private async Task RestoreParentFolder(Guid? parentFolderId)
        {
            if (parentFolderId == null) return;

            var folder = await _context.Folders
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.Id == parentFolderId) ?? throw new InvalidOperationException(
                    "Cannot restore: the parent folder was permanently deleted.");

            if (folder.IsDeleted)
            {
                folder.IsDeleted = false;
                folder.DeletedAt = null;
                await RestoreParentFolder(folder.ParentFolderId);
            }

            await _context.SaveChangesAsync();
        }

        private async Task DeleteRestoredFolder(Guid folderId, bool isRoot)
        {
            var folder = await _context.Folders.IgnoreQueryFilters().FirstOrDefaultAsync(f => f.Id == folderId)
               ?? throw new KeyNotFoundException("Folder not found.");

            if (isRoot)
            {
                folder.IsDeletedAsRoot = false;
                folder.IsDeleted = false;
                await _context.SaveChangesAsync();
            }

            var childFolders = await _context.Folders.IgnoreQueryFilters()
                .Where(f => f.ParentFolderId == folderId)
                .ToListAsync();
            foreach (var child in childFolders)
            {
                if (child.IsDeleted && !child.IsDeletedAsRoot)
                {
                    await PermanentlyDeleteFolderAsync(child.Id);
                }
            }

            var childFiles = await _context.DocumentFiles
                .Where(f => f.FolderId == folderId)
                .ToListAsync();
            foreach (var file in childFiles)
            {
                if (file.IsDeleted && !file.IsDeletedAsRoot)
                {
                    await PermanentlyDeleteFileAsync(file.Id);
                }
            }

            await _context.SaveChangesAsync();
        }


    }


}