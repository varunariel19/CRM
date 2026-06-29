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
        [Column("seen_by_ids", TypeName = "text[]")]
        public string[] SeenByIds { get; set; } = [];

        [Column("content")]
        [MaxLength(4000)]
        public string? Content { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        public ICollection<TeamMessageAttachment> Attachments { get; set; } = new List<TeamMessageAttachment>();
    }
}
