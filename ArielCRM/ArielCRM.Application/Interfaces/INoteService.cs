using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface INoteService
    {
        Task<List<NoteDto>> GetNotesAsync(RelatedEntityType relatedTo, string relatedId);
        Task<NoteDto> CreateNoteAsync(CreateNoteRequest request);
        Task<NoteDto?> UpdateNoteAsync(string id, UpdateNoteRequest request);
        Task<bool> DeleteNoteAsync(string id);
    }

}
