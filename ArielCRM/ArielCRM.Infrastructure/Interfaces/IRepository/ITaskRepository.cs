using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface ICrmTaskRepository
    {   
        Task<IEnumerable<CrmTask>> GetAllAsync();
        Task<CrmTask?> GetByIdAsync(string id);
        Task<CrmTask> CreateAsync(CrmTask task);
        Task<bool> DeleteAsync(string id);
        Task<bool> UpdateStatusAsync(CrmTask task);
    }
}
