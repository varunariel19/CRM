using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface ILeadRepository
    {
        Task<IEnumerable<LeadResponseDto>> GetAllAsync();
        Task<IEnumerable<LeadResponseDto>> SearchAsync(string query);
        Task<LeadResponseDto?> GetByIdAsync(string id);
        Task<LeadResponseDto> CreateAsync(Lead lead);
        Task<LeadResponseDto?> UpdateAsync(string id, UpdateLeadDto dto);
        Task<bool> DeleteAsync(string id);
    }

}
