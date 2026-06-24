using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("team_conversation_members")]
    public class TeamConversationMember
    {
        [Required]
        [Column("conversation_id")]
        [MaxLength(50)]
        public string ConversationId { get; set; } = string.Empty;

        [ForeignKey(nameof(ConversationId))]
        public TeamConversation Conversation { get; set; } = null!;

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        [Column("joined_at")]
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        [Column("last_read_at")]
        public DateTime? LastReadAt { get; set; }
    }
}
