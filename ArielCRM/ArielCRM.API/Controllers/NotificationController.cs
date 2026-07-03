using ArielCRM.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController(INotificationService notificationService) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int take = 30)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            var notifications = await notificationService.GetForUserAsync(userId, take);

            return Ok(notifications);
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(string notificationId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await notificationService.MarkAsReadAsync(userId, notificationId);

            return NoContent();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            await notificationService.MarkAllAsReadAsync(userId);

            return NoContent();
        }
    }
}