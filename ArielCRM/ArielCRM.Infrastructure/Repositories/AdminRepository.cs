using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
 

    public class AdminRepository : IAdminRepository
    {
        private readonly AppDbContext _context;

        public AdminRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync()
        {
            return await _context.Users
                .Select(u => new TeamMemberDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ProfileImage = u.ProfileImage,
                    CreatedAt = u.CreatedAt
                    
                })
                .ToListAsync();
        }
    }
}
