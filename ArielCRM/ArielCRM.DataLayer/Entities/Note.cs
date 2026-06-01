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
        [Column("created_by_id")]
        [MaxLength(150)]
        public string CreatedById { get; set; } = string.Empty;

        [Required]
        [Column("created_by_name")]
        [MaxLength(150)]
        public string CreatedByName { get; set; } = string.Empty;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("is_edited")]
        public bool IsEdited { get; set; } = false;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }


}
