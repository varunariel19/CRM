using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    
        [Table("tickets")]
        public class Ticket
        {
            [Key]
            [Column("id")]
            [MaxLength(50)]
            public string Id { get; set; } = Guid.NewGuid().ToString();

            [Required]
            [Column("title")]
            [MaxLength(150)]
            public string Title { get; set; } = string.Empty;

            [Required]
            [Column("ticket_code")]
            [MaxLength(150)]
            public string TicketCode { get; set; } = string.Empty;

            [Required]
            [Column("description")]
            public string Description { get; set; } = string.Empty;

            [Required]
            [Column("status")]
            public TicketStatus Status { get; set; } = TicketStatus.Todo;

            [Required]
            [Column("priority")]
            public TicketPriority Priority { get; set; }

            [Required]
            [Column("assigned_to")]
            [MaxLength(50)]
            public string AssignedToId { get; set; } = string.Empty;

            [Column("client_id")]
            [MaxLength(50)]
            public string? ClientId { get; set; }

            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

            [ForeignKey(nameof(AssignedToId))]
            public User? AssignedTo { get; set; }

            [ForeignKey(nameof(ClientId))]
            public Contact? Client { get; set; }
        }
}
