using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateMeetingDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly Time { get; set; }

        [Required]
        [MaxLength(255)]
        public string Location { get; set; } = string.Empty;

        public string? Notes { get; set; }

        [MaxLength(50)]
        public string? LeadId { get; set; }
    }

    public class MeetingResDto
    {
        public string Id { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public DateOnly Date { get; set; } 

        public TimeOnly Time { get; set; } 

        public string Location { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public string LeadId { get; set; } = string.Empty;

        public ClientInfoDto ClientInfo { get; set; } = new();

        public DateTime CreatedAt { get; set; }
    }

    
}
