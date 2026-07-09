
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface ITicketHistoryService
    {
        Task<List<TicketHistoryResponseDto>> GetAllAsync();
        Task<List<TicketHistoryResponseDto>> GetByTicketIdAsync(string ticketId);
    }
}