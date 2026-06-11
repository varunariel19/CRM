using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("departments")]
    public class Department
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
        [Column("department_key")]
        [MaxLength(100)]
        public string DepartmentKey { get; set; } = string.Empty;

        public ICollection<User> Users { get; set; } = [];
    }
}