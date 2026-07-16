using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{

    public interface IAuthService
    {
       Task<bool> SaveEncryptionKeyAsync(HttpContext context, UserEncryptionKeyDto dto);
        Task<UserResponseDto?> LoginAsync(LoginRequestDto dto, HttpResponse response);
        Task<UserResponseDto?> GetCurrentUserAsync(HttpContext context);
        Task LogoutAsync(HttpResponse response);
    }
}
