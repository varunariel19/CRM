using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;
using ArielCRM.DataLayer.Enums;
namespace ArielCRM.Infrastructure.Repositories
{
    public class LeadRepository(AppDbContext context) : ILeadRepository
    {
        private readonly AppDbContext _context = context;

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

        public async Task<LeadResponseDto?> UpdateLeadAsync(string id, UpdateLeadDto dto)
        {
            var lead = await _context.Leads
                .Include(l => l.AssignedTo)
                .Include(l => l.Contact)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (lead is null) return null;

            if (dto.Name is not null) lead.Name = dto.Name;
            if (dto.Company is not null) lead.Company = dto.Company;
            if (dto.Email is not null) lead.Email = dto.Email;
            if (dto.Phone is not null) lead.Phone = dto.Phone;
            if (dto.Source is not null) lead.Source = dto.Source.Value;
            if (dto.Status is not null) lead.Status = dto.Status.Value;
            if (dto.AssignedToId is not null) lead.AssignedToId = dto.AssignedToId;

            if (dto.Status is LeadStatus.Converted && lead.Status != LeadStatus.Converted)
            {
                if (lead.ContactId is null)
                {
                    var contact = new Contact
                    {
                        Id = Guid.NewGuid().ToString(),
                        Name = lead.Name,
                        Company = lead.Company,
                        Email = lead.Email,
                        Phone = lead.Phone,
                        CreatedAt = DateTime.UtcNow,
                    };

                    _context.Contacts.Add(contact);
                    await _context.SaveChangesAsync();

                    lead.ContactId = contact.Id;
                    lead.Status = dto.Status.Value;
                    await _context.SaveChangesAsync();
                    return MapToResponseDto(lead);
                }
            }

            await _context.SaveChangesAsync();
            return null;

        }



        public async Task<bool> DeleteAsync(string id)
        {
            var lead = await _context.Leads.FindAsync(id);
            if (lead is null) return false;

            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();

            return true;
        }


        private LeadResponseDto MapToResponseDto(Lead lead)
        {
            return new LeadResponseDto
            {
                Id = lead.Id,
                Name = lead.Name,
                Company = lead.Company,
                Email = lead.Email,
                Phone = lead.Phone,
                Source = lead.Source.ToString(),
                Status = lead.Status.ToString(),
                AssignedToId = lead.AssignedToId,
                ContactId = lead.ContactId!,
                CreatedAt = lead.CreatedAt,
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
            };
        }
    }
}
