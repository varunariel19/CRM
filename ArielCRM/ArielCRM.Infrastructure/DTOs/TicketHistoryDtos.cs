namespace ArielCRM.Infrastructure.DTOs
{
    public class TicketHistoryResponseDto
    {
        public Guid Id { get; set; }
        public string TicketId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserSummaryDto CommitedBy { get; set; } = null!;
    }


}