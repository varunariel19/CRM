using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
        [Table("meetings")]
        public class Meeting
        {
            [Key]
            [Column("id")]
            [MaxLength(50)]
            public string Id { get; set; } = Guid.NewGuid().ToString();

            [Required]
            [Column("title")]
            [MaxLength(150)]
            public string Title { get; set; } = string.Empty;

            [Required]
            [Column("date")]
            public DateOnly Date { get; set; }

            [Required]
            [Column("time")]
            public TimeOnly Time { get; set; }

            [Required]
            [Column("location")]
            [MaxLength(255)]
            public string Location { get; set; } = string.Empty;

            [Column("notes")]
            public string? Notes { get; set; }

            [Column("lead_id")]
            [MaxLength(50)]
            public string? LeadId { get; set; }

            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            [ForeignKey(nameof(LeadId))]
            public Lead? Lead { get; set; }
        }
}
