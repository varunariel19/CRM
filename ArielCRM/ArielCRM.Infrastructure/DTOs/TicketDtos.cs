using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateTicketDto
    {
        [Required]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public TicketPriority Priority { get; set; }

        [Required]
        [MaxLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ClientId { get; set; }
    }

    public class UpdateTicketStatusDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public TicketStatus Status { get; set; }
    }

    public class UpdateTicketPriorityDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public TicketPriority Priority { get; set; }
    }

    public class UpdateTicketAssigneeDto
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AssignedToId { get; set; } = string.Empty;
    }


    public class TicketDto
    {
        public string Id { get; set; } = string.Empty;
        public string TicketCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public TicketPriority Priority { get; set; }
        public TicketStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }

        public string AssignedToId { get; set; } = string.Empty;
        public string AssignedMemberName { get; set; } = string.Empty;

        public ClientInfoDto? ClientInfo { get; set; }
    }

    public class ClientInfoDto
    {
        public string Name { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

}
