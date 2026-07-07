using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using ArielCRM.DataLayer.Enums.ArielCRM.DataLayer.Enums;
namespace ArielCRM.DataLayer.Entities
{
    [Table("leads")]
    public class Lead
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("company")]
        [MaxLength(100)]
        public string Company { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Column("phone")]
        [MaxLength(50)]
        public string? Phone { get; set; }

        [Required]
        [Column("source")]
        public LeadSource Source { get; set; }

        [Required]
        [Column("status")]
        public LeadStatus Status { get; set; } = LeadStatus.Contracted;

        [Required]
        [Column("assigned_to")]
        [MaxLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [Column("contact_id")]
        [MaxLength(50)]
        public string? ContactId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // ── Project / Deal Info ──

        [Required]
        [Column("project_title")]
        [MaxLength(200)]
        public string ProjectTitle { get; set; } = string.Empty;

        [Required]
        [Column("project_type")]
        public ProjectType ProjectType { get; set; }

        [Required]
        [Column("budget")]
        [Precision(18, 2)]
        public decimal Budget { get; set; }

        [Required]
        [Column("deal_start_date")]
        public DateOnly DealStartDate { get; set; }

        [Column("deal_close_date")]
        public DateOnly? DealCloseDate { get; set; } = null;


        [ForeignKey(nameof(AssignedToId))]
        public User? AssignedTo { get; set; }

        [ForeignKey(nameof(ContactId))]
        public Contact? Contact { get; set; }

        public ICollection<CrmTask> Tasks { get; set; } = [];
        public ICollection<Meeting> Meetings { get; set; } = [];
    }
}