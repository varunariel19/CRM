using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;

namespace ArielCRM.Infrastructure.Repositories
{
    public class UserRepository(AppDbContext db) : IUserRepository
    {
        private readonly AppDbContext _db = db;

        public async Task<User?> GetByIdAsync(string id)
            => await _db.Users.FindAsync(id);

        public async Task UpdateAsync(User user)
        {
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
        }
    }
}