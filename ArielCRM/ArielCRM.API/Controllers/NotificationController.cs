using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController(
        INotificationService notificationService,
        ILogger<NotificationsController> logger) : ControllerBase
    {
        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;


        [HttpPost("create-notification")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> HandleCreateNotification([FromBody] CreateNotificationDto dto)
        {
            if (dto.UserIds is null || dto.UserIds.Count == 0)
            {
                return BadRequest("At least one recipient (UserIds) is required.");
            }

            await notificationService.CreateAsync(dto);
            return Created();
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] int take = 30)
        {
            try
            {
                var notifications = await notificationService.GetForUserAsync(UserId, take);
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching notifications for user {UserId}", UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            try
            {
                var count = await notificationService.GetUnreadCountAsync(UserId);
                return Ok(count);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching unread count for user {UserId}", UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPut("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(string notificationId)
        {
            try
            {
                await notificationService.MarkAsReadAsync(UserId, notificationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while marking notification {NotificationId} as read for user {UserId}", notificationId, UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            try
            {
                await notificationService.MarkAllAsReadAsync(UserId);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while marking all notifications as read for user {UserId}", UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("{notificationId}")]
        public async Task<IActionResult> Remove(string notificationId)
        {
            try
            {
                await notificationService.RemoveForUserAsync(UserId, notificationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while removing notification {NotificationId} for user {UserId}", notificationId, UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        [HttpDelete("clear-all")]
        public async Task<IActionResult> ClearRead()
        {
            try
            {
                await notificationService.ClearReadForUserAsync(UserId);
                return NoContent();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while clearing read notifications for user {UserId}", UserId);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}