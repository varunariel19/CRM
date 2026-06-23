using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
 public interface ICommentService
    {
        Task<CommentResponseDto> AddCommentAsync(string userId, CreateCommentDto dto);
        Task<IEnumerable<CommentResponseDto>> GetCommentsByTicketIdAsync(string ticketId);
        Task<CommentResponseDto> EditCommentAsync(string commentId, string requestingUserId, EditCommentDto dto);
    }
}