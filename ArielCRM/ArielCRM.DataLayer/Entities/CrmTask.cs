using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("tasks")]
    public class CrmTask
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
        [Column("type")]
        public TaskType Type { get; set; }

        [Required]
        [Column("due_date")]
        public DateOnly DueDate { get; set; }

        [Required]
        [Column("status")]
        public CrmTaskStatus Status { get; set; } = CrmTaskStatus.Pending;

        [Required]
        [Column("assigned_to")]
        [MaxLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [Column("lead_id")]
        [MaxLength(50)]
        public string? LeadId { get; set; }

        [Column("deal_id")]
        [MaxLength(50)]
        public string? DealId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(AssignedToId))]
        public User? AssignedTo { get; set; }

        [ForeignKey(nameof(LeadId))]
        public Lead? Lead { get; set; }

        [ForeignKey(nameof(DealId))]
        public Deal? Deal { get; set; }
    }
}