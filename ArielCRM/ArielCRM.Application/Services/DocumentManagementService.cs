using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Services
{
    public class DocumentManagementService(IDocumentManagemntRepository folderRepository, IAppwriteStorageService fileStorageService) : IDocumentMangementService
    {
        private readonly IDocumentManagemntRepository _folderRepository = folderRepository;
        private readonly IAppwriteStorageService _fileStorageService = fileStorageService;

        public async Task<List<FolderDto>> GetRootFoldersAsync()
        {
            var folders = await _folderRepository.GetRootFoldersAsync();
            return [.. folders.Select(MapToDto)];
        }

        public async Task<FolderContentsDto> GetFoldersAndFilesByParentIdAsync(Guid parentFolderId)
        {
            var parent = await _folderRepository.GetByIdAsync(parentFolderId)
                ?? throw new KeyNotFoundException($"Folder with id '{parentFolderId}' was not found.");

            var folders = await _folderRepository.GetFoldersByParentIdAsync(parentFolderId);
            var files = await _folderRepository.GetFilesByParentIdAsync(parentFolderId);

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

            if (request.ParentFolderId.HasValue)
            {
                var parent = await _folderRepository.GetByIdAsync(request.ParentFolderId.Value) ?? throw new InvalidOperationException("Parent folder not found.");
                if (!parent.CanCreate)
                    throw new InvalidOperationException("Folder creation is not allowed here.");
            }

            var folder = new Folder
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                FolderKey = Slugify(request.Name),
                ParentFolderId = request.ParentFolderId,
                IsSystem = false,
                CanCreate = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            };

            var created = await _folderRepository.CreateFolderAsync(folder);

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
            };
        }


        public async Task<List<FileDto>> UploadFilesToFolderAsync(Guid? parentFolderId, List<IFormFile> files, string userId)
        {
            if (files is null || files.Count == 0) throw new ArgumentException("At least one file is required.");

            if (!parentFolderId.HasValue) throw new ArgumentException("A target folder is required.");

            var folder = await _folderRepository.GetByIdAsync(parentFolderId.Value) ?? throw new InvalidOperationException("Folder not found.");
            if (!folder.CanCreate) throw new InvalidOperationException("Uploading is not allowed in this folder.");

            var results = new List<FileDto>();

            foreach (var file in files)
            {
                if (file.Length == 0) continue;

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
                    FolderId = parentFolderId.Value,
                    UserId = userId,
                    UploadedAt = DateTime.UtcNow,
                };

                var saved = await _folderRepository.CreateFileAsync(documentFile);

                results.Add(new FileDto
                {
                    Id = saved.Id,
                    Name = saved.Name,
                    FileName = saved.FileName,
                    ContentType = saved.ContentType,
                    Url = saved.Url,
                    Size = saved.Size,
                    FolderId = saved.FolderId,
                    UploadedAt = saved.UploadedAt,
                });
            }

            return results;
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


        public async Task<Folder> MoveFolderAsync(Guid folderId, Guid? targetFolderId)
        {
            if (targetFolderId == folderId)
                throw new InvalidOperationException("Cannot move a folder into itself.");

            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            if (folder.IsSystem)
                throw new InvalidOperationException("System folders cannot be moved.");

            if (targetFolderId != null && await _folderRepository.IsFolderAncestorOfAsync(folderId, targetFolderId))
                throw new InvalidOperationException("Cannot move a folder into its own subfolder.");

            if (await _folderRepository.IsFolderNameTakenAsync(targetFolderId, folder.Name, folderId))
                throw new InvalidOperationException("A folder with this name already exists at the destination.");

            return await _folderRepository.MoveFolderAsync(folderId, targetFolderId);
        }

        public async Task<DocumentFile> MoveFileAsync(Guid fileId, Guid targetFolderId)
        {
            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            if (await _folderRepository.IsFileNameTakenAsync(targetFolderId, file.FileName, fileId))
                throw new InvalidOperationException("A file with this name already exists at the destination.");

            return await _folderRepository.MoveFileAsync(fileId, targetFolderId);
        }

        public async Task<DocumentFile> CopyFileAsync(Guid fileId, Guid targetFolderId)
        {
            var file = await _folderRepository.GetFileByIdAsync(fileId)
                ?? throw new KeyNotFoundException("File not found.");

            return await _folderRepository.CopyFileAsync(fileId, targetFolderId);
        }

        public async Task<Folder> CopyFolderAsync(Guid folderId, Guid? targetFolderId)
        {
            var folder = await _folderRepository.GetFolderByIdAsync(folderId)
                ?? throw new KeyNotFoundException("Folder not found.");

            if (targetFolderId != null && await _folderRepository.IsFolderAncestorOfAsync(folderId, targetFolderId))
                throw new InvalidOperationException("Cannot copy a folder into its own subfolder.");

            return await _folderRepository.CopyFolderAsync(folderId, targetFolderId);
        }


        public Task<DocumentFile> DeleteFileAsync(Guid fileId)
                   => _folderRepository.DeleteFileAsync(fileId);

        public Task<Folder> DeleteFolderAsync(Guid folderId)
            => _folderRepository.DeleteFolderAsync(folderId);


        public Task<List<Folder>> GetBinFoldersAsync(string userId)
            => _folderRepository.BinDeletedFoldersAsync(userId);

        public Task<List<DocumentFile>> GetBinFilesAsync(string userId)
            => _folderRepository.BinDeletedFilesAsync(userId);



        public Task<Folder> RestoreFolderAsync(Guid folderId)
            => _folderRepository.RestoreFolderAsync(folderId);

        public Task<DocumentFile> RestoreFileAsync(Guid fileId)
            => _folderRepository.RestoreFileAsync(fileId);

        public Task PermanentlyDeleteFolderAsync(Guid folderId)
            => _folderRepository.PermanentlyDeleteFolderAsync(folderId);

        public Task PermanentlyDeleteFileAsync(Guid fileId)
            => _folderRepository.PermanentlyDeleteFileAsync(fileId);


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
                IsSystem = folder.IsSystem,
                CanCreate = folder.CanCreate,
                HasChildren = folder.ChildFolders.Count != 0,
                CreatedAt = folder.CreatedAt
            };

        }
    }
}