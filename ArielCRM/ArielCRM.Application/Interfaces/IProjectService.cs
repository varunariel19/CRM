using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{

    public interface IProjectService
    {
        Task<bool> AddMemberToProjectAsync(string projectId, string memberId);
        Task UpdateAsync(string projectId, UpdateProjectDto dto);
        Task<ProjectDetailDto?> GetByIdAsync(string projectId);
        Task<string> CreateAsync(CreateProjectDto dto);
        Task<IEnumerable<ProjectDetailDto>> GetAllAsync(HttpContext context);
        Task RemoveMemberFromProjectAsync(string projectId, string memberId);
        Task DeleteAsync(string projectId);
    }


}