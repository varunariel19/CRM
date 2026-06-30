using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace ArielCRM.Application.Services
{

    public class ProjectService(
        IProjectRepository projectRepository,
        IAppwriteStorageService storageService, IConfiguration configuration) : IProjectService
    {
        private readonly IProjectRepository _projectRepository = projectRepository;
        private readonly IAppwriteStorageService _storageService = storageService;

        private readonly IConfiguration _configuration = configuration;

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
                ContactId = dto.ContactId,
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

        public async Task<IEnumerable<ProjectDetailDto>> GetAllAsync(HttpContext context)
        {
            if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
                return Enumerable.Empty<ProjectDetailDto>();

            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Enumerable.Empty<ProjectDetailDto>();

            var adminAccessLvlId = _configuration["Seeding:AdminLevel"];
            var accessLevelId = context.User.FindFirst("AccessLevelId")?.Value;

            if (accessLevelId == adminAccessLvlId)
            {
                var allProjects = await _projectRepository.GetAllProjectAsync();
                return allProjects.Select(MapToDetailDto);
            }

            var projects = await _projectRepository.GetAllWithDetailsAsync(userId);

            return projects.Select(MapToDetailDto);
        }

        private static ProjectDetailDto MapToDetailDto(Project p) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            IsActive = p.IsActive,
            StartDate = p.StartDate,
            EndDate = p.EndDate,
            ContactId = p.ContactId,
            ProjectKey = p.ProjectKey,
            CreatedAt = p.CreatedAt,
            ProjectLead = p.ProjectLead == null ? null : new ProjectMemberDto
            {
                Id = p.ProjectLead.Id,
                Name = p.ProjectLead.Name,
                ProfileImage = p.ProjectLead.ProfileImage
            },
            Client = p.Contact == null ? null : new ClientDto
            {
                Name = p.Contact.Name ?? "",
                Email = p.Contact.Email ?? "",
                CompanyName = p.Contact.Company ?? ""
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

            Tasks = [.. p.Tasks.Select(MapToDto)],
            TasksTotal = p.Tasks.Count,
            TasksCompleted = p.Tasks.Count(t => t.Status == TasksStatus.DONE.ToString())
        };


        private static TaskDetailDto MapToDto(TicketTask task)
        {
            return new TaskDetailDto
            {
                TaskId = task.TaskId,
                TicketId = task.TicketId,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority,
                Type = task.Type,
                AiSummary = task.AiSummary ?? [],
                Status = task.Status,
                Assignee = new UserSummaryDto
                {
                    Id = task.AssignToId!,
                    Name = task.AssignedUser?.Name ?? "",
                    ProfileImage = task.AssignedUser?.ProfileImage,
                },
                Reporter = new UserSummaryDto
                {
                    Id = task.ReportedById,
                    Name = task.ReportedUser?.Name ?? "",
                    ProfileImage = task.ReportedUser?.ProfileImage,
                },
                ProjectId = task.ProjectId,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
        }

        public async Task<bool> AddMemberToProjectAsync(string projectId, string memberId)
        {
            if (string.IsNullOrEmpty(projectId) || string.IsNullOrEmpty(memberId)) throw new Exception("project Id or user Id is missing !!");

            return await _projectRepository.AddMemberToProjectAsync(projectId, memberId);
        }


        public async Task RemoveMemberFromProjectAsync(string projectId, string memberId)
        {
            await _projectRepository.RemoveMemberFromProjectAsync(
                projectId,
                memberId);
        }

    }

}