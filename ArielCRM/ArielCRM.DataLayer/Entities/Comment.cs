using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("comments")]
    public class Comment
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("content")]
        public string Content { get; set; } = string.Empty;

        [Column("edited")]
        public bool Edited { get; set; } = false;

        [Required]
        [Column("user_id")]
        [MaxLength(50)]
        public string UserId { get; set; } = string.Empty;

        [Required]
        [Column("ticket_id")]
        [MaxLength(50)]
        public string TicketId { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("activity_log_id")]
        [MaxLength(50)]
        public string? ActivityLogId { get; set; }

        [ForeignKey(nameof(UserId))]
        public User? User { get; set; }

        [ForeignKey(nameof(TicketId))]
        public Task? Task { get; set; }

        [ForeignKey(nameof(ActivityLogId))]
        public ActivityLog? ActivityLog { get; set; }
    }
}