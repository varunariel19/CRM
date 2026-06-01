using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class TicketRepository(AppDbContext context) : ITicketRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<Ticket?> GetByIdAsync(string id)
        {
            return await _context.Tickets.FindAsync(id);
        }

        public async Task<List<TicketDto>> GetAllAsync()
        {
            return await _context.Tickets
                .Include(t => t.AssignedTo)
                .Include(t => t.Client)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TicketDto
                {
                    Id = t.Id,
                    TicketCode = t.TicketCode,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,

                    AssignedToId = t.AssignedToId,
                    AssignedMemberName = t.AssignedTo != null
                        ? t.AssignedTo.Name
                        : string.Empty,

                    ClientInfo = t.Client == null
                        ? null
                        : new ClientInfoDto
                        {
                            Name = t.Client.Name,
                            Company = t.Client.Company,
                            Email = t.Client.Email
                        }
                })
                .ToListAsync();
        }

        public async Task<TicketDto> CreateAsync(Ticket ticket)
        {
            await _context.Tickets.AddAsync(ticket);
            await _context.SaveChangesAsync();

            var created = await _context.Tickets
                .Include(t => t.AssignedTo)
                .Include(t => t.Client)
                .FirstAsync(t => t.Id == ticket.Id);

            return new TicketDto
            {
                Id = created.Id,
                TicketCode = created.TicketCode,
                Title = created.Title,
                Description = created.Description,
                Priority = created.Priority,
                Status = created.Status,
                CreatedAt = created.CreatedAt,

                AssignedToId = created.AssignedToId,
                AssignedMemberName = created.AssignedTo!.Name ?? "",

                ClientInfo = created.Client == null ? null : new ClientInfoDto
                {
                    Name = created.Client.Name,
                    Company = created.Client.Company,
                    Email = created.Client.Email
                }
            };
        }

        public async Task<bool> UpdateAsync(Ticket ticket)
        {
            _context.Tickets.Update(ticket);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var ticket = await _context.Tickets.FindAsync(id);
            if (ticket == null) return false;

            _context.Tickets.Remove(ticket);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Ticket>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await _context.Tickets.ToListAsync();
            }

            searchTerm = searchTerm.ToLower();

            return await _context.Tickets
                .Where(t => t.Title.ToLower().Contains(searchTerm) ||
                            t.Description.ToLower().Contains(searchTerm))
                .ToListAsync();
        }
    }
}
