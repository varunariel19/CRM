using ArielCRM.Application.Hubs;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Application.Services
{
    public class NotificationService(AppDbContext db, IHubContext<TeamsHub> hub) : INotificationService
    {
        public async Task<Notification> CreateAsync(Notification notification)
        {
            var userId = notification.UserId;

            db.Notifications.Add(notification);
            await db.SaveChangesAsync();

            await hub.Clients.User(userId).SendAsync("NotificationReceived", notification);
            return notification;
        }

        public Task<List<Notification>> GetForUserAsync(string userId, int take = 30) =>
            db.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Take(take)
                .ToListAsync();

        public Task<int> GetUnreadCountAsync(string userId) =>
            db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

        public async Task MarkAsReadAsync(string userId, string notificationId)
        {
            var n = await db.Notifications.FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId);
            if (n is null) return;
            n.IsRead = true;
            await db.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            await db.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true));
        }
    }

}