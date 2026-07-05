
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface INotificationService
    {
        Task CreateAsync(CreateNotificationDto dto);

        Task<List<NotificationResponseDto>> GetForUserAsync(string userId, int take = 30);

        Task<int> GetUnreadCountAsync(string userId);

        Task MarkAsReadAsync(string userId, string notificationId);

        Task MarkAllAsReadAsync(string userId);

        Task RemoveForUserAsync(string userId, string notificationId);

        Task ClearReadForUserAsync(string userId);
    }
}