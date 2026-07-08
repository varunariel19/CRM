using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class LeadRepository(AppDbContext context) : ILeadRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<IEnumerable<LeadResponseDto>> GetAllAsync()
        {
            return await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .Include(l => l.Projects)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => MapToDto(l))
                .ToListAsync();
        }

        public async Task<IEnumerable<LeadResponseDto>> GetAllByAssigneeAsync(string userId)
        {
            return await _context.Leads
                .Where(l => l.AssignedToId == userId)
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .Include(l => l.Projects)
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => MapToDto(l))
                .ToListAsync();
        }

        public async Task<IEnumerable<LeadResponseDto>> SearchAsync(string query)
        {
            var q = query.ToLower();

            return await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Projects)
                .Where(l =>
                    l.Name.Contains(q, StringComparison.CurrentCultureIgnoreCase) ||
                    l.Company.Contains(q, StringComparison.CurrentCultureIgnoreCase) ||
                    l.Email.Contains(q, StringComparison.CurrentCultureIgnoreCase)
                )
                .OrderByDescending(l => l.CreatedAt)
                .Select(l => MapToDto(l))
                .ToListAsync();
        }

        public async Task<LeadResponseDto> CreateAsync(Lead lead)
        {
            _context.Leads.Add(lead);
            await _context.SaveChangesAsync();

            await _context.Entry(lead).Reference(l => l.AssignedTo).LoadAsync();

            return MapToDto(lead);
        }

        public async Task<LeadResponseDto?> GetByIdAsync(string id)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .Include(l => l.Projects)
                .FirstOrDefaultAsync(l => l.Id == id);

            return lead is null ? null : MapToDto(lead);
        }

        public async Task<Lead?> GetLeadFullByIdAsync(string id)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .Include(l => l.Projects)
                .FirstOrDefaultAsync(l => l.Id == id);

            return lead ;
        }

        public async Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .Include(l => l.Projects)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lead is null) return null;

            if (dto.Name is not null) lead.Name = dto.Name;
            if (dto.ContactId is not null) lead.ContactId = dto.ContactId;
            if (dto.Company is not null) lead.Company = dto.Company;
            if (dto.Email is not null) lead.Email = dto.Email;
            if (dto.Phone is not null) lead.Phone = dto.Phone;
            if (dto.Source is not null) lead.Source = dto.Source.Value;
            if (dto.Status is not null) lead.Status = dto.Status.Value;

            if (dto.AssignedToId is not null)
            {
                var leadUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.AssignedToId);
                if (leadUser is null)
                    throw new InvalidOperationException($"User '{dto.AssignedToId}' not found.");

                lead.AssignedToId = dto.AssignedToId;
                lead.AssignedTo = leadUser; // reassign the navigation reference — do NOT mutate leadUser.Name
            }

            // NOTE: ProjectTitle / ProjectType / Budget / DealStartDate / DealCloseDate
            // no longer live on Lead — they're handled by LeadService.SyncLeadProjectAsync
            // against the linked Project entity. Nothing to map here anymore.

            lead.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

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

        private static LeadResponseDto MapToDto(Lead lead) => new()
        {
            Id = lead.Id,
            Name = lead.Name,
            Company = lead.Company,
            Email = lead.Email,
            Phone = lead.Phone,
            Source = lead.Source.ToString(),
            Status = lead.Status.ToString(),
            ContactId = lead.Contact?.Id ?? string.Empty,
            AssignedToId = lead.AssignedToId,
            AssignedToName = lead.AssignedTo?.Name ?? string.Empty,
            CreatedAt = lead.CreatedAt,
            UpdatedAt = lead.UpdatedAt,
            CreatedContact = lead.Contact is not null ? new ContactDto
            {
                Id = lead.Contact.Id,
                Name = lead.Contact.Name,
                Company = lead.Contact.Company,
                Designation = lead.Contact.Designation,
                Email = lead.Contact.Email,
                Phone = lead.Contact.Phone,
                Address = lead.Contact.Address,
                CreatedAt = lead.Contact.CreatedAt.ToString("o"),
            } : null,
            Projects = [.. lead.Projects.Select(p => new LeadProjectSummaryDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    ProjectType = p.ProjectType?.ToString(),
                    Budget = p.Budget,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    IsActive = p.IsActive,
                    IsListed = p.ProjectLeadId is not null,
                })],
        };
    }
}