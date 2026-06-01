using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;
namespace ArielCRM.Infrastructure.Repositories
{

        public class NoteRepository(AppDbContext db) : INoteRepository
        {
            private readonly AppDbContext _db = db;

        public async Task<List<Note>> GetByRelatedEntityAsync(RelatedEntityType relatedTo, string relatedId)
            {
                return await _db.Notes
                    .Where(n => n.RelatedTo == relatedTo && n.RelatedId == relatedId)
                    .OrderBy(n => n.CreatedAt)
                    .ToListAsync();
            }

            public async Task<Note?> GetByIdAsync(string id)
            {
                return await _db.Notes.FindAsync(id);
            }

            public async Task<Note> CreateAsync(Note note)
            {
                _db.Notes.Add(note);
                await _db.SaveChangesAsync();
                return note;
            }

            public async Task<Note?> UpdateAsync(string id, string content)
            {
                var note = await _db.Notes.FindAsync(id);
                if (note is null) return null;

                note.Content = content;
                note.IsEdited = true;
                note.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();
                return note;
            }

            public async Task<bool> DeleteAsync(string id)
            {
                var note = await _db.Notes.FindAsync(id);
                if (note is null) return false;

                _db.Notes.Remove(note);
                await _db.SaveChangesAsync();
                return true;
            }
        }
}
