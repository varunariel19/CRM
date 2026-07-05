using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Extensions
{

    public static class NotificationMappingExtensions
    {
        public static NotificationResponseDto ToResponseDto(this Notification notification, bool isRead)
        {
            return new NotificationResponseDto
            {
                Id = notification.Id,
                Title = notification.Title,
                Message = notification.Message,
                EntityType = notification.EntityType,
                EntityId = notification.EntityId,
                Link = notification.Link,
                IsRead = isRead,
                CreatedAt = notification.CreatedAt
            };
        }
    }
}