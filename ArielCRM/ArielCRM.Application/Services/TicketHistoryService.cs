using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class TicketHistoryService(ITicketHistoryRepository repository) : ITicketHistoryService
    {
        public async Task<List<TicketHistoryResponseDto>> GetAllAsync()
        {
            var history = await repository.GetAllAsync();
            return [.. history.Select(MapToDto)];
        }

        public async Task<List<TicketHistoryResponseDto>> GetByTicketIdAsync(string ticketId)
        {
            var history = await repository.GetByTicketIdAsync(ticketId);
            return [.. history.Select(MapToDto)];
        }

        private static TicketHistoryResponseDto MapToDto(TicketHistory h) => new()
        {
            Id = h.Id,
            TicketId = h.TicketId,
            Title = h.Title,
            Content = h.Content,
            CreatedAt = h.CreatedAt,
            CommitedBy = new UserSummaryDto
            {
                Id = h.CommitedBy.Id,
                Name = h.CommitedBy.Name,
                ProfileImage = h.CommitedBy.ProfileImage
            }
        };
    }

}