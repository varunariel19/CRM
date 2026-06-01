using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface ICrmTaskService
    {
        Task<IEnumerable<CrmTaskDto>> GetAllAsync();
        Task<CrmTaskDto> CreateAsync(CreateCrmTaskDto dto);
        Task<bool> DeleteAsync(string id);
        Task<bool> UpdateTaskStatusAsync(UpdateTaskStatusDto dto);
    }
}
