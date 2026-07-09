using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("contacts")]
    public class Contact
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
        [Column("designation")]
        [MaxLength(100)]
        public string Designation { get; set; } = "Staff";

        [Required]
        [Column("email")]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Column("phone")]
        [MaxLength(50)]
        public string? Phone { get; set; }

        [Column("address")]
        public string? Address { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Lead? Lead { get; set; }

        public Project Project { get; set; } = null!;

        public ICollection<Ticket> Tickets { get; set; } = [];
        public ICollection<Project> Projects { get; set; } = [];
    }
}