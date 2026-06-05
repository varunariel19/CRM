using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class LeadService : ILeadService
    {
        private readonly ILeadRepository _leadRepository;
        private readonly IHistoryService _historyService;

        public LeadService(ILeadRepository leadRepository, IHistoryService historyService)
        {
            _leadRepository = leadRepository;
            _historyService = historyService;
        }

        public Task<IEnumerable<LeadResponseDto>> GetAllLeadsAsync()
            => _leadRepository.GetAllAsync();

        public Task<IEnumerable<LeadResponseDto>> SearchLeadsAsync(string query)
            => _leadRepository.SearchAsync(query);

        public Task<LeadResponseDto?> GetLeadByIdAsync(string id)
            => _leadRepository.GetByIdAsync(id);

        public async Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto)
        {
            var lead = new Lead
            {
                Name = dto.Name,
                Company = dto.Company,
                Email = dto.Email,
                Phone = dto.Phone,
                Source = dto.Source,
                AssignedToId = dto.AssignedToId
            };

            var created = await _leadRepository.CreateAsync(lead);

            if (created == null)
                throw new Exception("Failed to create lead.");

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Lead",
                EntityId = created.Id,                        
                ActionType = CRMActionType.Create.ToString(),
                Title = $"Created lead '{created.Name}'",     
                PreviousState = string.Empty,
                UpdatedState = JsonSerializer.Serialize(created)
            });

            return created;
        }

        public async Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentException("Lead id is null or empty.", nameof(id));

            var existing = await _leadRepository.GetByIdAsync(id);
            if (existing == null) return null;

            var previousSnapshot = JsonSerializer.Serialize(existing);
            var existingName = existing.Name; 

            var updated = await _leadRepository.UpdateLeadAsync(id, dto);
            if (updated == null) return null;

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Lead",
                EntityId = id,
                ActionType = CRMActionType.Update.ToString(),
                Title = $"Updated lead '{existingName}'",   
                PreviousState = previousSnapshot,
                UpdatedState = JsonSerializer.Serialize(updated)
            });

            return updated;
        }

        public async Task<bool> DeleteLeadAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentException("Lead id is null or empty.", nameof(id));

            var existing = await _leadRepository.GetByIdAsync(id);
            if (existing == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(existing);

            var result = await _leadRepository.DeleteAsync(id);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Lead",
                    EntityId = id,
                    ActionType = CRMActionType.Delete.ToString(),
                    Title = $"Deleted lead '{existing.Name}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = string.Empty   
                });
            }

            return result;
        }
    }
}