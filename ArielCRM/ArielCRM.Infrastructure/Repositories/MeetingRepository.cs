using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ArielCRM.Infrastructure.Repositories
{
    public class MeetingRepository(AppDbContext context) : IMeetingRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<IEnumerable<MeetingResDto>> GetAllAsync()
        {
            return await _context.Meetings
                .Include(m => m.Lead)
                .OrderByDescending(m => m.Date)
                .ThenByDescending(m => m.Time)
                .Select(ProjectToDto())
                .ToListAsync();
        }

        public async Task<MeetingResDto> CreateAsync(Meeting meeting)
        {
            await _context.Meetings.AddAsync(meeting);
            await _context.SaveChangesAsync();

            await _context.Entry(meeting).Reference(m => m.Lead).LoadAsync();

            return ProjectToDto().Compile()(meeting);
        }

        private static Expression<Func<Meeting, MeetingResDto>> ProjectToDto()
        {
            return m => new MeetingResDto
            {
                Id = m.Id,
                Title = m.Title,
                Date = m.Date,
                Time = m.Time,
                Location = m.Location,
                Notes = m.Notes,
                LeadId = m.LeadId!,
                CreatedAt = m.CreatedAt,
                ClientInfo = new ClientInfoDto
                {
                    Name = m.Lead != null ? m.Lead.Name : string.Empty,
                    Company = m.Lead != null ? m.Lead.Company : string.Empty,
                    Email = m.Lead != null ? m.Lead.Email : string.Empty
                }
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var meeting = await _context.Meetings.FindAsync(id);
            if (meeting == null) return false;

            _context.Meetings.Remove(meeting);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
