using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{

    public interface IAuthService
    {
        Task<UserResponseDto?> LoginAsync(LoginRequestDto dto, HttpResponse response);
        Task LogoutAsync(HttpResponse response);
        Task<UserResponseDto?> GetCurrentUserAsync(HttpContext context);
    }
}
