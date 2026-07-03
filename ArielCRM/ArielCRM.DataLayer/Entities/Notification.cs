using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("notifications")]
    public class Notification
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("title")]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("message")]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [Column("entity_type")]
        [MaxLength(100)]
        public string? EntityType { get; set; }

        [Column("entity_id")]
        [MaxLength(50)]
        public string? EntityId { get; set; }

        [Column("link")]
        [MaxLength(500)]
        public string? Link { get; set; }

        [Required]
        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}