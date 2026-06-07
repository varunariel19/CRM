using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("access_levels")]
    public class AccessLevel
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("name")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;


        [Required]
        [Column("access_level")]
        public int Access { get; set; }

        public ICollection<AccessLevelPermission> Permissions { get; set; } = [];
    }
}