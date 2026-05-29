using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{

    namespace ArielCRM.Infrastructure.Repository
    {
        public class AuthRepository : IAuthRepository
        {
            private readonly AppDbContext _db;

            public AuthRepository(AppDbContext db)
            {
                _db = db;
            }

            public async Task<User?> GetByEmailAsync(string email)
            {
                return await _db.Users
                    .FirstOrDefaultAsync(u => u.Email == email);
            }
        }
    }
}
