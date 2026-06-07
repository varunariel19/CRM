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

        public async Task<List<Project>> GetAllWithDetailsAsync()
        {
            return await _context.Projects
                .Include(p => p.ProjectLead)
                .Include(p => p.Deal)
                    .ThenInclude(d => d!.Contact)
                .Include(p => p.Members)
                .Include(p => p.Documents)
                .Include(p => p.Tasks)
                .ToListAsync();
        }


    }
}