using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Http;

namespace ArielCRM.Application.Interfaces
{
    public interface ILeadService
    {
        Task<IEnumerable<LeadResponseDto>> GetAllLeadsAsync(HttpContext context);
        Task<IEnumerable<LeadResponseDto>> SearchLeadsAsync(string query);
        Task<LeadResponseDto?> GetLeadByIdAsync(string id);
        Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto);
        Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto);
        Task<bool> DeleteLeadAsync(string id);
    }

   
}
