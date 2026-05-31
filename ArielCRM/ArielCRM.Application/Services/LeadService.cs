using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class LeadService : ILeadService
    {
        private readonly ILeadRepository _leadRepository;

        public LeadService(ILeadRepository leadRepository)
        {
            _leadRepository = leadRepository;
        }

        public Task<IEnumerable<LeadResponseDto>> GetAllLeadsAsync()
            => _leadRepository.GetAllAsync();

        public Task<IEnumerable<LeadResponseDto>> SearchLeadsAsync(string query)
            => _leadRepository.SearchAsync(query);

        public Task<LeadResponseDto?> GetLeadByIdAsync(string id)
            => _leadRepository.GetByIdAsync(id);

        public async Task<LeadResponseDto> CreateLeadAsync(CreateLeadDto dto)
        {
            var lead = new Lead
            {
                Name = dto.Name,
                Company = dto.Company,
                Email = dto.Email,
                Phone = dto.Phone,
                Source = dto.Source,
                AssignedToId = dto.AssignedToId
            };

            return await _leadRepository.CreateAsync(lead);
        }

        public Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto)
        {
            if (string.IsNullOrEmpty(id)) throw new Exception("Lead id is null !");

            return _leadRepository.UpdateLeadAsync(id, dto);

        }

        public Task<bool> DeleteLeadAsync(string id)
            => _leadRepository.DeleteAsync(id);
    }
}
