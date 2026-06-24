using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{

    public class TicketHistoryRepository(AppDbContext context) : ITicketHistoryRepository
    {
        private readonly AppDbContext _context = context;

        public async Task CreateAsync(TicketHistory history)
        {
            await _context.TicketHistories.AddAsync(history);
            await _context.SaveChangesAsync();
        }

        public async Task<List<TicketHistory>> GetByTicketIdAsync(string ticketId)
        {
            return await _context.TicketHistories
                .Where(x => x.TicketId == ticketId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
    }

}