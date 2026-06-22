using ArielCRM.DataLayer.Entities;
namespace ArielCRM.Infrastructure.Interfaces.IRepository
{

    public interface ITaskManagementRepository
    {
        Task<List<TicketTask>> GetAllAsync();

        Task<TicketTask?> GetByIdAsync(string taskId);

        Task CreateAsync(TicketTask task);

        Task UpdateAsync(TicketTask task);

        Task DeleteAsync(TicketTask task);
    }
}
