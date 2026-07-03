

using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.DTOs
{
    public class TeamMemberDto
    {
        public string Id { get; set; } = string.Empty;

        public string EmployeeId { get; set; } = string.Empty;

        public string? ProfileImage { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public int Access { get; set; }
        public string DepartmentId { get; set; } = string.Empty;
        public string DesignationId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }


    public class CreateTeamDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string EmployeeId { get; set; } = string.Empty;

        [Required]
        public string DepartmentId { get; set; } = string.Empty;

        [Required]
        public string DesignationId { get; set; } = string.Empty;

        [Required]
        public string AccessLevelId { get; set; } = string.Empty;

        public IFormFile? ProfileImage { get; set; }
    }


    public class UpdateTeamDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string DepartmentId { get; set; } = string.Empty;

        [Required]
        public string DesignationId { get; set; } = string.Empty;

        public string? ProfileImage { get; set; }
    }
}
