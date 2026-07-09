using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("ticket_history")]
    public class TicketHistory
    {
        [Key]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [Column("ticket_id")]
        [MaxLength(50)]
        public string TicketId { get; set; } = string.Empty;

        [Required]
        [Column("title")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Column("content")]
        public string? Content { get; set; } = null;

        [Required]
        [Column("commited_by_id")]
        [MaxLength(50)]
        public string CommitedById { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(TicketId))]
        public TicketTask Ticket { get; set; } = null!;

        [ForeignKey(nameof(CommitedById))]
        public User CommitedBy { get; set; } = null!;
    }
}