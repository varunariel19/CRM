using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
 public interface IUserService
    {
        Task<ApiResponse> UpdateProfileAsync(string userId, UpdateProfileDto dto);
        Task<ApiResponse> RemoveProfileImageAsync(string userId);
        Task<ApiResponse> ChangePasswordAsync(string userId, ChangePasswordDto dto);
    }

}