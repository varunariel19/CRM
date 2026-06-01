using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface INoteRepository
    {
        Task<List<Note>> GetByRelatedEntityAsync(RelatedEntityType relatedTo, string relatedId);
        Task<Note?> GetByIdAsync(string id);
        Task<Note> CreateAsync(Note note);
        Task<Note?> UpdateAsync(string id, string content);
        Task<bool> DeleteAsync(string id);
    }
}
