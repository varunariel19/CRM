using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("ticket_tasks")]
    public class TicketTask
    {
        [Key]
        [Column("task_id")]
        [MaxLength(50)]
        public string TaskId { get; set; } = Guid.NewGuid().ToString();

        [Column("ticket_id")]
        public int? TicketId { get; set; }

        [Required]
        [Column("priority")]
        public string Priority { get; set; } = TaskPriority.MEDIUM.ToString();

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
    
        [Required]
        [Column("type")]
        public string Type { get; set; } = TicketTaskType.TASK.ToString();

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("status")]
        public string Status { get; set; } = TasksStatus.TODO.ToString();

        [Column("assign_to_id")]
        [MaxLength(50)]
        public string? AssignToId { get; set; }

        [Required]
        [Column("reported_by_id")]
        [MaxLength(50)]
        public string ReportedById { get; set; } = string.Empty;

        [Required]
        [Column("project_id")]
        [MaxLength(50)]
        public string ProjectId { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [NotMapped]
        public List<string> AiSummary { get; set; } = new();

        [NotMapped]
        public List<string> AllowedMembers { get; set; } = new();

        [ForeignKey(nameof(AssignToId))]
        public User? AssignedUser { get; set; }

        [ForeignKey(nameof(ReportedById))]
        public User ReportedUser { get; set; } = null!;

        [ForeignKey(nameof(ProjectId))]
        public Project Project { get; set; } = null!;

        public ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
    }
}