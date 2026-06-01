using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface ITicketService
    {
        Task<List<TicketDto>> GetAllTicketsAsync();
        Task<TicketDto> CreateTicketAsync(CreateTicketDto dto);
        Task<bool> UpdateStatusAsync(UpdateTicketStatusDto dto);
        Task<bool> UpdatePriorityAsync(UpdateTicketPriorityDto dto);
        Task<bool> UpdateAssigneeAsync(UpdateTicketAssigneeDto dto);
        Task<IEnumerable<Ticket>> SearchTicketsAsync(string searchTerm);
        Task<bool> DeleteTicketAsync(string id);
    }
}
