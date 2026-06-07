using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
  public interface ITeamService
    {
        Task<TeamMemberDto> CreateAsync(CreateTeamDto dto);
        Task<TeamMemberDto?> UpdateAsync(string id, UpdateTeamDto dto);
        Task<bool> DeleteAsync(string id);
        Task<List<TeamMemberDto>> GetAllAsync();
    }

}