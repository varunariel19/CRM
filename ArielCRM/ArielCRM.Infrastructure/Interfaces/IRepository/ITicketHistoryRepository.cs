using ArielCRM.DataLayer.Entities;


namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface ITicketHistoryRepository
    {
        Task CreateAsync(TicketHistory history);

        Task<List<TicketHistory>> GetByTicketIdAsync(string ticketId);
        Task<List<TicketHistory>> GetAllAsync();
    }

}