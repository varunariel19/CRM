using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class DealRepository(AppDbContext context) : IDealRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<IEnumerable<Deal>> GetAllAsync()
        {
            return await _context.Set<Deal>()
                .Include(d => d.AssignedTo)
                .Include(d => d.Contact)
                .ToListAsync();
        }

        public async Task<Deal?> GetByIdAsync(string id)
        {
            return await _context.Set<Deal>()
                .Include(d => d.AssignedTo)
                .Include(d => d.Contact)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<Deal?> NormalGetByIdAsync(string id)
        {
            return await _context.Deals.FindAsync(id);
        }

        public async Task AddAsync(Deal deal)
        {
            await _context.Set<Deal>().AddAsync(deal);
        }

        public void Update(Deal deal)
        {
            _context.Set<Deal>().Update(deal);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }

        public void Delete(Deal deal)
        {
            _context.Deals.Remove(deal);
        }
    }
}
