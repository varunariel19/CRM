using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
        public class HistoryRepository : IHistoryRepository
        {
            private readonly AppDbContext _db;

            public HistoryRepository(AppDbContext db)
            {
                _db = db;
            }

            public async Task<CRMHistory?> GetByIdAsync(string id)
                => await _db.CRMHistories
                            .Include(h => h.InitiatedBy)
                            .FirstOrDefaultAsync(h => h.Id == id);

            public async Task<(IEnumerable<CRMHistory> Items, int TotalCount)> GetAllAsync(HistoryFilterDto filter)
            {
                var query = _db.CRMHistories
                               .Include(h => h.InitiatedBy)
                               .AsQueryable();

                if (!string.IsNullOrWhiteSpace(filter.EntityName))
                    query = query.Where(h => h.EntityName == filter.EntityName);

                if (!string.IsNullOrWhiteSpace(filter.EntityId))
                    query = query.Where(h => h.EntityId == filter.EntityId);

                if (filter.ActionType.HasValue)
                    query = query.Where(h => h.ActionTypeRaw == filter.ActionType.Value.ToString());

                if (!string.IsNullOrWhiteSpace(filter.InitiatedById))
                    query = query.Where(h => h.InitiatedById == filter.InitiatedById);

                if (filter.From.HasValue)
                    query = query.Where(h => h.InitiatedAt >= filter.From.Value);

                if (filter.To.HasValue)
                    query = query.Where(h => h.InitiatedAt <= filter.To.Value);

                var total = await query.CountAsync();

                var items = await query
                    .OrderByDescending(h => h.InitiatedAt)
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                return (items, total);
            }

            public async Task<IEnumerable<CRMHistory>> GetByEntityAsync(string entityName, string entityId)
                => await _db.CRMHistories
                            .Include(h => h.InitiatedBy)
                            .Where(h => h.EntityName == entityName && h.EntityId == entityId)
                            .OrderByDescending(h => h.InitiatedAt)
                            .ToListAsync();

            public async Task AddAsync(CRMHistory history)
                => await _db.CRMHistories.AddAsync(history);

            public Task DeleteAsync(CRMHistory history)
            {
                _db.CRMHistories.Remove(history);
                return Task.CompletedTask;
            }

            public async Task DeleteAllAsync()
                => await _db.CRMHistories.ExecuteDeleteAsync();

            public async Task SaveChangesAsync()
                => await _db.SaveChangesAsync();
        }
}
