using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ArielCRM.Infrastructure.DTOs
{
        public class LoginRequestDto
        {
            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            public string Password { get; set; } = string.Empty;
        }

        public class RegisterRequestDto
        {
            [Required]
            public string Name { get; set; } = string.Empty;

            [Required]
            [EmailAddress]
            public string Email { get; set; } = string.Empty;

            [Required]
            [JsonConverter(typeof(JsonStringEnumConverter))]
            public UserRole Role { get; set; }
        }

    public class UserResponseDto
        {
            public string Id { get; set; } = string.Empty;
            public string Name { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }
}
