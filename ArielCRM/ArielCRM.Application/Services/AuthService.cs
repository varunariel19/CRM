using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace ArielCRM.Application.Services
{
    public class AuthService(IAuthRepository repo) : IAuthService
    {
        private readonly IAuthRepository _repo = repo;

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
                    new(ClaimTypes.NameIdentifier, user.Id),
                    new(ClaimTypes.Name,           user.Name),
                    new(ClaimTypes.Email,          user.Email),
                    new("Department",              user.Department.Name),
                    new("Designation",             user.Designation.Name),
                    new("AccessLevelId",             user.AccessLevel.Id),
                    new("Permissions", string.Join("|", user.AccessLevel.Permissions.Select(p => p.Permission.Code)))
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
                ProfileImage = user.ProfileImage,
                DepartmentId = user.Department.Id,
                DesignationId = user.Designation.Id,
                AccessLevel = new AccessLevelDto
                {
                    Id = user.AccessLevel.Id,
                    Name = user.AccessLevel.Name,
                    Access = user.AccessLevel.Access,
                    Permissions = [.. user.AccessLevel.Permissions.Select(p => new PermissionDto
            {
                Id = p.Permission.Id,
                Code = p.Permission.Code,
                Description = p.Permission.Description
            })]
                },
                // E2E key material — client uses password (still in memory from login form)
                // + salt to derive the KDF key and decrypt the private key locally.
                EncryptionKey = user.EncryptionKey is null ? null : new UserEncryptionKeyDto
                {
                    PublicKey = user.EncryptionKey.PublicKey,
                    EncryptedPrivateKey = user.EncryptionKey.EncryptedPrivateKey,
                    Salt = user.EncryptionKey.Salt
                }
            };
        }

        public async Task LogoutAsync(HttpResponse response)
        {
            await response.HttpContext.SignOutAsync(
                CookieAuthenticationDefaults.AuthenticationScheme
            );
        }

        public async Task<UserResponseDto?> GetCurrentUserAsync(HttpContext context)
        {
            if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
                return null;

            var email = context.User.FindFirst(ClaimTypes.Email)?.Value;
            if (email is null) return null;

            var user = await _repo.GetByEmailAsync(email);

            if (user is null) return null;

            return new UserResponseDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                ProfileImage = user.ProfileImage,
                DepartmentId = user.Department.Id,
                DesignationId = user.Designation.Id,
                AccessLevel = new AccessLevelDto
                {
                    Id = user.AccessLevel.Id,
                    Name = user.AccessLevel.Name,
                    Access = user.AccessLevel.Access,
                    Permissions = [.. user.AccessLevel.Permissions.Select(p => new PermissionDto
            {
                Id = p.Permission.Id,
                Code = p.Permission.Code
            })]
                },
                EncryptionKey = user.EncryptionKey is null ? null : new UserEncryptionKeyDto
                {
                    PublicKey = user.EncryptionKey.PublicKey,
                    EncryptedPrivateKey = user.EncryptionKey.EncryptedPrivateKey,
                    Salt = user.EncryptionKey.Salt
                }
            };
        }
    }
}