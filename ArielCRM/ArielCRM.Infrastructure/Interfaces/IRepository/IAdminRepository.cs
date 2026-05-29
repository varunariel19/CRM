using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IAdminRepository
    {
        Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync();
    }
}
