using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("notification_recipients")]
    public class NotificationRecipient
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("notification_id")]
        [MaxLength(50)]
        public string NotificationId { get; set; } = string.Empty;

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("is_read")]
        public bool IsRead { get; set; } = false;

        [Column("read_at")]
        public DateTime? ReadAt { get; set; }

        [ForeignKey(nameof(NotificationId))]
        public Notification? Notification { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }
    }
}