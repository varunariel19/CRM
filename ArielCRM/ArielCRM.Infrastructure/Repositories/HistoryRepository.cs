using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class HistoryRepository(AppDbContext db) : IHistoryRepository
    {
        private readonly AppDbContext _db = db;

        public async Task<AuditLog?> GetByIdAsync(string id)
            => await _db.AuditLogs
                        .Include(h => h.InitiatedBy)
                        .Include(h => h.RevertedBy)
                        .FirstOrDefaultAsync(h => h.Id == id);

        public async Task<(IEnumerable<AuditLog> Items, int TotalCount)> GetAllAsync(HistoryFilterDto filter)
        {
            var query = _db.AuditLogs
                           .Include(h => h.InitiatedBy)
                           .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.EntityName))
                query = query.Where(h => h.EntityName == filter.EntityName);

            if (!string.IsNullOrWhiteSpace(filter.EntityId))
                query = query.Where(h => h.EntityId == filter.EntityId);

            if (filter.ActionType.HasValue)
                query = query.Where(h => h.ActionTypeRaw == filter.ActionType.Value.ToString());

            if (filter.Source.HasValue)
                query = query.Where(h => h.SourceRaw == filter.Source.Value.ToString());

            if (filter.Status.HasValue)
                query = query.Where(h => h.StatusRaw == filter.Status.Value.ToString());

            if (!string.IsNullOrWhiteSpace(filter.InitiatedById))
                query = query.Where(h => h.InitiatedById == filter.InitiatedById);

            if (!string.IsNullOrWhiteSpace(filter.BatchId))
                query = query.Where(h => h.BatchId == filter.BatchId);

            if (filter.IsReverted.HasValue)
                query = query.Where(h => h.IsReverted == filter.IsReverted.Value);

            if (filter.From.HasValue)
                query = query.Where(h => h.InitiatedAt >= filter.From.Value);

            if (filter.To.HasValue)
                query = query.Where(h => h.InitiatedAt <= filter.To.Value);

            if (!string.IsNullOrWhiteSpace(filter.AffectedField))
                query = query.Where(h => h.AffectedFields != null &&
                                         h.AffectedFields.Contains(filter.AffectedField));

            var total = await query.CountAsync();

            var items = await query
                .OrderByDescending(h => h.InitiatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            return (items, total);
        }

        public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId)
            => await _db.AuditLogs
                        .Include(h => h.InitiatedBy)
                        .Where(h => h.EntityName == entityName && h.EntityId == entityId)
                        .OrderByDescending(h => h.InitiatedAt)
                        .ToListAsync();

        public async Task<IEnumerable<AuditLog>> GetByBatchAsync(string batchId)
            => await _db.AuditLogs
                        .Include(h => h.InitiatedBy)
                        .Where(h => h.BatchId == batchId)
                        .OrderByDescending(h => h.InitiatedAt)
                        .ToListAsync();

        public async Task<IEnumerable<AuditLog>> GetChildLogsAsync(string parentAuditId)
            => await _db.AuditLogs
                        .Include(h => h.InitiatedBy)
                        .Where(h => h.ParentAuditId == parentAuditId)
                        .OrderByDescending(h => h.InitiatedAt)
                        .ToListAsync();

        public async Task AddAsync(AuditLog log)
            => await _db.AuditLogs.AddAsync(log);

        public Task DeleteAsync(AuditLog log)
        {
            _db.AuditLogs.Remove(log);
            return Task.CompletedTask;
        }

        public async Task DeleteAllAsync()
            => await _db.AuditLogs.ExecuteDeleteAsync();



        public async Task<IEnumerable<AuditRevertHistory>> GetRevertHistoryAsync(string auditLogId)
            => await _db.AuditRevertHistories
                        .Include(r => r.RevertedBy)
                        .Where(r => r.AuditLogId == auditLogId)
                        .OrderByDescending(r => r.RevertedAt)
                        .ToListAsync();

        public async Task AddRevertHistoryAsync(AuditRevertHistory revertHistory)
            => await _db.AuditRevertHistories.AddAsync(revertHistory);


        public async Task SaveChangesAsync()
            => await _db.SaveChangesAsync();
    }
}