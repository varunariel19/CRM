using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
        public class CrmTaskRepository(AppDbContext db) : ICrmTaskRepository
        {
            private readonly AppDbContext _db = db;

        public async Task<IEnumerable<CrmTask>> GetAllAsync()
            {
                return await _db.Tasks
                    .Include(t => t.AssignedTo)
                    .Include(t => t.Lead)
                    .Include(t => t.Deal)
                    .OrderByDescending(t => t.CreatedAt)
                    .ToListAsync();
            }

            public async Task<CrmTask?> GetByIdAsync(string id)
            {
                return await _db.Tasks
                    .Include(t => t.AssignedTo)
                    .Include(t => t.Lead)
                    .Include(t => t.Deal)
                    .FirstOrDefaultAsync(t => t.Id == id);
            }

            public async Task<CrmTask> CreateAsync(CrmTask task)
            {
                _db.Tasks.Add(task);
                await _db.SaveChangesAsync();
                return task;
            }

            public async Task<bool> DeleteAsync(string id)
            {
                var task = await _db.Tasks.FindAsync(id);
                if (task == null) return false;

                _db.Tasks.Remove(task);
                await _db.SaveChangesAsync();
                return true;
            }


        public async Task<bool> UpdateStatusAsync(CrmTask task)
        {
            _db.Entry(task).Property(t => t.Status).IsModified = true;

            return await _db.SaveChangesAsync() > 0;
        }
    }
}
