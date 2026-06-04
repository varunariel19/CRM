using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IHistoryRepository
    {
        Task<CRMHistory?> GetByIdAsync(string id);
        Task<(IEnumerable<CRMHistory> Items, int TotalCount)> GetAllAsync(HistoryFilterDto filter);
        Task<IEnumerable<CRMHistory>> GetByEntityAsync(string entityName, string entityId);
        Task AddAsync(CRMHistory history);
        Task DeleteAsync(CRMHistory history);
        Task DeleteAllAsync();
        Task SaveChangesAsync();
    }
}
