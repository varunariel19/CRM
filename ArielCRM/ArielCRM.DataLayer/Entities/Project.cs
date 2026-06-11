using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("projects")]
    public class Project
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("name")]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [Column("project_key")]
        [MaxLength(50)]
        public string ProjectKey { get; set; } = string.Empty;

        [Column("project_lead_id")]
        [MaxLength(50)]
        public string? ProjectLeadId { get; set; }

        [Column("description")]
        public string? Description { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("contact_id")]
        [MaxLength(50)]
        public string? ContactId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(ProjectLeadId))]
        public User? ProjectLead { get; set; }

        [ForeignKey(nameof(ContactId))]
        public Contact? Contact { get; set; } = null!;

        public ICollection<User> Members { get; set; } = [];

        public ICollection<TicketTask> Tasks { get; set; } = [];

        public ICollection<Documents> Documents { get; set; } = [];
    }
}