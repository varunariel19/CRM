using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IContactRepository
    {
        Task<IEnumerable<Contact>> GetAllAsync();
        Task<Contact?> GetByIdAsync(string id);
        Task AddAsync(Contact contact);
        void Update(Contact contact);
        void Delete(Contact contact);
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<Contact>> GetAllByAssigneeAsync(string userId);
    }
}
