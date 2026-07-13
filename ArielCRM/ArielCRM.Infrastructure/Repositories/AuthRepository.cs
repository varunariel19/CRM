using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{

    namespace ArielCRM.Infrastructure.Repository
    {
        public class AuthRepository(AppDbContext db) : IAuthRepository
        {
            private readonly AppDbContext _db = db;

            public async Task<User?> GetByEmailAsync(string email)
            {
                return await _db.Users
                    .Include(u => u.Department)
                    .Include(u => u.Designation)
                    .Include(u => u.EncryptionKey)
                    .Include(u => u.AccessLevel)
                        .ThenInclude(a => a.Permissions)
                            .ThenInclude(p => p.Permission)
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
        }
    }
}
