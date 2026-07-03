using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class ProjectRepository(AppDbContext context) : IProjectRepository
    {
        private readonly AppDbContext _context = context;

        public async Task<Project?> GetByIdAsync(string projectId)
        {
            return await _context.Projects
                .Include(x => x.Documents)
                .FirstOrDefaultAsync(x => x.Id == projectId);
        }

        public async Task AddAsync(Project project)
        {
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();
        }

        public Task UpdateAsync(Project project)
        {
            _context.Projects.Update(project);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Project project)
        {
            _context.Projects.Remove(project);
            return Task.CompletedTask;
        }

        public async Task<Project?> GetByIdWithDetailsAsync(string projectId)
        {
            return await _context.Projects
                .Include(p => p.ProjectLead)
                .Include(p => p.Members)
                .Include(p => p.Documents)
                .Include(p => p.Tasks)
                .FirstOrDefaultAsync(p => p.Id == projectId);
        }

        public async Task<List<Project>> GetAllWithDetailsAsync(string userId)
        {
            return await _context.Projects
                .Where(p =>
                    p.ProjectLeadId == userId ||
                    (p.Contact != null && p.Contact.Lead != null && p.Contact.Lead.AssignedToId == userId) ||
                    p.Members.Any(m => m.Id == userId))
                .Include(p => p.ProjectLead)
                .Include(p => p.Contact)
                .Include(p => p.Members)
                .Include(p => p.Documents)
                .Include(p => p.Tasks).ThenInclude(t => t.AssignedUser)
                .Include(p => p.Tasks).ThenInclude(t => t.ReportedUser)
                .ToListAsync();
        }

        public async Task<List<Project>> GetAllProjectAsync()
        {
            return await _context.Projects
                .Include(p => p.ProjectLead)
                .Include(p => p.Contact)
                .Include(p => p.Members)
                .Include(p => p.Documents)
                .Include(p => p.Tasks).ThenInclude(t => t.AssignedUser)
                .Include(p => p.Tasks).ThenInclude(t => t.ReportedUser)
                .ToListAsync();
        }

        public async Task<bool> AddMemberToProjectAsync(string projectId, string memberId)
        {

            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == projectId) ?? throw new Exception("Project not found.");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == memberId) ?? throw new Exception("User not found.");


            if (project.Members.Any(m => m.Id == memberId))
                return false;

            project.Members.Add(user);
            await _context.SaveChangesAsync();

            return true;
        }


        public async Task RemoveMemberFromProjectAsync(string projectId, string memberId)
        {
            var project = await _context.Projects
                .Include(p => p.Members)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project == null)
                throw new KeyNotFoundException("Project not found.");

            var member = project.Members
                .FirstOrDefault(m => m.Id == memberId);

            if (member == null)
                throw new KeyNotFoundException("Member not found in project.");

            project.Members.Remove(member);

            await _context.SaveChangesAsync();
        }




    }
}