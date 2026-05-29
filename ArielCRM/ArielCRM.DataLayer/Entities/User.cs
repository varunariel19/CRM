using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
        [Table("users")]
        public class User
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
            [Column("email")]
            [MaxLength(150)]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [Column("password_hash")]
            [MaxLength(255)]
            public string PasswordHash { get; set; } = string.Empty;

            [Required]
            [Column("role")]
            public UserRole Role { get; set; }

            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            public ICollection<Lead> AssignedLeads { get; set; } = new List<Lead>();
            public ICollection<Deal> AssignedDeals { get; set; } = new List<Deal>();
            public ICollection<CrmTask> AssignedTasks { get; set; } = new List<CrmTask>();
            public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
        }
}
