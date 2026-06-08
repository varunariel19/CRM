using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{

    public interface IProjectService
    {
        Task<bool> AddMemberToProjectAsync(string projectId, string memberId);
        Task UpdateAsync(string projectId, UpdateProjectDto dto);
        Task<ProjectDetailDto?> GetByIdAsync(string projectId);
        Task<string> CreateAsync(CreateProjectDto dto);
        Task<List<ProjectDetailDto>> GetAllAsync();
        Task RemoveMemberFromProjectAsync(string projectId, string memberId);
        Task DeleteAsync(string projectId);
    }


}