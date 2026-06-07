using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class AdminService(IAdminRepository adminRepository) : IAdminService
    {
        private readonly IAdminRepository _adminRepository = adminRepository;

        public async Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync()
        {
            return await _adminRepository.GetTeamMembersAsync();
        }
    }
}
