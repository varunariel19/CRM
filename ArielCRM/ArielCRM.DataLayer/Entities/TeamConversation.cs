using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    public enum ScheduledMessageStatus
    {
        Pending,
        Sent,
        Cancelled,
        Failed
    }

        [Table("team_conversations")]
        public class TeamConversation
        {
            [Key]
            [Column("id")]
            [MaxLength(50)]
            public string Id { get; set; } = Guid.NewGuid().ToString();

            [Column("name")]
            [MaxLength(120)]
            public string? Name { get; set; }

            [Required]
            [Column("is_group")]
            public bool IsGroup { get; set; }

            [Required]
            [Column("created_by_id")]
            [MaxLength(50)]
            public string CreatedById { get; set; } = string.Empty;

            [ForeignKey(nameof(CreatedById))]
            public User CreatedBy { get; set; } = null!;

            [Required]
            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            [Column("last_message_at")]
            public DateTime? LastMessageAt { get; set; }

            [Required]
            [Column("members", TypeName = "text[]")]
            public string[] Members { get; set; } = [];

            public ICollection<TeamMessage> Messages { get; set; } = [];
        }
}
