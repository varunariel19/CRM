using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;

namespace ArielCRM.Application.Services
{

    public class UserService(IUserRepository userRepo, IAppwriteStorageService storageService) : IUserService
    {
        private readonly IUserRepository _userRepo = userRepo;
        private readonly IAppwriteStorageService _storageService = storageService;

        public async Task<ApiResponse> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null)
                return ApiResponse.Fail("User not found.");

            var previousProfileImage = user.ProfileImage;

            user.Name = dto.Name.Trim();

            if (dto.ProfileImage is not null && dto.ProfileImage.Length > 0)
            {
                if (!dto.ProfileImage.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    return ApiResponse.Fail("Only image files are allowed.");

                var upload = await _storageService.UploadFileAsync(dto.ProfileImage);
                user.ProfileImage = upload.FileUrl;
            }

            await _userRepo.UpdateAsync(user);

            if (!string.IsNullOrWhiteSpace(previousProfileImage) && previousProfileImage != user.ProfileImage)
                await DeleteProfileImageIfExistsAsync(previousProfileImage);

            return new UpdateProfileResponse
            {
                Success = true,
                Message = "Profile updated successfully.",
                Name = user.Name,
                ProfileImage = user.ProfileImage
            };
        }

        public async Task<ApiResponse> RemoveProfileImageAsync(string userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user is null)
                return ApiResponse.Fail("User not found.");

            var previousProfileImage = user.ProfileImage;
            if (string.IsNullOrWhiteSpace(previousProfileImage))
                return new UpdateProfileResponse
                {
                    Success = true,
                    Message = "Profile image removed successfully.",
                    Name = user.Name,
                    ProfileImage = null
                };

            user.ProfileImage = null;
            await _userRepo.UpdateAsync(user);
            await DeleteProfileImageIfExistsAsync(previousProfileImage);

            return new UpdateProfileResponse
            {
                Success = true,
                Message = "Profile image removed successfully.",
                Name = user.Name,
                ProfileImage = null
            };
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

        private async Task DeleteProfileImageIfExistsAsync(string profileImageUrl)
        {
            try
            {
                await _storageService.DeleteFileByUrlAsync(profileImageUrl);
            }
            catch
            {
                // Keep profile updates successful even if deleting the old storage object fails.
            }
        }
    }


}