using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.DTOs
{
    public class LogHistoryRequest
    {
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string? EntityDisplayName { get; set; }
        public string? EntityUrl { get; set; }
        public string? ActionDescription { get; set; }
        public string? PreviousState { get; set; }
        public string? UpdatedState { get; set; }
        public string? BatchId { get; set; }
        public string? ParentAuditId { get; set; }
        public string? ExtraMetadata { get; set; }
        public AuditSourceType Source { get; set; } = AuditSourceType.User;
    }

    public class CreateHistoryDto
    {
        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public AuditActionType ActionType { get; set; }
        public string? EntityDisplayName { get; set; }
        public string? EntityUrl { get; set; }
        public string? ActionDescription { get; set; }
        public string? PreviousState { get; set; }
        public string? UpdatedState { get; set; }
        public string? DiffData { get; set; }
        public string? BatchId { get; set; }
        public string? ParentAuditId { get; set; }
        public string? ExtraMetadata { get; set; }
        public AuditSourceType Source { get; set; } = AuditSourceType.User;
    }

    public class RevertHistoryRequest
    {
        public string AuditLogId { get; set; } = string.Empty;
        public string? RevertNote { get; set; }
    }


    public class HistoryFilterDto
    {
        public string? EntityName { get; set; }
        public string? EntityId { get; set; }
        public AuditActionType? ActionType { get; set; }
        public AuditSourceType? Source { get; set; }
        public AuditStatus? Status { get; set; }
        public string? InitiatedById { get; set; }
        public string? BatchId { get; set; }
        public string? AffectedField { get; set; }
        public bool? IsReverted { get; set; }
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }


    public class HistoryResponseDto
    {
        public string Id { get; set; } = string.Empty;

        public string EntityName { get; set; } = string.Empty;
        public string EntityId { get; set; } = string.Empty;
        public string? EntityDisplayName { get; set; }
        public string? EntityUrl { get; set; }

        public string Title { get; set; } = string.Empty;
        public string ActionType { get; set; } = string.Empty;
        public string? ActionDescription { get; set; }

        public string RevertType { get; set; } = string.Empty;
        public bool IsReverted { get; set; }
        public DateTime? RevertedAt { get; set; }

        public string? DiffData { get; set; }
        public string? AffectedFields { get; set; }
        public string? PreviousState { get; set; }
        public string? UpdatedState { get; set; }

        public string? BatchId { get; set; }
        public string? ParentAuditId { get; set; }

        public string Status { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty;
        public string? FailureReason { get; set; }

        public string? IpAddress { get; set; }
        public string? CorrelationId { get; set; }

        public DateTime InitiatedAt { get; set; }
        public UserSummaryDto CommitedBy { get; set; } = null!;

    }

    public class RevertHistoryResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string AuditLogId { get; set; } = string.Empty;
        public string? SnapshotBeforeRevert { get; set; }
        public string? SnapshotAfterRevert { get; set; }
        public string? RevertNote { get; set; }
        public DateTime RevertedAt { get; set; }
        public string RevertedById { get; set; } = string.Empty;
        public string? RevertedByName { get; set; }
    }

    public class PaginatedHistoryDto
    {
        public IEnumerable<HistoryResponseDto> Items { get; set; } = [];
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
}