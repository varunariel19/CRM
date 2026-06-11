using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string id);
        Task UpdateAsync(User user);
    }


}