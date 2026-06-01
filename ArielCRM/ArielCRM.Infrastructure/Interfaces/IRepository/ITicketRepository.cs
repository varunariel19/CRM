using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface ITicketRepository
    {
        Task<List<TicketDto>> GetAllAsync();
        Task<Ticket?> GetByIdAsync(string id);
        Task<TicketDto> CreateAsync(Ticket ticket);
        Task<bool> UpdateAsync(Ticket ticket);
        Task<bool> DeleteAsync(string id);
        Task<IEnumerable<Ticket>> SearchAsync(string searchTerm);
    }
}
