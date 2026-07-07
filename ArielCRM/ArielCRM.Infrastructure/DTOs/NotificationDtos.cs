using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    public class NotificationResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public string? Link { get; set; }
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }


      public class CreateNotificationDto
    {
        [Required, MinLength(1)]
        public List<string> UserIds { get; set; } =[];

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(1000)]
        public string Message { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? EntityType { get; set; } // "Lead" | "Project" | "Ticket" | "Task" | "Meeting" | "Message"

        public string? EntityId { get; set; }

        [MaxLength(500)]
        public string? Link { get; set; }
    }
}