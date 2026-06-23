using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
   public interface ICommentRepository
    {
        Task<IEnumerable<Comment>> GetCommentsByTicketIdAsync(string ticketId);
        Task<Comment> AddCommentAsync(Comment comment);
        Task<Comment?> GetCommentByIdAsync(string commentId);
        Task<Comment> UpdateCommentAsync(Comment comment);

    }

}