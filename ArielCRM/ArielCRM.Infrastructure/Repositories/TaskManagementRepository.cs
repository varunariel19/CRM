using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;
namespace ArielCRM.Infrastructure.Repositories
{
    public class TaskManagementRepository(AppDbContext context) : ITaskManagementRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<List<TicketTask>> GetAllAsync()
        {
            return await _context.TicketTasks
                .Include(x => x.AssignedUser)
                .Include(x => x.ReportedUser)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<TicketTask?> GetByIdAsync(string taskId)
        {
            return await _context.TicketTasks
                .Include(x => x.AssignedUser)
                .Include(x => x.ReportedUser)
                .FirstOrDefaultAsync(x => x.TaskId == taskId);
        }

        public async Task CreateAsync(TicketTask task)
        {

            var reportedUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == task.ReportedById) ?? throw new Exception("User not found.");
            var history = new TicketHistory
            {
                Id = Guid.NewGuid(),
                TicketId = task.TaskId,
                Title = $"{reportedUser.Name} Created the Work Item.",
                Content = null,
                CommitedBy = new UserSummaryDto1
                {
                    Id = reportedUser.Id,
                    Name = reportedUser.Name,
                    ProfileImage = reportedUser.ProfileImage ?? null
                },
                CreatedAt = DateTime.UtcNow
            };

            await _context.TicketTasks.AddAsync(task);
            await _context.TicketHistories.AddAsync(history);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(TicketTask task)
        {
            _context.TicketTasks.Update(task);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TicketTask task)
        {
            _context.TicketTasks.Remove(task);
            await _context.SaveChangesAsync();
        }
    }
}
