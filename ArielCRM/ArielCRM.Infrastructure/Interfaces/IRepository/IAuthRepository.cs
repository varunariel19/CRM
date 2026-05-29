using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IAuthRepository
    {
        Task<User?> GetByEmailAsync(string email);
    }

  
}
