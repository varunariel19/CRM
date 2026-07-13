using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("user_encryption_keys")]
    public class UserEncryptionKey
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey(nameof(UserId))]
        public User User { get; set; } = null!;

        [Required]
        [Column("public_key", TypeName = "text")]
        public string PublicKey { get; set; } = string.Empty;

        [Required]
        [Column("encrypted_private_key", TypeName = "text")]
        public string EncryptedPrivateKey { get; set; } = string.Empty;

        [Required]
        [Column("salt", TypeName = "text")]
        public string Salt { get; set; } = string.Empty;   

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }   
    }
}