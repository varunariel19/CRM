using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class DealService(IDealRepository dealRepository) : IDealService
    {
        private readonly IDealRepository _dealRepository = dealRepository;

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
            return await _dealRepository.GetByIdAsync(deal.Id) ?? deal;
        }

        public async Task<Deal?> UpdateDealAsync(string id, UpdateDealDto dto)
        {
            var deal = await _dealRepository.GetByIdAsync(id);
            if (deal == null) return null;

            deal.Title = dto.Title;
            deal.Value = dto.Value;
            deal.Stage = dto.Stage;
            deal.CloseDate = dto.CloseDate;
            deal.AssignedToId = dto.AssignedToId;
            deal.ContactId = dto.ContactId;

            _dealRepository.Update(deal);
            await _dealRepository.SaveChangesAsync();
            return deal;
        }

        public async Task<bool> UpdateDealStageAsync(string id, DealStage stage)
        {
            var deal = await _dealRepository.GetByIdAsync(id);
            if (deal == null) return false;

            deal.Stage = stage;
            _dealRepository.Update(deal);
            return await _dealRepository.SaveChangesAsync();
        }
    }
}
