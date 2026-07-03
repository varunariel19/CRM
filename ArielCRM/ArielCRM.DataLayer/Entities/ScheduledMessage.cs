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
        [MaxLength(4000)]
        public string? Content { get; set; } = string.Empty;

        [Required]
        [Column("scheduled_at")]
        public DateTime ScheduledAt { get; set; }

        /// <summary>
        /// The BullMQ job ID returned by the Node scheduler. Used to cancel
        /// or reschedule via DELETE/PATCH /jobs/{id} on the scheduling service.
        /// </summary>
        [Column("job_id")]
        [MaxLength(100)]
        public string? JobId { get; set; }

        /// <summary>Pending, Sent, Cancelled, or Failed.</summary>
        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        [Column("failure_reason")]
        [MaxLength(1000)]
        public string? FailureReason { get; set; }

        /// <summary>Set once the .NET webhook fires and the real TeamMessage is created.</summary>
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
    }
}