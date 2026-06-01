using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
        public class NoteService(INoteRepository repo) : INoteService
        {
            private readonly INoteRepository _repo = repo;

        public async Task<List<NoteDto>> GetNotesAsync(RelatedEntityType relatedTo, string relatedId)
            {
                var notes = await _repo.GetByRelatedEntityAsync(relatedTo, relatedId);
                return [.. notes.Select(ToDto)];
            }

            public async Task<NoteDto> CreateNoteAsync(CreateNoteRequest request)
            {
                var note = new Note
                {
                    Content = request.Content,
                    RelatedTo = request.RelatedTo,
                    RelatedId = request.RelatedId,
                    CreatedById = request.CreatedById,
                    CreatedByName = request.CreatedByName,
                };

                var created = await _repo.CreateAsync(note);
                return ToDto(created);
            }

            public async Task<NoteDto?> UpdateNoteAsync(string id, UpdateNoteRequest request)
            {
                var updated = await _repo.UpdateAsync(id, request.Content);
                return updated is null ? null : ToDto(updated);
            }

            public async Task<bool> DeleteNoteAsync(string id)
            {
                return await _repo.DeleteAsync(id);
            }

            private static NoteDto ToDto(Note n) => new()
            {
                Id = n.Id,
                Content = n.Content,
                CreatedById = n.CreatedById,
                CreatedByName = n.CreatedByName,
                IsEdited = n.IsEdited,
                UpdatedAt = n.UpdatedAt,
            };
        }
}
