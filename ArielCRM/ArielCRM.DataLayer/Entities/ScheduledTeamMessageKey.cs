using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("scheduled_team_message_keys")]
    public class ScheduledTeamMessageKey
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("scheduled_message_id")]
        [MaxLength(50)]
        public string ScheduledMessageId { get; set; } = string.Empty;

        [ForeignKey(nameof(ScheduledMessageId))]
        public ScheduledTeamMessage ScheduledMessage { get; set; } = null!;

        [Required]
        [Column("recipient_id")]
        [MaxLength(50)]
        public string RecipientId { get; set; } = string.Empty;

        [ForeignKey(nameof(RecipientId))]
        public User Recipient { get; set; } = null!;

        [Required]
        [Column("encrypted_aes_key", TypeName = "text")]
        public string EncryptedAesKey { get; set; } = string.Empty;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}