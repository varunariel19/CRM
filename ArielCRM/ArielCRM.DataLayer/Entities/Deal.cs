using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ArielCRM.DataLayer.Entities
{
    [Table("deals")]
    public class Deal
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
        [Column("value")]
        public decimal Value { get; set; } = 0.00m;

        [Required]
        [Column("stage")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public DealStage Stage { get; set; }

        [Required]
        [Column("close_date")]
        public DateOnly CloseDate { get; set; }

        [Required]
        [Column("assigned_to")]
        [MaxLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [Column("contact_id")]
        [MaxLength(50)]
        public string? ContactId { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey(nameof(AssignedToId))]
        public User? AssignedTo { get; set; }

        [ForeignKey(nameof(ContactId))]
        public Contact? Contact { get; set; }

        public ICollection<CrmTask> Tasks { get; set; } = [];

        public Project? Project { get; set; }
    }
}