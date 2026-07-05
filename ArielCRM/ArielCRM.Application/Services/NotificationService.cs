using ArielCRM.Application.Extensions;
using ArielCRM.Application.Hubs;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Application.Services
{
    public class NotificationService(AppDbContext db, IHubContext<TeamsHub> hub) : INotificationService
    {
        public async Task CreateAsync(CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                Title = dto.Title,
                Message = dto.Message,
                EntityType = dto.EntityType,
                EntityId = dto.EntityId,
                Link = dto.Link
            };

            notification.Recipients = [.. dto.UserIds.Select(userId => new NotificationRecipient
            {
                NotificationId = notification.Id,
                UserId = userId
            })];

            db.Notifications.Add(notification);
            await db.SaveChangesAsync();

            foreach (var userId in dto.UserIds)
            {
                var response = notification.ToResponseDto(isRead: false);
                await hub.Clients.User(userId).SendAsync("NotificationReceived", response);
            }
        }

        public async Task<List<NotificationResponseDto>> GetForUserAsync(string userId, int take = 30)
        {
            var recipients = await db.NotificationRecipients
                .Include(r => r.Notification)
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.Notification!.CreatedAt)
                .Take(take)
                .ToListAsync();

            return [.. recipients.Select(r => r.Notification!.ToResponseDto(r.IsRead))];
        }

        public Task<int> GetUnreadCountAsync(string userId) =>
            db.NotificationRecipients.CountAsync(r => r.UserId == userId && !r.IsRead);

        public async Task MarkAsReadAsync(string userId, string notificationId)
        {
            var recipient = await db.NotificationRecipients
                .FirstOrDefaultAsync(r => r.NotificationId == notificationId && r.UserId == userId);

            if (recipient is null || recipient.IsRead) return;

            recipient.IsRead = true;
            recipient.ReadAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        public async Task MarkAllAsReadAsync(string userId)
        {
            await db.NotificationRecipients
                .Where(r => r.UserId == userId && !r.IsRead)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(r => r.IsRead, true)
                    .SetProperty(r => r.ReadAt, DateTime.UtcNow));
        }

        public async Task RemoveForUserAsync(string userId, string notificationId)
        {
            var recipient = await db.NotificationRecipients
                .FirstOrDefaultAsync(r => r.NotificationId == notificationId && r.UserId == userId);

            if (recipient is null) return;

            db.NotificationRecipients.Remove(recipient);
            await db.SaveChangesAsync();

            await DeleteIfOrphanedAsync(notificationId);
        }

        public async Task ClearReadForUserAsync(string userId)
        {
            var readRecipients = await db.NotificationRecipients
                .Where(r => r.UserId == userId && r.IsRead)
                .ToListAsync();

            if (readRecipients.Count == 0) return;

            var affectedNotificationIds = readRecipients.Select(r => r.NotificationId).Distinct().ToList();

            db.NotificationRecipients.RemoveRange(readRecipients);
            await db.SaveChangesAsync();

            foreach (var notificationId in affectedNotificationIds)
            {
                await DeleteIfOrphanedAsync(notificationId);
            }
        }

        private async Task DeleteIfOrphanedAsync(string notificationId)
        {
            var hasAnyRecipients = await db.NotificationRecipients
                .AnyAsync(r => r.NotificationId == notificationId);

            if (hasAnyRecipients) return;

            var notification = await db.Notifications.FindAsync(notificationId);
            if (notification is not null)
            {
                db.Notifications.Remove(notification);
                await db.SaveChangesAsync();
            }


        }

    }
}