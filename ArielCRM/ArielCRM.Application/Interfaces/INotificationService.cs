using ArielCRM.DataLayer.Entities;

namespace ArielCRM.Application.Interfaces
{
    public interface INotificationService
    {
        Task<Notification> CreateAsync(Notification notification);

        Task<List<Notification>> GetForUserAsync(string userId, int take = 30);

        Task<int> GetUnreadCountAsync(string userId);

        Task MarkAsReadAsync(string userId, string notificationId);

        Task MarkAllAsReadAsync(string userId);
    }
}