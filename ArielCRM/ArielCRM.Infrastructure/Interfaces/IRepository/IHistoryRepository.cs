using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IHistoryRepository
    {
        Task<AuditLog?> GetByIdAsync(string id);
        Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetAllAsync(HistoryFilterDto filter);
        Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId);
        Task<IEnumerable<AuditLog>> GetByBatchAsync(string batchId);
        Task<IEnumerable<AuditLog>> GetChildLogsAsync(string parentAuditId);
        Task AddAsync(AuditLog log);
        Task DeleteAsync(AuditLog log);
        Task DeleteAllAsync();

        Task<IEnumerable<AuditRevertHistory>> GetRevertHistoryAsync(string auditLogId);
        Task AddRevertHistoryAsync(AuditRevertHistory revertHistory);
        Task SaveChangesAsync();
    }
}