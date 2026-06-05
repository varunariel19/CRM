using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.DTOs
{

        public class CreateHistoryDto
        {
            public string EntityName { get; set; } = string.Empty;
            public string EntityId { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public CRMActionType ActionType { get; set; }
            public string? PreviousState { get; set; }
            public string? UpdatedState { get; set; }
            public string? ModifiedData { get; set; }
        }

        public class HistoryFilterDto
        {
            public string? EntityName { get; set; }
            public string? EntityId { get; set; }
            public CRMActionType? ActionType { get; set; }
            public string? InitiatedById { get; set; }
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
            public string Title { get; set; } = string.Empty;
            public string ActionType { get; set; } = string.Empty;
            public string RevertType { get; set; } = string.Empty;
            public string? ModifiedData { get; set; }
            public string? PreviousState { get; set; }
            public string? UpdatedState { get; set; }
            public DateTime InitiatedAt { get; set; }
            public string InitiatedById { get; set; } = string.Empty;
            public string? InitiatedByName { get; set; }
        }

        public class PaginatedHistoryDto
        {
            public IEnumerable<HistoryResponseDto> Items { get; set; } = [];
            public int TotalCount { get; set; }
            public int Page { get; set; }
            public int PageSize { get; set; }
            public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        }

        public class LogHistoryRequest
        {
            public string EntityName { get; set; } = string.Empty;
            public string EntityId { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string ActionType { get; set; } = string.Empty;

            public string? PreviousState { get; set; }

            public string? UpdatedState { get; set; }
        }
}
