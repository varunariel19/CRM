using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ArielCRM.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _repo;

        public AuthService(IAuthRepository repo)
        {
            _repo = repo;
        }

        public async Task<UserResponseDto?> LoginAsync(LoginRequestDto dto, HttpResponse response)
        {
            var user = await _repo.GetByEmailAsync(dto.Email);

            if (user is null)
                return null;

            var isValid = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);

            if (!isValid)
                return null;

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Name,           user.Name),
                new Claim(ClaimTypes.Email,          user.Email),
                new Claim(ClaimTypes.Role,           user.Role.ToString())
            };

            var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var principal = new ClaimsPrincipal(identity);

            await response.HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                principal,
                new AuthenticationProperties
                {
                    IsPersistent = true,
                    ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
                }
            );

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role.ToString()
            };
        }

        public async Task LogoutAsync(HttpResponse response)
        {
            await response.HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme
            );
        }

        public Task<UserResponseDto?> GetCurrentUserAsync(HttpContext context)
        {
            if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
                return Task.FromResult<UserResponseDto?>(null);

            var user = new UserResponseDto
            {
                Id = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty,
                Name = context.User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty,
                Email = context.User.FindFirst(ClaimTypes.Email)?.Value ?? string.Empty,
                Role = context.User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty
            };

            return Task.FromResult<UserResponseDto?>(user);
        }
    }
}