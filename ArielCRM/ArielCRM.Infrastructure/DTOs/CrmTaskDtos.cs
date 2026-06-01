using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
        public class CreateCrmTaskDto
        {
            public string Title { get; set; } = string.Empty;
            public TaskType Type { get; set; }
            public DateOnly DueDate { get; set; }
            public string AssignedToId { get; set; } = string.Empty;
            public string? LeadId { get; set; }
            public string? DealId { get; set; }
        }

        public class CrmTaskDto
        {
            public string Id { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string DueDate { get; set; } = string.Empty;
            public string Status { get; set; } = string.Empty;
            public string AssignedToId { get; set; } = string.Empty;
            public string? AssignedToName { get; set; }
            public string? LeadId { get; set; }
            public string? LeadName { get; set; }
            public string? DealId { get; set; }
            public string? DealTitle { get; set; }
            public DateTime CreatedAt { get; set; }
        }


    public class UpdateTaskStatusDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public CrmTaskStatus Status { get; set; }
    }
}
