using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("access_level_permissions")]
    public class AccessLevelPermission
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("access_level_id")]
        [MaxLength(50)]
        public string AccessLevelId { get; set; } = string.Empty;

        [ForeignKey(nameof(AccessLevelId))]
        public AccessLevel AccessLevel { get; set; } = null!;

        [Required]
        [Column("permission_id")]
        [MaxLength(50)]
        public string PermissionId { get; set; } = string.Empty;

        [ForeignKey(nameof(PermissionId))]
        public Permission Permission { get; set; } = null!;
    }
}