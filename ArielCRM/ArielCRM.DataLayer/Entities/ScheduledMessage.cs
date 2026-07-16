using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("scheduled_team_messages")]
    public class ScheduledTeamMessage
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("conversation_id")]
        [MaxLength(50)]
        public string ConversationId { get; set; } = string.Empty;

        [ForeignKey(nameof(ConversationId))]
        public TeamConversation Conversation { get; set; } = null!;

        [Required]
        [Column("sender_id")]
        [MaxLength(50)]
        public string SenderId { get; set; } = string.Empty;

        [ForeignKey(nameof(SenderId))]
        public User Sender { get; set; } = null!;

        [Column("content")]
        [MaxLength(8000)]
        public string? Content { get; set; } = string.Empty;

        [Column("iv")]
        [MaxLength(100)]
        public string? Iv { get; set; }

        [Required]
        [Column("scheduled_at")]
        public DateTime ScheduledAt { get; set; }

        [Column("job_id")]
        [MaxLength(100)]
        public string? JobId { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        [Column("failure_reason")]
        [MaxLength(1000)]
        public string? FailureReason { get; set; }

        [Column("sent_message_id")]
        [MaxLength(50)]
        public string? SentMessageId { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("cancelled_at")]
        public DateTime? CancelledAt { get; set; }

        public ICollection<ScheduledTeamMessageAttachment> Attachments { get; set; } = [];

        public ICollection<ScheduledTeamMessageKey> Keys { get; set; } = [];
    }
}