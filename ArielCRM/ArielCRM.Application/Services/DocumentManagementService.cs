using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Http;
using Org.BouncyCastle.Ocsp;

namespace ArielCRM.Application.Services
{
    public class DocumentManagementService(IDocumentManagementRepository folderRepository, IAppwriteStorageService fileStorageService, IAuthRepository authRepository) : IDocumentMangementService
    {
        private readonly IDocumentManagementRepository _folderRepository = folderRepository;
        private readonly IAppwriteStorageService _fileStorageService = fileStorageService;
        private readonly IAuthRepository _authRepo = authRepository;


        public async Task<List<RootDrive>> GetRootDrivesAsync()
        {
            var drives = await _folderRepository.GetRootDrivesAsync();
            return [.. drives];
        }

        public async Task<FolderContentsDto> GetFoldersAndFilesByParentIdAsync(Guid parentFolderId, string UserId)
        {
            var parent = await _folderRepository.GetByIdAsync(parentFolderId)
                ?? throw new KeyNotFoundException($"Folder with id '{parentFolderId}' was not found.");


            var user = await _authRepo.GetByUserIdAsync(UserId) ?? throw new KeyNotFoundException($"User not found with this Id '{UserId}'.");

            var folders = await _folderRepository.GetFoldersByParentIdAsync(parentFolderId, user.AccessLevelId, UserId);
            var files = await _folderRepository.GetFilesByParentIdAsync(parentFolderId, user.AccessLevelId, UserId);

            return new FolderContentsDto
            {
                CurrentFolder = MapToDto(parent),
                Folders = [.. folders.Select(MapToDto)],
                Files = [.. files]
            };
        }

        public async Task<FolderDto> CreateFolderAsync(CreateFolderRequest request, HttpContext context)
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Folder name is required.");

            if (!request.ParentFolderId.HasValue)
                throw new ArgumentException("A parent folder is required.");

            var parent = await _folderRepository.GetByIdAsync(request.ParentFolderId.Value)
                ?? throw new InvalidOperationException("Parent folder not found.");

            if (!parent.CanCreate)
                throw new InvalidOperationException("Folder creation is not allowed here.");

            var folder = new Folder
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                FolderKey = Slugify(request.Name),
                ParentFolderId = request.ParentFolderId,
                RootDriveId = null,
                IsSystem = false,
                CanCreate = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var created = await _folderRepository.CreateFolderAsync(folder);

            await UpdateFolderSizeRecursiveAsync(request.ParentFolderId.Value, 0, folderCountDelta: 1);

            return new FolderDto
            {
                Id = created.Id,
                Name = created.Name,
                FolderKey = created.FolderKey,
                ParentFolderId = created.ParentFolderId,
                IsSystem = created.IsSystem,
                CanCreate = created.CanCreate,
                HasChildren = false,
                CreatedAt = created.CreatedAt,
                CreatedBy = created.UserId ?? string.Empty,
                AllowedUsersId = [.. created.AllowedUsersId]
            };
        }

        public async Task<Folder> RenameFolderAsync(Guid folderId, string newName)
        {
            newName = newName?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("Folder name cannot be empty.");

            if (newName.Length > 255)
                throw new ArgumentException("Folder name is too long.");

            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var nameTaken = await _folderRepository.IsFolderNameTakenAsync(folder.ParentFolderId, newName, folderId);
            if (nameTaken)
                throw new InvalidOperationException("A folder with this name already exists here.");

            return await _folderRepository.RenameFolderAsync(folderId, newName);
        }

        public async Task<DocumentFile> RenameFileAsync(Guid fileId, string newName)
        {
            newName = newName?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(newName))
                throw new ArgumentException("File name cannot be empty.");

            if (newName.Length > 255)
                throw new ArgumentException("File name is too long.");

            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            var nameTaken = await _folderRepository.IsFileNameTakenAsync(file.FolderId, newName, fileId);
            if (nameTaken)
                throw new InvalidOperationException("A file with this name already exists here.");

            return await _folderRepository.RenameFileAsync(fileId, newName);
        }


        public Task<List<Folder>> GetBinFoldersAsync(string userId)
       => _folderRepository.BinDeletedFoldersAsync(userId);

        public Task<List<DocumentFile>> GetBinFilesAsync(string userId)
            => _folderRepository.BinDeletedFilesAsync(userId);




        public async Task<List<DocumentFile>> UploadFilesToFolderAsync(Guid? parentFolderId, List<IFormFile> files, string userId)
        {
            if (files == null || files.Count == 0)
                throw new ArgumentException("At least one file is required.");

            if (!parentFolderId.HasValue)
                throw new ArgumentException("A target folder is required.");

            var folder = await _folderRepository.GetByIdAsync(parentFolderId.Value)
                         ?? throw new InvalidOperationException("Folder not found.");

            if (!folder.CanCreate)
                throw new InvalidOperationException("Uploading is not allowed in this folder.");

            using var transaction = await _folderRepository.BeginTransactionAsync();

            try
            {
                var results = new List<DocumentFile>();

                long totalUploadedSize = 0;
                int uploadedFileCount = 0;

                foreach (var file in files)
                {
                    if (file.Length == 0)
                        continue;

                    var uploaded = await _fileStorageService.UploadFileAsync(file);

                    var documentFile = new DocumentFile
                    {
                        Id = Guid.NewGuid(),
                        Name = Path.GetFileNameWithoutExtension(file.FileName),
                        FileName = file.FileName,
                        ContentType = file.ContentType,
                        StoragePath = uploaded.FileId,
                        Url = uploaded.FileUrl,
                        Size = file.Length,
                        FolderId = parentFolderId.Value, // always a folder, never a RootDriveId
                        UserId = userId,
                        UploadedAt = DateTime.UtcNow
                    };

                    var saved = await _folderRepository.CreateFileAsync(documentFile);

                    totalUploadedSize += saved.Size;
                    uploadedFileCount++;

                    results.Add(saved);
                }

                if (uploadedFileCount > 0)
                {
                    // Single entry point: updates `folder` itself, then cascades the
                    // same signed deltas up through every ancestor folder, and finally
                    // to the RootDrive once it hits a folder with no parent.
                    await UpdateFolderSizeRecursiveAsync(folder.Id, totalUploadedSize, fileCountDelta: uploadedFileCount);
                }

                await transaction.CommitAsync();

                return results;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Folder> MoveFolderAsync(Guid folderId, Guid? targetFolderId)
        {
            if (targetFolderId == folderId)
                throw new InvalidOperationException("Cannot move a folder into itself.");

            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            if (folder.IsSystem)
                throw new InvalidOperationException("System folders cannot be moved.");

            if (targetFolderId != null &&
                await _folderRepository.IsFolderAncestorOfAsync(folderId, targetFolderId))
                throw new InvalidOperationException("Cannot move a folder into its own subfolder.");

            if (await _folderRepository.IsFolderNameTakenAsync(targetFolderId, folder.Name, folderId))
                throw new InvalidOperationException("A folder with this name already exists at the destination.");

            using var transaction = await _folderRepository.BeginTransactionAsync();

            try
            {
                var oldParentId = folder.ParentFolderId;
                var oldRootDriveId = folder.RootDriveId;

                // The moved folder brings its entire subtree with it: itself
                // (+1 folder) plus everything nested inside it.
                var movingFolderCount = folder.FoldersCount + 1;
                var movingFileCount = folder.FileCount;
                var movingSize = folder.FolderSize;

                // Remove those totals from wherever the folder currently sits.
                if (oldParentId.HasValue)
                    await UpdateFolderSizeRecursiveAsync(oldParentId.Value, -movingSize, -movingFileCount, -movingFolderCount);
                else if (oldRootDriveId.HasValue)
                    await UpdateRootDriveSizeAsync(oldRootDriveId.Value, -movingSize, -movingFileCount, -movingFolderCount);

                var movedFolder = await _folderRepository.MoveFolderAsync(folderId, targetFolderId);

                // Add those totals to the new location — either the new parent's
                // ancestor chain, or the RootDrive directly if it becomes top-level.
                if (targetFolderId.HasValue)
                {
                    await UpdateFolderSizeRecursiveAsync(targetFolderId.Value, movingSize, movingFileCount, movingFolderCount);
                }
                else if (movedFolder.RootDriveId.HasValue)
                {
                    await UpdateRootDriveSizeAsync(movedFolder.RootDriveId.Value, movingSize, movingFileCount, movingFolderCount);
                }

                await transaction.CommitAsync();

                return movedFolder;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<DocumentFile> MoveFileAsync(Guid fileId, Guid targetFolderId)
        {
            // Files only ever move between folders — target is always a folder id,
            // never a RootDrive id, since a file cannot live at the drive root.
            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            if (await _folderRepository.IsFileNameTakenAsync(targetFolderId, file.FileName, fileId))
                throw new InvalidOperationException("A file with this name already exists at the destination.");

            using var transaction = await _folderRepository.BeginTransactionAsync();

            try
            {
                var oldFolderId = file.FolderId;

                await UpdateFolderSizeRecursiveAsync(oldFolderId, -file.Size, fileCountDelta: -1);

                var movedFile = await _folderRepository.MoveFileAsync(fileId, targetFolderId);

                await UpdateFolderSizeRecursiveAsync(targetFolderId, file.Size, fileCountDelta: 1);

                await transaction.CommitAsync();

                return movedFile;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId, string? newName)
        {
            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            using var transaction = await _folderRepository.BeginTransactionAsync();
            try
            {
                var copiedFile = await _folderRepository.CopyFileAsync(fileId, targetFolderId, newName);

                // Single call updates the target folder's own size/file count and
                // cascades up through its ancestors (and the RootDrive, if reached).
                await UpdateFolderSizeRecursiveAsync(targetFolderId, copiedFile.Size, fileCountDelta: 1);

                await transaction.CommitAsync();

                return copiedFile;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId, string? newName)
        {
            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            if (targetFolderId != null &&
                await _folderRepository.IsFolderAncestorOfAsync(folderId, targetFolderId))
                throw new InvalidOperationException("Cannot copy a folder into its own subfolder.");

            using var transaction = await _folderRepository.BeginTransactionAsync();

            try
            {
                var copiedFolder = await _folderRepository.CopyFolderAsync(folderId, targetFolderId, newName);

                // The copy carries its own subtree totals: itself (+1) plus nested folders/files.
                var copiedFolderCount = copiedFolder.FoldersCount + 1;
                var copiedFileCount = copiedFolder.FileCount;

                if (targetFolderId.HasValue)
                {
                    await UpdateFolderSizeRecursiveAsync(
                        targetFolderId.Value,
                        copiedFolder.FolderSize,
                        copiedFileCount,
                        copiedFolderCount);
                }
                else if (copiedFolder.RootDriveId.HasValue)
                {
                    // Copying to root (no target folder) — the copy becomes top-level,
                    // so its totals roll up into the RootDrive instead of a parent folder.
                    await UpdateRootDriveSizeAsync(
                        copiedFolder.RootDriveId.Value,
                        copiedFolder.FolderSize,
                        copiedFileCount,
                        copiedFolderCount);
                }

                await transaction.CommitAsync();
                return copiedFolder;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<DocumentFile> DeleteFileAsync(Guid fileId)
        {
            // A file always has a FolderId — no RootDrive branch needed here.
            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            await UpdateFolderSizeRecursiveAsync(file.FolderId, -file.Size, fileCountDelta: -1);

            return await _folderRepository.DeleteFileAsync(fileId, true);
        }

        public async Task<Folder> DeleteFolderAsync(Guid folderId)
        {
            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var removedFolderCount = folder.FoldersCount + 1;
            var removedFileCount = folder.FileCount;

            if (folder.ParentFolderId.HasValue)
            {
                await UpdateFolderSizeRecursiveAsync(
                    folder.ParentFolderId.Value,
                    -folder.FolderSize,
                    -removedFileCount,
                    -removedFolderCount);
            }
            else if (folder.RootDriveId.HasValue)
            {
                // Top-level folder being deleted — decrement the RootDrive directly.
                await UpdateRootDriveSizeAsync(
                    folder.RootDriveId.Value,
                    -folder.FolderSize,
                    -removedFileCount,
                    -removedFolderCount);
            }

            return await _folderRepository.DeleteFolderAsync(folderId, true);
        }

        public async Task<DocumentFile> RestoreFileAsync(Guid fileId)
        {
            var file = await _folderRepository.GetDeletedFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            await UpdateFolderSizeRecursiveAsync(file.FolderId, file.Size, fileCountDelta: 1);

            return await _folderRepository.RestoreFileAsync(fileId, true);
        }

        public async Task<Folder> RestoreFolderAsync(Guid folderId)
        {
            var folder = await _folderRepository.GetDeletedFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            var restoredFolderCount = folder.FoldersCount + 1;
            var restoredFileCount = folder.FileCount;

            if (folder.ParentFolderId.HasValue)
            {
                await UpdateFolderSizeRecursiveAsync(
                    folder.ParentFolderId.Value,
                    folder.FolderSize,
                    restoredFileCount,
                    restoredFolderCount);
            }
            else if (folder.RootDriveId.HasValue)
            {
                // Top-level folder being restored — increment the RootDrive directly.
                await UpdateRootDriveSizeAsync(
                    folder.RootDriveId.Value,
                    folder.FolderSize,
                    restoredFileCount,
                    restoredFolderCount);
            }

            return await _folderRepository.RestoreFolderAsync(folderId, true);
        }


        public async Task UpdateItemPropertiesAsync(UpdateItemPropertiesDto updateItemPropertiesDto, string requestingUserId)
        {
            await _folderRepository.UpdateItemPropertiesAsync(updateItemPropertiesDto, requestingUserId);
        }


        public Task PermanentlyDeleteFolderAsync(Guid folderId)
            => _folderRepository.PermanentlyDeleteFolderAsync(folderId);

        public Task PermanentlyDeleteFileAsync(Guid fileId)
            => _folderRepository.PermanentlyDeleteFileAsync(fileId);

        public Task EmptyRecycleBinAsync()
           => _folderRepository.EmptyRecycleBinAsync();

        private static string Slugify(string name) =>
            name.Trim().ToLowerInvariant().Replace(" ", "-");

        private static FolderDto MapToDto(Folder folder)
        {
            return new FolderDto
            {
                Id = folder.Id,
                Name = folder.Name,
                FolderKey = folder.FolderKey,
                ParentFolderId = folder.ParentFolderId,
                RootDriveId = folder.RootDriveId,
                IsSystem = folder.IsSystem,
                CanCreate = folder.CanCreate,
                HasChildren = false,
                FolderSize = folder.FolderSize,
                FoldersCount = folder.FoldersCount,
                FileCount = folder.FileCount,
                CreatedAt = folder.CreatedAt,
                UpdatedAt = folder.UpdatedAt,
            };

        }


        /// <summary>
        /// Updates the given folder's aggregate stats (size, file count, folder count)
        /// by the supplied signed deltas, persists it, then recurses up to its parent
        /// folder. Once it reaches a folder with no parent, it hands off to
        /// <see cref="UpdateRootDriveSizeAsync"/> so the RootDrive stays in sync too.
        /// Pass negative deltas to reduce (move-out/delete), positive to increase
        /// (move-in/upload/restore).
        /// </summary>
        private async Task UpdateFolderSizeRecursiveAsync(
            Guid folderId,
            long sizeDelta,
            int fileCountDelta = 0,
            int folderCountDelta = 0)
        {
            var folder = await _folderRepository.GetByIdAsync(folderId);

            if (folder == null)
                return;

            folder.FolderSize += sizeDelta;
            folder.FileCount += fileCountDelta;
            folder.FoldersCount += folderCountDelta;

            await _folderRepository.UpdateAsync(folder);

            if (folder.ParentFolderId.HasValue)
            {
                await UpdateFolderSizeRecursiveAsync(folder.ParentFolderId.Value, sizeDelta, fileCountDelta, folderCountDelta);
            }
            else if (folder.RootDriveId.HasValue)
            {
                await UpdateRootDriveSizeAsync(folder.RootDriveId.Value, sizeDelta, fileCountDelta, folderCountDelta);
            }
        }

        /// <summary>
        /// Updates the RootDrive's aggregate stats by the supplied signed deltas.
        /// Negative reduces (move-out/delete), positive increases (move-in/upload/restore).
        /// </summary>
        private async Task UpdateRootDriveSizeAsync(
            Guid driveId,
            long sizeDelta,
            int fileCountDelta = 0,
            int folderCountDelta = 0)
        {
            var drive = await _folderRepository.GetRootDriveByIdAsync(driveId);

            if (drive == null)
                return;

            drive.DiskSize += sizeDelta;
            drive.FileCount += fileCountDelta;
            drive.FoldersCount += folderCountDelta;

            await _folderRepository.UpdateRootDriveAsync(drive);
        }

    }
}