


using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Repositories
{
    public class CommentRepository(AppDbContext db) : ICommentRepository
    {
        private readonly AppDbContext _db = db;


        public async Task<IEnumerable<Comment>> GetCommentsByTicketIdAsync(string ticketId)
        {
            return await _db.Comments
                .Include(c => c.User)
                .Where(c => c.TicketId == ticketId)
                .OrderBy(c => c.CreatedAt)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Comment> AddCommentAsync(Comment comment)
        {
            await _db.Comments.AddAsync(comment);
            await _db.SaveChangesAsync();

            await _db.Entry(comment)
                .Reference(c => c.User)
                .LoadAsync();

            return comment;
        }

        public async Task<Comment?> GetCommentByIdAsync(string commentId)
        {
            return await _db.Comments
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Id == commentId);
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            _db.Comments.Update(comment);
            await _db.SaveChangesAsync();

            await _db.Entry(comment)
             .Reference(c => c.User)
             .LoadAsync();

            return comment;
        }
    }


}