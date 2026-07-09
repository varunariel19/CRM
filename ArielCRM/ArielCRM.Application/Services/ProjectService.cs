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

    public class ProjectService(IProjectRepository projectRepository, IAppwriteStorageService storageService, ILeadRepository leadRepository, IConfiguration configuration) : IProjectService
    {
        private readonly IProjectRepository _projectRepository = projectRepository;

        private readonly ILeadRepository _leadRepository = leadRepository;

        private readonly IAppwriteStorageService _storageService = storageService;

        private readonly IConfiguration _configuration = configuration;

        public async Task<string> FinalizeCreateAsync(CreateProjectDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.LeadId))
                throw new ArgumentException("Lead is required.", nameof(dto.LeadId));

            if (string.IsNullOrWhiteSpace(dto.Name))
                throw new ArgumentException("Project name is required.", nameof(dto.Name));

            if (string.IsNullOrWhiteSpace(dto.ProjectLeadId))
                throw new ArgumentException("Project manager is required to list a project.", nameof(dto.ProjectLeadId));

            var lead = await _leadRepository.GetLeadFullByIdAsync(dto.LeadId)
                ?? throw new Exception("Lead not found.");

            var draftProject = !string.IsNullOrWhiteSpace(dto.ProjectId)
                ? lead.Projects.FirstOrDefault(p => p.Id == dto.ProjectId)
                : lead.Projects
                    .Where(p => !p.IsActive)
                    .OrderByDescending(p => p.CreatedAt)
                    .FirstOrDefault();

            Project project;

            if (draftProject is not null)
            {
                draftProject.Name = dto.Name;
                draftProject.ProjectLeadId = dto.ProjectLeadId;
                draftProject.Description = dto.Description;
                draftProject.ProjectType = dto.ProjectType;
                draftProject.Budget = dto.Budget;
                draftProject.StartDate = dto.StartDate;
                draftProject.EndDate = dto.EndDate;
                draftProject.ContactId = dto.ContactId;
                draftProject.IsActive = true; // finalize the draft
                draftProject.UpdatedAt = DateTime.UtcNow;

                project = draftProject;
            }
            else
            {
                project = new Project
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.Name,
                    ProjectKey = Guid.NewGuid().ToString(),
                    LeadId = dto.LeadId,
                    ProjectLeadId = dto.ProjectLeadId,
                    Description = dto.Description,
                    ProjectType = dto.ProjectType,
                    Budget = dto.Budget,
                    StartDate = dto.StartDate,
                    EndDate = dto.EndDate,
                    ContactId = dto.ContactId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Documents = []
                };
            }

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

            if (draftProject is not null)
                await _projectRepository.UpdateAsync(project);
            else
                await _projectRepository.AddAsync(project);

            return project.Id;
        }

        public async Task<Project?> CreateProjectForLeadAsync(CreateProjectForLeadDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.LeadId))
                throw new ArgumentException("Lead is required.", nameof(dto.LeadId));

            if (string.IsNullOrWhiteSpace(dto.ProjectTitle))
                throw new ArgumentException("Project name is required.", nameof(dto.ProjectTitle));

            _ = await _leadRepository.GetLeadFullByIdAsync(dto.LeadId)
                ?? throw new Exception("Lead not found.");

            var project = new Project
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.ProjectTitle,
                ProjectKey = Guid.NewGuid().ToString(),
                LeadId = dto.LeadId,
                ProjectType = dto.ProjectType,
                Budget = dto.Budget,
                StartDate = dto.DealStartDate?.ToDateTime(TimeOnly.MinValue),
                EndDate = dto.DealCloseDate?.ToDateTime(TimeOnly.MinValue) ?? null,
                IsActive = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _projectRepository.AddAsync(project);
            return project;
        }

        public async Task UpdateAsync(string projectId, UpdateProjectDto dto)
        {
            var project = await _projectRepository.GetByIdAsync(projectId) ?? throw new Exception("Project not found");

            if (dto.Name is not null) project.Name = dto.Name;
            if (dto.ProjectLeadId is not null) project.ProjectLeadId = dto.ProjectLeadId;
            if (dto.Description is not null) project.Description = dto.Description;
            if (dto.ProjectType.HasValue) project.ProjectType = dto.ProjectType;
            if (dto.Budget.HasValue) project.Budget = dto.Budget;
            if (dto.StartDate.HasValue) project.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) project.EndDate = dto.EndDate;
            if (dto.ContactId is not null) project.ContactId = dto.ContactId;
            if (dto.IsActive.HasValue) project.IsActive = dto.IsActive.Value;
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
                return [];

            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return [];

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


        public async Task<IEnumerable<TaskDetailDto>> GetUpdatedTasksAsync(HttpContext context, DateTime since)
        {
            if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
                return [];

            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userId))
                return [];

            var adminLevel = _configuration["Seeding:AdminLevel"];
            var accessLevel = context.User.FindFirst("AccessLevelId")?.Value;

            var tasks = accessLevel == adminLevel
                ? await _projectRepository.GetAllUpdatedTasksAsync(since)
                : await _projectRepository.GetUpdatedTasksAsync(userId, since);

            return tasks.Select(MapToDto);
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




    }

}
