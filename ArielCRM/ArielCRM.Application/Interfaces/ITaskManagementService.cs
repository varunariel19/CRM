using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface ITaskManagementService
    {
        Task<IEnumerable<TaskDetailDto>> GetAllAsync();

        Task<TaskDetailDto?> GetByIdAsync(string taskId);

        Task<TaskDetailDto> CreateAsync(CreateTaskDto dto, string reportedById);

        Task<bool> UpdateAsync(string taskId, UpdateTaskDto dto, string committedById);

        Task<bool> DeleteAsync(string taskId);
    }
}
