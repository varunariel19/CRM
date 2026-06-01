using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Repositories;
using ArielCRM.Shared.Utils;

namespace ArielCRM.Application.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _repository;

        public TicketService(ITicketRepository repository)
        {
            _repository = repository;
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

            return await _repository.CreateAsync(ticket);
        }

        public async Task<bool> UpdateStatusAsync(UpdateTicketStatusDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            ticket.Status = dto.Status;
            return await _repository.UpdateAsync(ticket);
        }

        public async Task<bool> UpdatePriorityAsync(UpdateTicketPriorityDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            ticket.Priority = dto.Priority;
            return await _repository.UpdateAsync(ticket);
        }

        public async Task<bool> UpdateAssigneeAsync(UpdateTicketAssigneeDto dto)
        {
            var ticket = await _repository.GetByIdAsync(dto.Id);
            if (ticket == null) return false;

            ticket.AssignedToId = dto.AssignedToId;
            return await _repository.UpdateAsync(ticket);
        }

        public async Task<bool> DeleteTicketAsync(string id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<IEnumerable<Ticket>> SearchTicketsAsync(string searchTerm)
        {
            return await _repository.SearchAsync(searchTerm);
        }
    }
}
