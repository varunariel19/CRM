using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class ContactRepository : IContactRepository
    {
        private readonly AppDbContext _context; 

        public ContactRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Contact>> GetAllAsync()
        {
            return await _context.Set<Contact>().ToListAsync();
        }

        public async Task<Contact?> GetByIdAsync(string id)
        {
            return await _context.Set<Contact>().FindAsync(id);
        }

        public async Task AddAsync(Contact contact)
        {
            await _context.Set<Contact>().AddAsync(contact);
        }

        public void Update(Contact contact)
        {
            _context.Set<Contact>().Update(contact);
        }

        public void Delete(Contact contact)
        {
            _context.Set<Contact>().Remove(contact);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return (await _context.SaveChangesAsync()) > 0;
        }

        
    }
}
