using Microsoft.AspNetCore.Http;

namespace ArielCRM.Infrastructure.DTOs
{
    public class ChangePasswordDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public IFormFile? ProfileImage { get; set; }
    }


    public class UpdateProfileResponse : ApiResponse
    {
        public string Name { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
    }

    public class UserSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }

        public static implicit operator UserSummaryDto(ProjectMemberDto v)
        {
            throw new NotImplementedException();
        }
    }
}