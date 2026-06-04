using ArielCRM.Infrastructure.DTOs;
namespace ArielCRM.Application.Interfaces
{
        public interface IHistoryService
        {
            Task LogAsync(LogHistoryRequest request);

            Task<PaginatedHistoryDto> GetAllAsync(HistoryFilterDto filter);
            Task<IEnumerable<HistoryResponseDto>> GetByEntityAsync(string entityName, string entityId);
            Task<HistoryResponseDto?> GetByIdAsync(string id);
            Task<HistoryResponseDto> CreateManualAsync(CreateHistoryDto dto, string initiatedById);
            Task DeleteAsync(string id);
            Task DeleteAllAsync();
            Task RevertAsync(string historyId, string initiatedById);
        }
}
