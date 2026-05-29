using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IDealRepository
    {
        Task<IEnumerable<Deal>> GetAllAsync();
        Task<Deal?> GetByIdAsync(string id);
        Task AddAsync(Deal deal);
        void Update(Deal deal);
        Task<bool> SaveChangesAsync();
    }
}
