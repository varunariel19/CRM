using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class LeadService(ILeadRepository leadRepository, IHistoryService historyService, IConfiguration configuration) : ILeadService
    {
        private readonly ILeadRepository _leadRepository = leadRepository;
        private readonly IHistoryService _historyService = historyService;
        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
        private readonly IConfiguration _configuration = configuration;

        public Task<IEnumerable<LeadResponseDto>> GetAllLeadsAsync(HttpContext context)
        {
            // if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
            //     return Task.FromResult(Enumerable.Empty<LeadResponseDto>());

            // var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            // if (userId is null) return Task.FromResult(Enumerable.Empty<LeadResponseDto>());

            // var adminAccessLvlId = _configuration["Seeding:AdminLevel"];
            // var accessLevelId = context.User.FindFirst("AccessLevelId")?.Value;

            // if (accessLevelId == adminAccessLvlId)
            // {
            // }

            return _leadRepository.GetAllAsync();
            // return _leadRepository.GetAllByAssigneeAsync(userId);
        }

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
                AssignedToId = dto.AssignedToId,
                ProjectTitle = dto.ProjectTitle,
                ProjectType = dto.ProjectType,
                Budget = dto.Budget,
                DealStartDate = dto.DealStartDate,
                DealCloseDate = dto.DealCloseDate ?? null,
            };

            var created = await _leadRepository.CreateAsync(lead)
                ?? throw new Exception("Failed to create lead.");

            try
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Lead",
                    EntityId = created.Id,
                    EntityDisplayName = created.Name,
                    ActionType = AuditActionType.Create.ToString(),
                    Title = $"Created lead '{created.Name}'",
                    ActionDescription = $"New lead created for '{created.Company}'",
                    PreviousState = null,
                    UpdatedState = JsonSerializer.Serialize(created, _jsonOpts),
                    Source = AuditSourceType.User
                });
            }
            catch (Exception)
            {
            }

            return created;
        }

        public async Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentException("Lead id is null or empty.", nameof(id));

            var existing = await _leadRepository.GetByIdAsync(id);
            if (existing is null) return null;

            var previousSnapshot = JsonSerializer.Serialize(existing, _jsonOpts);

            var updated = await _leadRepository.UpdateLeadAsync(id, dto);
            if (updated is null) return null;

            try
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Lead",
                    EntityId = id,
                    EntityDisplayName = existing.Name,
                    ActionType = AuditActionType.Update.ToString(),
                    Title = $"Updated lead '{existing.Name}'",
                    ActionDescription = "Lead details modified",
                    PreviousState = previousSnapshot,
                    UpdatedState = JsonSerializer.Serialize(updated, _jsonOpts),
                    Source = AuditSourceType.User
                });
            }
            catch (Exception )
            {
                // swallow — history failure should not block lead update
            }

            return updated;
        }

        public async Task<bool> DeleteLeadAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                throw new ArgumentException("Lead id is null or empty.", nameof(id));

            var existing = await _leadRepository.GetByIdAsync(id);
            if (existing is null) return false;

            var previousSnapshot = JsonSerializer.Serialize(existing, _jsonOpts);

            var result = await _leadRepository.DeleteAsync(id);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Lead",
                    EntityId = id,
                    EntityDisplayName = existing.Name,
                    ActionType = AuditActionType.Delete.ToString(),
                    Title = $"Deleted lead '{existing.Name}'",
                    ActionDescription = "Lead permanently removed",
                    PreviousState = previousSnapshot,
                    UpdatedState = null,                  // nothing exists after delete
                    Source = AuditSourceType.User
                });
            }

            return result;
        }


    }
}