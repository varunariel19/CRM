using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{

 public class CreateCommentDto
    {
        [Required]
        [MinLength(1)]
        [MaxLength(5000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string TicketId { get; set; } = string.Empty;

        [MaxLength(50)]
        public string? ActivityLogId { get; set; }
    }


    public class EditCommentDto
    {
        [Required]
        [MinLength(1)]
        [MaxLength(5000)]
        public string Content { get; set; } = string.Empty;
    }


     public class CommentResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool Edited { get; set; }
        public string TicketId { get; set; } = string.Empty;
        public string? ActivityLogId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public UserSummaryDto? Author { get; set; }
    }

}