using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{

        [Table("notes")]
        public class Note
        {
            [Key]
            [Column("id")]
            [MaxLength(50)]
            public string Id { get; set; } = Guid.NewGuid().ToString();

            [Required]
            [Column("content")]
            public string Content { get; set; } = string.Empty;

            [Required]
            [Column("related_to")]
            public RelatedEntityType RelatedTo { get; set; }

            [Required]
            [Column("related_id")]
            [MaxLength(50)]
            public string RelatedId { get; set; } = string.Empty;

            [Required]
            [Column("created_by")]
            [MaxLength(150)]
            public string CreatedBy { get; set; } = string.Empty;

            [Column("created_at")]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        }

      
}
