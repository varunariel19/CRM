using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("team_messages")]
    public class TeamMessage
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

        [Required]
        [Column("body")]
        [MaxLength(4000)]
        public string Body { get; set; } = string.Empty;

        [Required]
        [Column("sent_at")]
        public DateTime SentAt { get; set; } = DateTime.UtcNow;

        [Column("edited_at")]
        public DateTime? EditedAt { get; set; }

        public ICollection<TeamMessageAttachment> Attachments { get; set; } = new List<TeamMessageAttachment>();
    }
}
