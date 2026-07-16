using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IAuthRepository
    {
        Task<UserEncryptionKey?> GetEncryptionKeyByUserIdAsync(string userId);
        Task AddEncryptionKeyAsync(UserEncryptionKey entity);
        Task<User?> GetByEmailAsync(string email);

         Task<User?> GetByUserIdAsync(string email);

         
    }


  
}
