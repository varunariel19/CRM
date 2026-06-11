using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateProjectDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string ProjectLeadId { get; set; } = string.Empty;

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public string? ContactId { get; set; }

        public List<IFormFile> Documents { get; set; } = [];
    }

    public class UpdateProjectDto
    {
        public string Name { get; set; } = string.Empty;

        public string? ProjectLeadId { get; set; }

        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public bool IsActive { get; set; }

        public List<IFormFile>? NewDocuments { get; set; }
    }


    public class ProjectDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? ContactId { get; set; }

        public ClientDto? Client { get; set; } = null;
        public string ProjectKey { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public ProjectMemberDto? ProjectLead { get; set; }
        public List<ProjectMemberDto> Members { get; set; } = [];
        public List<ProjectDocumentDto> Documents { get; set; } = [];
        public int TasksTotal { get; set; }
        public int TasksCompleted { get; set; }
    }


    public class ClientDto
    {
        public string Email { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;

    }

    public class ProjectMemberDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
    }

    public class ProjectDocumentDto
    {
        public string Id { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string UploadId { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }


}