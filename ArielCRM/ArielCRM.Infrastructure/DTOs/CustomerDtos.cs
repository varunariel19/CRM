using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ArielCRM.Infrastructure.DTOs
{

    public class CreateContactDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Company { get; set; } = string.Empty;

        [StringLength(100)]
        public string Designation { get; set; } = "Staff";

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Phone { get; set; }

        public string? Address { get; set; }
    }
    public class UpdateContactDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Company { get; set; } = string.Empty;

        [StringLength(100)]
        public string Designation { get; set; } = "Staff";

        [Required]
        [EmailAddress]
        [StringLength(150)]
        public string Email { get; set; } = string.Empty;

        [StringLength(50)]
        public string? Phone { get; set; }

        public string? Address { get; set; }
    }
}
