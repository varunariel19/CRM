using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs.ArielCRM.Application.DTOs;
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

        public async Task<List<FolderDto>> GetFoldersByParentIdAsync(Guid parentFolderId)
        {
            var parent = await _folderRepository.GetByIdAsync(parentFolderId) ?? throw new KeyNotFoundException($"Folder with id '{parentFolderId}' was not found.");
            var folders = await _folderRepository.GetFoldersByParentIdAsync(parentFolderId);
            return [.. folders.Select(MapToDto)];
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
                Files = [.. folder.Files],
                CreatedAt = folder.CreatedAt
            };

        }
    }
}