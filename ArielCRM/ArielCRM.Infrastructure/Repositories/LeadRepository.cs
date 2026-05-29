using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class LeadRepository : ILeadRepository
    {
        private readonly AppDbContext _context;

        public LeadRepository(AppDbContext context)
        {
            _context = context;
        }

        private static LeadResponseDto MapToDto(Lead lead) => new()
        {
            Id = lead.Id,
            Name = lead.Name,
            Company = lead.Company,
            Email = lead.Email,
            Phone = lead.Phone,
            Source = lead.Source.ToString(),
            Status = lead.Status.ToString(),
            AssignedToId = lead.AssignedToId,
            AssignedToName = lead.AssignedTo?.Name ?? string.Empty,
            CreatedAt = lead.CreatedAt
        };

        public async Task<IEnumerable<LeadResponseDto>> GetAllAsync()
        {
            return await _context.Leads
                .Include(l => l.AssignedTo)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => MapToDto(l))
                .ToListAsync();
        }

        public async Task<IEnumerable<LeadResponseDto>> SearchAsync(string query)
        {
            var q = query.ToLower();

            return await _context.Leads
                .Include(l => l.AssignedTo)
                .Where(l =>
                    l.Name.ToLower().Contains(q) ||
                    l.Company.ToLower().Contains(q) ||
                    l.Email.ToLower().Contains(q)
                )
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => MapToDto(l))
                .ToListAsync();
        }

        public async Task<LeadResponseDto?> GetByIdAsync(string id)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .FirstOrDefaultAsync(l => l.Id == id);

            return lead is null ? null : MapToDto(lead);
        }

        public async Task<LeadResponseDto> CreateAsync(Lead lead)
        {
            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            await _context.Entry(lead).Reference(l => l.AssignedTo).LoadAsync();

            return MapToDto(lead);
        }

        public async Task<LeadResponseDto?> UpdateAsync(string id, UpdateLeadDto dto)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lead is null) return null;

            if (dto.Name is not null) lead.Name = dto.Name;
            if (dto.Company is not null) lead.Company = dto.Company;
            if (dto.Email is not null) lead.Email = dto.Email;
            if (dto.Phone is not null) lead.Phone = dto.Phone;
            if (dto.Source is not null) lead.Source = dto.Source.Value;
            if (dto.Status is not null) lead.Status = dto.Status.Value;
            if (dto.AssignedToId is not null) lead.AssignedToId = dto.AssignedToId;

            await _context.SaveChangesAsync();
            await _context.Entry(lead).Reference(l => l.AssignedTo).LoadAsync();

            return MapToDto(lead);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead is null) return false;

            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
