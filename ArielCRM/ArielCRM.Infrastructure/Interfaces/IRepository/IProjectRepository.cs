using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IProjectRepository
    {
        Task AddAsync(Project project);

        Task UpdateAsync(Project project);

        Task DeleteAsync(Project project);

        Task<Project?> GetByIdAsync(string projectId);

        Task<Project?> GetByIdWithDetailsAsync(string projectId);
        Task<List<Project>> GetAllWithDetailsAsync(string userId);

        Task<List<Project>> GetAllProjectAsync();
        Task<bool> AddMemberToProjectAsync(string projectId, string memberId);
        Task RemoveMemberFromProjectAsync(string projectId, string memberId);
         Task<List<TicketTask>> GetUpdatedTasksAsync(string userId, DateTime since);

          Task<List<TicketTask>> GetAllUpdatedTasksAsync(DateTime since);

    }

}