using ArielCRM.DataLayer.Entities;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.DTOs
{

    namespace ArielCRM.Application.DTOs
    {
        public class FolderDto
        {
            public Guid Id { get; set; }
            public string Name { get; set; } = string.Empty;
            public string FolderKey { get; set; } = string.Empty;
            public Guid? ParentFolderId { get; set; }
            public bool IsSystem { get; set; }
            public bool CanCreate { get; set; }
            public bool HasChildren { get; set; }

            public List<DocumentFile> Files {get; set;} = [];
            public DateTime CreatedAt { get; set; }
        }


        public class CreateFolderRequest
        {
            public string Name { get; set; } = string.Empty;
            public Guid? ParentFolderId { get; set; }
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
}