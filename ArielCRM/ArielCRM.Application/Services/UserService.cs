using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{

    public class UserService(IUserRepository userRepo) : IUserService
    {
        private readonly IUserRepository _userRepo = userRepo;

        public async Task<ApiResponse> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null)
                return ApiResponse.Fail("User not found.");

            user.Name = dto.Name;

            // if (dto.ProfileImage is not null && dto.ProfileImage.Length > 0)
            // {
            //     var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads", "profiles");
            //     Directory.CreateDirectory(uploadsFolder);

            //     var fileName = $"{userId}_{Guid.NewGuid()}{Path.GetExtension(dto.ProfileImage.FileName)}";
            //     var filePath = Path.Combine(uploadsFolder, fileName);

            //     using var stream = new FileStream(filePath, FileMode.Create);
            //     await dto.ProfileImage.CopyToAsync(stream);

            //     user.ProfileImage = $"/uploads/profiles/{fileName}";
            // }

            await _userRepo.UpdateAsync(user);
            return ApiResponse.Ok("Profile updated successfully.");
        }

        public async Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordDto dto)
        {
            if (dto.NewPassword != dto.ConfirmPassword)
                return ApiResponse.Fail("New password and confirm password do not match.");

            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null)
                return ApiResponse.Fail("User not found.");

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
                return ApiResponse.Fail("Current password is incorrect.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _userRepo.UpdateAsync(user);
            return ApiResponse.Ok("Password changed successfully.");
        }
    }


}