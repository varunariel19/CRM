using System.ComponentModel.DataAnnotations;
using ArielCRM.DataLayer.Entities;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.DTOs
{


    public class FolderContentsDto
    {
        public FolderDto CurrentFolder { get; set; } = null!;
        public List<FolderDto> Folders { get; set; } = [];
        public List<DocumentFile> Files { get; set; } = [];
    }

    public class FolderDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FolderKey { get; set; } = string.Empty;
        public Guid? ParentFolderId { get; set; }
        public Guid? RootDriveId { get; set; }
        public bool IsSystem { get; set; }
        public bool CanCreate { get; set; }
        public bool HasChildren { get; set; }
        public long FolderSize { get; set; }
        public int FoldersCount { get; set; }
        public int FileCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool ParentFolderAccessible { get; set; } = false;
        public string CreatedBy { get; set; } = string.Empty;
        public List<string> AllowedUsersId { get; set; } = [];
    }


    public class CreateFolderRequest
    {
        public string Name { get; set; } = string.Empty;
        public Guid? ParentFolderId { get; set; }
    }

    public class UpdateItemPropertiesDto
    {
        [Required]
        public string TypeOf { get; set; } = string.Empty;

        [Required]
        public Guid EntityId { get; set; }

        public bool? IsHidden { get; set; }

        public bool? IsLocked { get; set; }

        public bool? IsAccessibleByEveryone { get; set; }

        public List<string>? AllowedUsersId { get; set; }
    }

    public class UploadFileRequest
    {
        public Guid? ParentFolderId { get; set; }
        public List<IFormFile> Files { get; set; } = [];
    }

    public class FileDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public long Size { get; set; }
        public Guid FolderId { get; set; }
        public DateTime UploadedAt { get; set; }
    }


}