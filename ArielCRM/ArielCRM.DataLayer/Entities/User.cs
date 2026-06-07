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
        public string Email { get; set; } = string.Empty;


        [Column("profile_image")]
        [MaxLength(255)]
        public string? ProfileImage { get; set; }

        [Required]
        [Column("password_hash")]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("department_id")]
        [MaxLength(50)]
        public string DepartmentId { get; set; } = string.Empty;

        [ForeignKey(nameof(DepartmentId))]
        public Department Department { get; set; } = null!;

        [Required]
        [Column("designation_id")]
        [MaxLength(50)]
        public string DesignationId { get; set; } = string.Empty;

        [ForeignKey(nameof(DesignationId))]
        public Designation Designation { get; set; } = null!;

        [Required]
        [Column("access_level_id")]
        [MaxLength(50)]
        public string AccessLevelId { get; set; } = string.Empty;

        [ForeignKey(nameof(AccessLevelId))]
        public AccessLevel AccessLevel { get; set; } = null!;

        public ICollection<Lead> AssignedLeads { get; set; } = new List<Lead>();
        public ICollection<Deal> AssignedDeals { get; set; } = new List<Deal>();
        public ICollection<CrmTask> AssignedTasks { get; set; } = new List<CrmTask>();
        public ICollection<TicketTask> AssignedProjTickets { get; set; } = new List<TicketTask>();
        public ICollection<TicketTask> ReportedProjTickets { get; set; } = new List<TicketTask>();
        public ICollection<Ticket> AssignedTickets { get; set; } = new List<Ticket>();
        public ICollection<Project> LedProjects { get; set; } = new List<Project>();
        public ICollection<Project> MemberProjects { get; set; } = new List<Project>();
    }
}