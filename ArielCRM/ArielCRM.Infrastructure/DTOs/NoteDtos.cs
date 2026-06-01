using ArielCRM.DataLayer.Enums;

namespace ArielCRM.Infrastructure.DTOs
{
    public class NoteDto
    {
        public string Id { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string CreatedById { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public bool IsEdited { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateNoteRequest
    {
        public string Content { get; set; } = string.Empty;
        public RelatedEntityType RelatedTo { get; set; }
        public string RelatedId { get; set; } = string.Empty;
        public string CreatedByName { get; set; } = string.Empty;
        public string CreatedById { get; set; } = string.Empty;
    }

    public class UpdateNoteRequest
    {
        public string Content { get; set; } = string.Empty;
    }
}
