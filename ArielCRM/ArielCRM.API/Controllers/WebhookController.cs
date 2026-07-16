using ArielCRM.Infrastructure.Data;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ArielCRM.Application.Hubs;
namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/webhook")]
    public class WebhookController(AppDbContext db, IHubContext<TeamsHub> hubContext, IConfiguration configuration) : ControllerBase
    {

        [HttpPost("delayed/send")]
        public async Task<IActionResult> SendDelayedMessage([FromBody] DelayedMessageWebhookDto dto)
        {
            try
            {
                Console.WriteLine("RECEIVE HIT OF MAIN BACKEND ", DateTime.UtcNow);
                if (!IsAuthorized(Request))
                    return Unauthorized(new { message = "Invalid or missing webhook credentials." });

                var scheduled = await db.ScheduledTeamMessages
                    .Include(s => s.Attachments)
                    .Include(s => s.Keys)              // ADD — need the wrapped keys to carry over
                    .FirstOrDefaultAsync(s => s.Id == dto.MessageId);

                if (scheduled is null)
                {
                    return Ok(new { status = "ignored", reason = "Scheduled message not found." });
                }

                if (scheduled.Status == "Sent")
                {
                    return Ok(new { status = "already_sent", sentMessageId = scheduled.SentMessageId });
                }

                if (scheduled.Status == "Cancelled")
                {
                    return Ok(new { status = "cancelled", reason = "Message was cancelled before it could be sent." });
                }

                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == scheduled.ConversationId);
                if (conversation is null)
                {
                    scheduled.Status = "Failed";
                    scheduled.FailureReason = "Conversation no longer exists.";
                    scheduled.UpdatedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                    return Ok(new { status = "failed", reason = scheduled.FailureReason });
                }

                var now = DateTime.UtcNow;
                var message = new TeamMessage
                {
                    ConversationId = scheduled.ConversationId,
                    SenderId = scheduled.SenderId,
                    SeenByIds = [scheduled.SenderId],
                    Content = scheduled.Content ?? string.Empty,
                    Iv = scheduled.Iv,                 // ADD — carry over the IV
                    CreatedAt = now,
                    UpdatedAt = now
                };

                foreach (var attachment in scheduled.Attachments)
                {
                    message.Attachments.Add(new TeamMessageAttachment
                    {
                        FileName = attachment.FileName,
                        FileUrl = attachment.FileUrl,
                        UploadId = attachment.UploadId,
                        ContentType = attachment.ContentType,
                        AttachmentType = attachment.AttachmentType,
                        SizeBytes = attachment.SizeBytes,
                        CreatedAt = now
                    });
                }

                // ADD — copy each recipient's wrapped AES key onto the new live message
                foreach (var key in scheduled.Keys)
                {
                    message.RecipientKeys.Add(new TeamMessageKey
                    {
                        RecipientId = key.RecipientId,
                        EncryptedAesKey = key.EncryptedAesKey,
                        CreatedAt = now
                    });
                }

                conversation.LastMessageAt = now;
                db.TeamMessages.Add(message);

                scheduled.Status = "Sent";
                scheduled.SentMessageId = message.Id;
                scheduled.UpdatedAt = now;

                await db.SaveChangesAsync();

                var saved = await db.TeamMessages
                    .AsNoTracking()
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .Include(m => m.RecipientKeys)     // ADD — needed for per-recipient mapping
                    .FirstAsync(m => m.Id == message.Id);

                // CHANGED — send each member their own DTO with their own EncryptedAesKey,
                // instead of one shared `mapped` object for everyone
                foreach (var memberId in conversation.Members)
                {
                    await hubContext.Clients.User(memberId).SendAsync("MessageReceived", MapMessage(saved, memberId));
                }

                await hubContext.Clients.Users(conversation.Members).SendAsync(
                    "ScheduledMessageDelivered",
                    conversation.Id,
                    scheduled.Id
                );

                return Ok(new { status = "sent", messageId = message.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        // CHANGED — now takes recipientId, same signature as TeamsController.MapMessage
        private static TeamMessageDto MapMessage(TeamMessage message, string recipientId) => new()
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SeenByIds = [.. message.SeenByIds],
            SenderName = message.Sender.Name,
            SenderProfileImage = message.Sender.ProfileImage,
            Content = message.IsDeleted ? string.Empty : (message.Content ?? ""),
            Iv = message.IsDeleted ? null : message.Iv,                                                              // ADD
            EncryptedAesKey = message.IsDeleted ? null : message.RecipientKeys.FirstOrDefault(k => k.RecipientId == recipientId)?.EncryptedAesKey, // ADD
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt,
            IsDeleted = message.IsDeleted,
            IsEdited = message.IsEdited,
            IsScheduled = message.IsScheduled,
            ScheduledAt = message.ScheduledAt,
            Attachments = [..message.Attachments.OrderBy(a => a.CreatedAt).Select(a => new TeamMessageAttachmentDto
        {
            Id = a.Id,
            FileName = a.FileName,
            FileUrl = a.FileUrl,
            UploadId = a.UploadId,
            ContentType = a.ContentType,
            AttachmentType = a.AttachmentType,
            SizeBytes = a.SizeBytes,
            CreatedAt = a.CreatedAt
        })]
        };
        private bool IsAuthorized(HttpRequest request)
        {
            var headerName = configuration["SchedulerWebhookAuthHeader"];
            var expectedToken = configuration["SchedulerWebhookAuthToken"];

            if (string.IsNullOrEmpty(headerName) || string.IsNullOrEmpty(expectedToken))
                return false;

            return request.Headers.TryGetValue(headerName, out var provided)
                && provided.ToString() == expectedToken;
        }


    }


}