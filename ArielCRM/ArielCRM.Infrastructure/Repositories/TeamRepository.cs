
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
 
 public class TeamRepository(AppDbContext context) : ITeamRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users
                .Include(x => x.Department)
                .Include(x => x.AccessLevel)
                .Include(x => x.Designation)
                .Include(x => x.EncryptionKey)
                .ToListAsync();
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _context.Users
                .Include(x => x.Department)
                .Include(x => x.Designation)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users
                .FirstOrDefaultAsync(x => x.Email == email);
        }

        public async Task AddAsync(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(User user)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

}
