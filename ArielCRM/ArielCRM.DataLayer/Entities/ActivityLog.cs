using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("activity_log")]
    public class ActivityLog
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("action")]
        [MaxLength(255)]
        public string Action { get; set; } = string.Empty;

        [Required]
        [Column("performed_by")]
        [MaxLength(150)]
        public string PerformedBy { get; set; } = string.Empty;

        [Column("related_to")]
        public RelatedEntityType? RelatedTo { get; set; }

        [Column("related_id")]
        [MaxLength(50)]
        public string? RelatedId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
