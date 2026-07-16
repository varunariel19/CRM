using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
   
    [Table("team_message_keys")]
    public class TeamMessageKey
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("message_id")]
        [MaxLength(50)]
        public string MessageId { get; set; } = string.Empty;

        [ForeignKey(nameof(MessageId))]
        public TeamMessage Message { get; set; } = null!;

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