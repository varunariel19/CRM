using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{

    public interface IProjectService
    {
        Task<IEnumerable<TaskDetailDto>> GetUpdatedTasksAsync(HttpContext context, DateTime since);
        Task<IEnumerable<ProjectDetailDto>> GetAllAsync(HttpContext context);
        Task<bool> AddMemberToProjectAsync(string projectId, string memberId);
        Task RemoveMemberFromProjectAsync(string projectId, string memberId);
        Task<Project?> CreateProjectForLeadAsync(CreateProjectForLeadDto dto);
        Task UpdateAsync(string projectId, UpdateProjectDto dto);
        Task<ProjectDetailDto?> GetByIdAsync(string projectId);
        Task<string> FinalizeCreateAsync(CreateProjectDto dto);
        Task DeleteAsync(string projectId);
    }


}