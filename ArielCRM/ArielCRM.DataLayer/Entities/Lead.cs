using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


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
            public LeadStatus Status { get; set; } = LeadStatus.New;

            [Required]
            [Column("assigned_to")]
            [MaxLength(50)]
            public string AssignedToId { get; set; } = string.Empty;

            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            [ForeignKey(nameof(AssignedToId))]
            public User? AssignedTo { get; set; }

            public ICollection<CrmTask> Tasks { get; set; } = new List<CrmTask>();
            public ICollection<Meeting> Meetings { get; set; } = new List<Meeting>();
        }
}
