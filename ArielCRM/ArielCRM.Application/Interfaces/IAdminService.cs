using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface IAdminService
    {
        Task<IEnumerable<TeamMemberDto>> GetTeamMembersAsync();
    }


}