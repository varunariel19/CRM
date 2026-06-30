using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateTaskDto
    {
        public int? TicketId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public TaskPriority Priority { get; set; }

        [Required]
        public TicketTaskType Type { get; set; }

        public string? AssignToId { get; set; }

        [Required]
        public string ProjectId { get; set; } = string.Empty;
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; } = string.Empty;

        public string? Description { get; set; } = string.Empty;

        public TaskPriority? Priority { get; set; }

        public TicketTaskType? Type { get; set; }

        public TasksStatus? Status { get; set; }

        public List<string>? AiSummary { get; set; } = [];

        public string? AssignToId { get; set; }
    }

    public class TaskDetailDto
    {
        public string TaskId { get; set; } = string.Empty;

        public int? TicketId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        public string Priority { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;

        public string Status { get; set; } = string.Empty;

        public List<string>? AiSummary { get; set; } = [];

        public UserSummaryDto Assignee { get; set; } = null!;
        public UserSummaryDto Reporter { get; set; } = null!;

        public string ProjectId { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }


    public class UserDetail
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

    }



}