using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IService;
using ArielCRM.Shared.Utils;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IAuthService authService , AppDbContext db , IEmailService emailService) : ControllerBase
    {
        private readonly IAuthService _authService = authService;
        private readonly IEmailService _emailService = emailService;
        private readonly AppDbContext _db = db;

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(dto, Response);

            if (result is null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(new { message = "Login successful.", user = result });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync(Response);
            return Ok(new { message = "Logged out successfully." });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var user = await _authService.GetCurrentUserAsync(HttpContext);

            if (user is null)
                return Unauthorized(new { message = "Not authenticated." });

            return Ok(user);
        }


        [HttpPost("register")]
        // [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RegisterMember([FromBody] RegisterRequestDto dto)  
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);

            if (exists)  return Conflict(new { message = "User with this email already exists." });

            string generatedPass = Utils.GeneratePassword();
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(generatedPass),
                Role = dto.Role,
                CreatedAt = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            await _emailService.SendWelcomeEmailAsync(dto.Email ,dto.Name, generatedPass);

            return Ok(new { message = "User created successfully.", userId = user.Id });
        }




    }
}