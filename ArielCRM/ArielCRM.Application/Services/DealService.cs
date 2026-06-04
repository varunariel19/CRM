using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ArielCRM.Application.Services
{
    public class DealService : IDealService
    {
        private readonly IDealRepository _dealRepository;
        private readonly IHistoryService _historyService;

        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false,
            ReferenceHandler = ReferenceHandler.IgnoreCycles,  
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public DealService(IDealRepository dealRepository, IHistoryService historyService)
        {
            _dealRepository = dealRepository;
            _historyService = historyService;
        }

        public async Task<IEnumerable<Deal>> GetAllDealsAsync()
        {
            return await _dealRepository.GetAllAsync();
        }

        public async Task<Deal?> GetDealByIdAsync(string id)
        {
            return await _dealRepository.GetByIdAsync(id);
        }

        public async Task<Deal> CreateDealAsync(CreateDealDto dto)
        {
            var deal = new Deal
            {
                Title = dto.Title,
                Value = dto.Value,
                Stage = dto.Stage,
                CloseDate = dto.CloseDate,
                AssignedToId = dto.AssignedToId,
                ContactId = dto.ContactId
            };

            await _dealRepository.AddAsync(deal);
            await _dealRepository.SaveChangesAsync();

            var created = await _dealRepository.GetByIdAsync(deal.Id) ?? deal;

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Deal",
                EntityId = created.Id,
                ActionType = CRMActionType.Create,
                Title = $"Created deal '{created.Title}'",
                PreviousState = null,
                UpdatedState = JsonSerializer.Serialize(created)
            });

            return created;
        }

        public async Task<Deal?> UpdateDealAsync(string id, UpdateDealDto dto)
        {
            var deal = await _dealRepository.NormalGetByIdAsync(id);
            if (deal == null) return null;

            var previousSnapshot = JsonSerializer.Serialize(deal , _jsonOpts);

            deal.Title = dto.Title;
            deal.Value = dto.Value;
            deal.Stage = dto.Stage;
            deal.CloseDate = dto.CloseDate;
            deal.AssignedToId = dto.AssignedToId;
            deal.ContactId = dto.ContactId;

            _dealRepository.Update(deal);
            await _dealRepository.SaveChangesAsync();

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Deal",
                EntityId = deal.Id,
                ActionType = CRMActionType.Update,
                Title = $"Updated deal '{deal.Title}'",
                PreviousState = previousSnapshot,
                UpdatedState = JsonSerializer.Serialize(deal)
            });

            return deal;
        }

        public async Task<bool> UpdateDealStageAsync(string id, DealStage stage)
        {
            var deal = await _dealRepository.GetByIdAsync(id);
            if (deal == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(deal, _jsonOpts);
            var oldStage = deal.Stage;

            deal.Stage = stage;
            _dealRepository.Update(deal);
            var result = await _dealRepository.SaveChangesAsync();

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Deal",
                    EntityId = deal.Id,
                    ActionType = CRMActionType.Update,
                    Title = $"Updated deal '{deal.Title}' stage from '{oldStage}' to '{stage}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = JsonSerializer.Serialize(deal , _jsonOpts)
                });
            }

            return result;
        }

        public async Task<bool> DeleteDealAsync(string id)
        {
            var deal = await _dealRepository.GetByIdAsync(id);
            if (deal == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(deal);

            _dealRepository.Delete(deal);
            var result = await _dealRepository.SaveChangesAsync();

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Deal",
                    EntityId = id,
                    ActionType = CRMActionType.Delete,
                    Title = $"Deleted deal '{deal.Title}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = null
                });
            }

            return result;
        }
    }
}