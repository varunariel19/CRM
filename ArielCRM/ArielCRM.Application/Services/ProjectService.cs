using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;

namespace ArielCRM.Application.Services
{

    public class ProjectService(
        IProjectRepository projectRepository,
        IAppwriteStorageService storageService) : IProjectService
    {
        private readonly IProjectRepository _projectRepository = projectRepository;
        private readonly IAppwriteStorageService _storageService = storageService;

        public async Task<string> CreateAsync(CreateProjectDto dto)
        {
            var project = new Project
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name,
                ProjectLeadId = dto.ProjectLeadId,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                DealId = dto.DealId,
                ProjectKey = Guid.NewGuid().ToString(),
                Documents = []
            };

            foreach (var file in dto.Documents)
            {
                var uploadRes = await _storageService.UploadFileAsync(file);

                project.Documents.Add(new Documents
                {
                    Id = Guid.NewGuid().ToString(),
                    ProjectId = project.Id,
                    FileName = file.FileName,
                    UploadId = uploadRes.FileId,
                    FileUrl = uploadRes.FileUrl
                });
            }

            await _projectRepository.AddAsync(project);

            return project.Id;
        }

        public async Task UpdateAsync(string projectId, UpdateProjectDto dto)
        {
            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new Exception("Project not found");

            project.Name = dto.Name;
            project.ProjectLeadId = dto.ProjectLeadId;
            project.Description = dto.Description;
            project.StartDate = dto.StartDate;
            project.EndDate = dto.EndDate;
            project.IsActive = dto.IsActive;
            project.UpdatedAt = DateTime.UtcNow;

            if (dto.NewDocuments?.Any() == true)
            {
                foreach (var file in dto.NewDocuments)
                {
                    var uploadRes = await _storageService.UploadFileAsync(file);

                    project.Documents.Add(new Documents
                    {
                        Id = Guid.NewGuid().ToString(),
                        ProjectId = project.Id,
                        FileName = file.FileName,
                        UploadId = uploadRes.FileId,
                        FileUrl = uploadRes.FileUrl
                    });
                }
            }

            await _projectRepository.UpdateAsync(project);
        }

        public async Task DeleteAsync(string projectId)
        {
            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new Exception("Project not found");
            await _projectRepository.DeleteAsync(project);
        }


        public async Task<ProjectDetailDto?> GetByIdAsync(string projectId)
        {
            var project = await _projectRepository.GetByIdWithDetailsAsync(projectId);
            if (project == null) return null;
            return MapToDetailDto(project);
        }

        public async Task<List<ProjectDetailDto>> GetAllAsync()
        {
            var projects = await _projectRepository.GetAllWithDetailsAsync();
            return [.. projects.Select(MapToDetailDto)];
        }

        private static ProjectDetailDto MapToDetailDto(Project p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            IsActive = p.IsActive,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            DealId = p.DealId,
            ProjectKey = p.ProjectKey,
            CreatedAt = p.CreatedAt,
            ProjectLead = p.ProjectLead == null ? null : new ProjectMemberDto
            {
                Id = p.ProjectLead.Id,
                Name = p.ProjectLead.Name,
                ProfileImage = p.ProjectLead.ProfileImage
            },
            Client = p.Deal?.Contact == null ? null : new ClientDto
            {
                Name = p.Deal.Contact.Name ?? "",
                Email = p.Deal.Contact.Email ?? "",
                CompanyName = p.Deal.Contact.Company ?? ""
            },
            Members = [.. p.Members.Select(m => new ProjectMemberDto
            {
                Id = m.Id,
                Name = m.Name,
                ProfileImage = m.ProfileImage
            })],
            Documents = [.. p.Documents.Select(d => new ProjectDocumentDto
            {
                Id = d.Id,
                FileName = d.FileName,
                FileUrl = d.FileUrl,
                UploadId = d.UploadId,
                UploadedAt = d.UploadedAt
            })],
            TasksTotal = p.Tasks.Count,
            TasksCompleted = p.Tasks.Count(t => t.Status == TicketStatus.Done.ToString())
        };


    }

}