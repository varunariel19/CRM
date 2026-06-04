using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Shared.Utils;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _repository;
        private readonly IHistoryService _historyService;

        public TicketService(ITicketRepository repository, IHistoryService historyService)
        {
            _repository = repository;
            _historyService = historyService;
        }

        public async Task<List<TicketDto>> GetAllTicketsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<TicketDto> CreateTicketAsync(CreateTicketDto dto)
        {
            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                TicketCode = Utils.GenerateRandomCode(),
                AssignedToId = dto.AssignedToId,
                ClientId = dto.ClientId
            };

            var created = await _repository.CreateAsync(ticket);

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Ticket",
                EntityId = ticket.Id,
                ActionType = CRMActionType.Create,
                Title = $"Created ticket '{ticket.Title}'",
                PreviousState = null,
                UpdatedState = JsonSerializer.Serialize(ticket)
            });

            return created;
        }

        public async Task<bool> UpdateStatusAsync(UpdateTicketStatusDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(ticket);
            var oldStatus = ticket.Status;

            ticket.Status = dto.Status;
            var result = await _repository.UpdateAsync(ticket);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Ticket",
                    EntityId = ticket.Id,
                    ActionType = CRMActionType.Update,
                    Title = $"Updated ticket '{ticket.Title}' status from '{oldStatus}' to '{dto.Status}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = JsonSerializer.Serialize(ticket)
                });
            }

            return result;
        }

        public async Task<bool> UpdatePriorityAsync(UpdateTicketPriorityDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(ticket);
            var oldPriority = ticket.Priority;

            ticket.Priority = dto.Priority;
            var result = await _repository.UpdateAsync(ticket);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Ticket",
                    EntityId = ticket.Id,
                    ActionType = CRMActionType.Update,
                    Title = $"Updated ticket '{ticket.Title}' priority from '{oldPriority}' to '{dto.Priority}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = JsonSerializer.Serialize(ticket)
                });
            }

            return result;
        }

        public async Task<bool> UpdateAssigneeAsync(UpdateTicketAssigneeDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(ticket);
            var oldAssignee = ticket.AssignedToId;

            ticket.AssignedToId = dto.AssignedToId;
            var result = await _repository.UpdateAsync(ticket);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Ticket",
                    EntityId = ticket.Id,
                    ActionType = CRMActionType.Update,
                    Title = $"Updated ticket '{ticket.Title}' assignee from '{oldAssignee}' to '{dto.AssignedToId}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = JsonSerializer.Serialize(ticket)
                });
            }

            return result;
        }

        public async Task<bool> DeleteTicketAsync(string id)
        {
            var ticket = await _repository.GetByIdAsync(id);
            if (ticket == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(ticket);

            var result = await _repository.DeleteAsync(id);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Ticket",
                    EntityId = id,
                    ActionType = CRMActionType.Delete,
                    Title = $"Deleted ticket '{ticket.Title}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = null
                });
            }

            return result;
        }

        public async Task<IEnumerable<Ticket>> SearchTicketsAsync(string searchTerm)
        {
            return await _repository.SearchAsync(searchTerm);
        }
    }
}