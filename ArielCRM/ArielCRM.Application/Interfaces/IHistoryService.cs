using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface IHistoryService
    {
        Task LogAsync(LogHistoryRequest request);
        Task<HistoryResponseDto> CreateManualAsync(CreateHistoryDto dto, string initiatedById);

        Task<PaginatedHistoryDto> GetAllAsync(HistoryFilterDto filter);
        Task<IEnumerable<HistoryResponseDto>> GetByEntityAsync(string entityName, string entityId);
        Task<IEnumerable<HistoryResponseDto>> GetByBatchAsync(string batchId);
        Task<IEnumerable<HistoryResponseDto>> GetChildLogsAsync(string parentAuditId);
        Task<HistoryResponseDto?> GetByIdAsync(string id);

        Task RevertAsync(string auditLogId);
        Task<IEnumerable<RevertHistoryResponseDto>> GetRevertHistoryAsync(string auditLogId);

        Task DeleteAsync(string id);
        Task DeleteAllAsync();
    }
}