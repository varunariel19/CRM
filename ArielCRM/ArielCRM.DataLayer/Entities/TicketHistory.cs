namespace ArielCRM.DataLayer.Entities
{
public class TicketHistory
{
    public Guid Id { get; set; }
    public string TicketId { get; set; } = string.Empty;
    public TicketTask Ticket { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; } = null;
    public UserSummaryDto1  CommitedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

 public class UserSummaryDto1
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
    }

}