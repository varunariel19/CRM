using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface IDealService
    {
        Task<IEnumerable<Deal>> GetAllDealsAsync();
        Task<Deal?> GetDealByIdAsync(string id);
        Task<Deal> CreateDealAsync(CreateDealDto dto);
        Task<Deal?> UpdateDealAsync(string id, UpdateDealDto dto);
        Task<bool> UpdateDealStageAsync(string id, DealStage stage);
    }
}
