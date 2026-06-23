using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class CommentService(ICommentRepository commentRepository) : ICommentService
    {
        private readonly ICommentRepository _commentRepository = commentRepository;

        public async Task<CommentResponseDto> AddCommentAsync(string userId, CreateCommentDto dto)
        {
            var comment = new Comment
            {
                Id = Guid.NewGuid().ToString(),
                Content = dto.Content.Trim(),
                UserId = userId,
                TicketId = dto.TicketId,
                ActivityLogId = dto.ActivityLogId,
                Edited = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var saved = await _commentRepository.AddCommentAsync(comment);
            return MapToResponseDto(saved);
        }

        public async Task<CommentResponseDto> EditCommentAsync(
            string commentId,
            string requestingUserId,
            EditCommentDto dto)
        {
            var comment = await _commentRepository.GetCommentByIdAsync(commentId)
                ?? throw new KeyNotFoundException($"Comment '{commentId}' was not found.");

            if (comment.UserId != requestingUserId)
                throw new UnauthorizedAccessException("You are not allowed to edit this comment.");

            comment.Content = dto.Content.Trim();
            comment.Edited = true;
            comment.UpdatedAt = DateTime.UtcNow;

            var updated = await _commentRepository.UpdateCommentAsync(comment);
            return MapToResponseDto(updated);
        }

        private static CommentResponseDto MapToResponseDto(Comment comment) => new()
        {
            Id = comment.Id,
            Content = comment.Content,
            Edited = comment.Edited,
            TicketId = comment.TicketId,
            ActivityLogId = comment.ActivityLogId,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt,
            Author = comment.User is null ? null : new UserSummaryDto
            {
                Id = comment.User.Id,
                Name = comment.User.Name,
                ProfileImage = comment.User.ProfileImage
            }
        };

        public async Task<IEnumerable<CommentResponseDto>> GetCommentsByTicketIdAsync(string ticketId)
        {
            var comments = await _commentRepository.GetCommentsByTicketIdAsync(ticketId);
            return comments.Select(MapToResponseDto);
        }
    }

}