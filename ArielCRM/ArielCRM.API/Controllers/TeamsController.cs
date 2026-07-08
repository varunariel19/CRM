using System.Security.Claims;
using ArielCRM.Application.Hubs;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IService;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/teams")]
    [Authorize]
    public class TeamsController(AppDbContext db, IHubContext<TeamsHub> hubContext, IAppwriteStorageService storageService,
    IConfiguration configuration, IHttpClientFactory httpClientFactory, INotificationService notificationService) : ControllerBase
    {
        private const int MaxAttachmentCount = 8;
        private const long MaxAttachmentBytes = 50 * 1024 * 1024;

        private readonly string[] _allowedAttachmentHosts =
    (configuration["Appwrite:Endpoint"] is string ep && Uri.TryCreate(ep, UriKind.Absolute, out var u))
        ? [u.Host]
        : [];

        private bool IsValidAttachmentUrl(string fileUrl)
        {
            if (!Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri)) return false;
            if (uri.Scheme != Uri.UriSchemeHttps) return false;
            return _allowedAttachmentHosts.Contains(uri.Host);
        }

        private static string SafeAttachmentType(string type) =>
            type is "image" or "audio" or "video" or "document" ? type : "file";


        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("conversations")]
        public async Task<ActionResult<List<TeamConversationDto>>> GetConversations()
        {
            try
            {
                var conversations = await BaseConversationQuery()
                    .Where(c => c.Members.Contains(UserId))
                    .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                    .ToListAsync();

                var users = await LoadUsers(conversations.SelectMany(c => c.Members));
                return Ok(conversations.Select(c => MapConversation(c, users)).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<TeamMessageDto>>> GetMessages(
            string conversationId,
            [FromQuery] int take = 40,
            [FromQuery] string? before = null)
        {
            try
            {
                if (!await IsMember(conversationId)) return Forbid();

                take = Math.Clamp(take, 1, 100);

                var query = db.TeamMessages
                    .AsNoTracking()
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .Where(m => m.ConversationId == conversationId);

                if (!string.IsNullOrEmpty(before))
                {
                    var pivot = await db.TeamMessages
                        .AsNoTracking()
                        .Where(m => m.Id == before && m.ConversationId == conversationId)
                        .Select(m => m.CreatedAt)
                        .FirstOrDefaultAsync();

                    if (pivot != default)
                        query = query.Where(m => m.CreatedAt < pivot);
                }

                var messages = await query
                    .OrderByDescending(m => m.CreatedAt)
                    .Take(take)
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => MapMessage(m))
                    .ToListAsync();

                return Ok(messages);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpPut("conversations/{conversationId}/messages/{messageId}")]
        public async Task<ActionResult<TeamMessageDto>> EditMessage(string conversationId, string messageId, EditTeamMessageDto dto)
        {
            try
            {
                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
                if (conversation is null || !conversation.Members.Contains(UserId)) return Forbid();

                var message = await db.TeamMessages
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ConversationId == conversationId);

                if (message is null) return NotFound();
                if (message.SenderId != UserId) return Forbid();
                if (message.IsDeleted) return BadRequest(new { message = "Cannot edit a deleted message." });

                var content = (dto.Content ?? string.Empty).Trim();
                if (content.Length == 0) return BadRequest(new { message = "Message cannot be empty." });
                if (content.Length > 4000) return BadRequest(new { message = "Message is too long." });

                message.Content = content;
                message.IsEdited = true;
                message.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();

                var mapped = MapMessage(message);
                await hubContext.Clients.Group(conversationId).SendAsync("MessageEdited", mapped);
                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpDelete("conversations/{conversationId}/messages/{messageId}")]
        public async Task<IActionResult> DeleteMessage(string conversationId, string messageId)
        {
            try
            {
                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
                if (conversation is null || !conversation.Members.Contains(UserId)) return Forbid();

                var message = await db.TeamMessages
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ConversationId == conversationId);

                if (message is null) return NotFound();
                if (message.SenderId != UserId) return Forbid();
                if (message.IsDeleted) return NoContent();

                message.IsDeleted = true;
                message.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();

                var mapped = MapMessage(message);
                await hubContext.Clients.Group(conversationId).SendAsync("MessageDeleted", mapped);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpPost("conversations/direct")]
        public async Task<ActionResult<TeamConversationDto>> CreateDirectConversation(CreateDirectConversationDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.UserId) || dto.UserId == UserId)
                    return BadRequest(new { message = "Select another employee to start a direct chat." });

                var content = (dto.FirstMessage ?? string.Empty).Trim();
                var attachments = dto.Attachments ?? [];

                if (content.Length == 0 && attachments.Count == 0)
                    return BadRequest(new { message = "A message is required to start a conversation." });
                if (content.Length > 4000)
                    return BadRequest(new { message = "Message is too long." });
                if (attachments.Count > MaxAttachmentCount)
                    return BadRequest(new { message = $"Attach up to {MaxAttachmentCount} files per message." });
                if (attachments.Any(a => a.SizeBytes > MaxAttachmentBytes))
                    return BadRequest(new { message = "Each attachment must be 50 MB or smaller." });
                if (attachments.Any(a => !IsValidAttachmentUrl(a.FileUrl)))
                    return BadRequest(new { message = "One or more attachment URLs are invalid." });

                var targetExists = await db.Users.AnyAsync(u => u.Id == dto.UserId);
                if (!targetExists) return NotFound(new { message = "Employee not found." });

                var existing = await db.TeamConversations
                    .FirstOrDefaultAsync(c => !c.IsGroup && c.Members.Contains(UserId) && c.Members.Contains(dto.UserId));

                string conversationId;

                if (existing is not null)
                {
                    conversationId = existing.Id;
                }
                else
                {
                    var conversation = new TeamConversation
                    {
                        IsGroup = false,
                        CreatedById = UserId,
                        Members = [UserId, dto.UserId]
                    };
                    db.TeamConversations.Add(conversation);
                    await db.SaveChangesAsync();
                    conversationId = conversation.Id;
                }

                var now = DateTime.UtcNow;
                var message = new TeamMessage
                {
                    ConversationId = conversationId,
                    SenderId = UserId,
                    SeenByIds = [UserId],
                    Content = content,
                    CreatedAt = now
                };

                foreach (var a in attachments)
                {
                    message.Attachments.Add(new TeamMessageAttachment
                    {
                        FileName = a.FileName,
                        FileUrl = a.FileUrl,
                        UploadId = string.Empty,
                        ContentType = string.IsNullOrWhiteSpace(a.ContentType) ? "application/octet-stream" : a.ContentType,
                        AttachmentType = SafeAttachmentType(a.AttachmentType),
                        SizeBytes = a.SizeBytes,
                        CreatedAt = now
                    });
                }

                var targetConversation = await db.TeamConversations.FirstAsync(c => c.Id == conversationId);
                targetConversation.LastMessageAt = now;

                db.TeamMessages.Add(message);
                await db.SaveChangesAsync();

                var savedMessage = await db.TeamMessages
                    .AsNoTracking()
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .FirstAsync(m => m.Id == message.Id);

                var mappedMessage = MapMessage(savedMessage);

                var created = await BaseConversationQuery().FirstAsync(c => c.Id == conversationId);
                var users = await LoadUsers(created.Members);
                var mappedConversation = MapConversation(created, users);

                await hubContext.Clients.Users(created.Members).SendAsync("ConversationChanged", mappedConversation);
                await hubContext.Clients.Users(created.Members).SendAsync("MessageReceived", mappedMessage);

                return Ok(mappedConversation);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPost("conversations/groups")]
        public async Task<ActionResult<TeamConversationDto>> CreateGroupConversation(CreateGroupConversationDto dto)
        {
            try
            {
                var name = dto.Name.Trim();
                var memberIds = dto.MemberIds.Where(id => !string.IsNullOrWhiteSpace(id)).Append(UserId).Distinct().ToArray();

                if (name.Length < 2) return BadRequest(new { message = "Group name must be at least 2 characters." });
                if (memberIds.Length < 3) return BadRequest(new { message = "A group needs at least 3 employees including you." });

                var validMemberIds = await db.Users.Where(u => memberIds.Contains(u.Id)).Select(u => u.Id).ToArrayAsync();
                if (validMemberIds.Length != memberIds.Length) return BadRequest(new { message = "One or more selected employees do not exist." });

                var conversation = new TeamConversation
                {
                    Name = name,
                    IsGroup = true,
                    CreatedById = UserId,
                    Members = validMemberIds
                };

                db.TeamConversations.Add(conversation);
                await db.SaveChangesAsync();

                var created = await BaseConversationQuery().FirstAsync(c => c.Id == conversation.Id);
                var users = await LoadUsers(created.Members);
                var mapped = MapConversation(created, users);
                await hubContext.Clients.Users(created.Members).SendAsync("ConversationChanged", mapped);
                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPost("conversations/{conversationId}/members")]
        public async Task<ActionResult<TeamConversationDto>> AddGroupMembers(string conversationId, AddGroupMembersDto dto)
        {
            try
            {
                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
                if (conversation is null) return NotFound();
                if (!conversation.Members.Contains(UserId)) return Forbid();
                if (!conversation.IsGroup) return BadRequest(new { message = "Members can only be added to group conversations." });

                var requestedIds = dto.MemberIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToArray();
                var nextMemberIds = conversation.Members.Concat(requestedIds).Distinct().ToArray();
                var validMemberIds = await db.Users.Where(u => nextMemberIds.Contains(u.Id)).Select(u => u.Id).ToArrayAsync();
                if (validMemberIds.Length != nextMemberIds.Length) return BadRequest(new { message = "One or more selected employees do not exist." });

                conversation.Members = nextMemberIds;
                await db.SaveChangesAsync();

                var updated = await BaseConversationQuery().FirstAsync(c => c.Id == conversationId);
                var users = await LoadUsers(updated.Members);
                var mapped = MapConversation(updated, users);
                await hubContext.Clients.Users(updated.Members).SendAsync("ConversationChanged", mapped);
                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpPost("conversations/{conversationId}/messages")]
        public async Task<ActionResult<TeamMessageDto>> SendMessage(string conversationId, SendTeamMessageDto dto)
        {
            try
            {
                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
                if (conversation is null || !conversation.Members.Contains(UserId)) return Forbid();

                var content = (dto.Body ?? string.Empty).Trim();
                var attachments = dto.Attachments ?? [];
                if (content.Length == 0 && attachments.Count == 0) return BadRequest(new { message = "Message cannot be empty." });
                if (content.Length > 4000) return BadRequest(new { message = "Message is too long." });
                if (attachments.Count > MaxAttachmentCount) return BadRequest(new { message = $"Attach up to {MaxAttachmentCount} files per message." });
                if (attachments.Any(a => a.SizeBytes > MaxAttachmentBytes)) return BadRequest(new { message = "Each attachment must be 50 MB or smaller." });
                if (attachments.Any(a => !IsValidAttachmentUrl(a.FileUrl))) return BadRequest(new { message = "One or more attachment URLs are invalid." });

                var now = DateTime.UtcNow;
                var isScheduled = dto.ScheduledAt is not null && dto.ScheduledAt > now;

                if (isScheduled)
                {
                    var scheduled = new ScheduledTeamMessage
                    {
                        ConversationId = conversationId,
                        SenderId = UserId,
                        Content = content,
                        ScheduledAt = dto.ScheduledAt!.Value,
                        Status = "Pending",
                        CreatedAt = now
                    };

                    foreach (var a in attachments)
                    {
                        scheduled.Attachments.Add(new ScheduledTeamMessageAttachment
                        {
                            FileName = a.FileName,
                            FileUrl = a.FileUrl,
                            UploadId = string.Empty,
                            ContentType = string.IsNullOrWhiteSpace(a.ContentType) ? "application/octet-stream" : a.ContentType,
                            AttachmentType = SafeAttachmentType(a.AttachmentType),
                            SizeBytes = a.SizeBytes,
                            CreatedAt = now
                        });
                    }

                    db.ScheduledTeamMessages.Add(scheduled);
                    await db.SaveChangesAsync();

                    var jobId = await ScheduleDelayedMessageAsync(scheduled, conversation);

                    scheduled.JobId = jobId;
                    await db.SaveChangesAsync();

                    return Accepted(MapScheduledMessage(scheduled));
                }

                var message = new TeamMessage
                {
                    ConversationId = conversationId,
                    SenderId = UserId,
                    SeenByIds = [UserId],
                    Content = content,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                foreach (var a in attachments)
                {
                    message.Attachments.Add(new TeamMessageAttachment
                    {
                        FileName = a.FileName,
                        FileUrl = a.FileUrl,
                        UploadId = string.Empty,
                        ContentType = string.IsNullOrWhiteSpace(a.ContentType) ? "application/octet-stream" : a.ContentType,
                        AttachmentType = SafeAttachmentType(a.AttachmentType),
                        SizeBytes = a.SizeBytes,
                        CreatedAt = now
                    });
                }

                conversation.LastMessageAt = now;
                db.TeamMessages.Add(message);
                await db.SaveChangesAsync();

                var saved = await db.TeamMessages
                    .AsNoTracking()
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .FirstAsync(m => m.Id == message.Id);

                var mapped = MapMessage(saved);
                await hubContext.Clients.Users(conversation.Members).SendAsync("MessageReceived", mapped);

                var recipientIds = conversation.Members.Where(id => id != UserId).ToList();
                if (recipientIds.Count > 0)
                {
                    var senderName = saved.Sender?.Name ?? "Someone";
                    var preview = content.Length > 0
                        ? (content.Length > 80 ? content[..80] + "..." : content)
                        : $"Sent {attachments.Count} attachment(s)";

                    await notificationService.CreateAsync(new CreateNotificationDto
                    {
                        Title = $"You have new message from {senderName}",
                        Message = preview,
                        EntityType = "Message",
                        EntityId = message.Id,
                        Link = "teams",
                        UserIds = recipientIds
                    });
                }

                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        [HttpPost("conversations/{conversationId}/messages/{messageId}/restore")]
        public async Task<ActionResult<TeamMessageDto>> RestoreMessage(string conversationId, string messageId)
        {
            try
            {
                var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
                if (conversation is null || !conversation.Members.Contains(UserId)) return Forbid();

                var message = await db.TeamMessages
                    .Include(m => m.Sender)
                    .Include(m => m.Attachments)
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ConversationId == conversationId);

                if (message is null) return NotFound();
                if (message.SenderId != UserId) return Forbid();
                if (!message.IsDeleted) return BadRequest(new { message = "Message is not deleted." });

                var deletedAt = message.UpdatedAt ?? DateTime.MinValue;
                if (DateTime.UtcNow > deletedAt.AddMinutes(5))
                    return BadRequest(new { message = "Undo window has expired." });

                message.IsDeleted = false;
                message.UpdatedAt = DateTime.UtcNow;

                await db.SaveChangesAsync();

                var mapped = MapMessage(message);
                await hubContext.Clients.Group(conversationId).SendAsync("MessageRestored", mapped);
                return Ok(mapped);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpPost("conversations/{conversationId}/read")]
        public async Task<IActionResult> MarkRead(string conversationId)
        {
            try
            {
                if (!await IsMember(conversationId)) return Forbid();

                var messages = await db.TeamMessages
                    .Where(m => m.ConversationId == conversationId && m.SenderId != UserId)
                    .ToListAsync();

                var changedMessageIds = new List<string>();
                foreach (var message in messages)
                {
                    if (message.SeenByIds.Contains(UserId)) continue;
                    message.SeenByIds = message.SeenByIds.Append(UserId).Distinct().ToArray();
                    changedMessageIds.Add(message.Id);
                }

                if (changedMessageIds.Count == 0) return NoContent();

                await db.SaveChangesAsync();

                var senderIds = messages
                    .Where(m => changedMessageIds.Contains(m.Id))
                    .Select(m => m.SenderId)
                    .Distinct()
                    .ToArray();

                await hubContext.Clients.Users(senderIds).SendAsync("MessagesSeen", conversationId, changedMessageIds, UserId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }


        [HttpGet("conversations/{conversationId}/scheduled-messages")]
        public async Task<ActionResult<List<ScheduledTeamMessageDto>>> GetScheduledMessages(string conversationId)
        {
            try
            {
                var userId = UserId;

                var conversation = await db.TeamConversations
                    .AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == conversationId);

                if (conversation is null) return NotFound();
                if (!conversation.Members.Contains(userId)) return Forbid();

                var scheduled = await db.ScheduledTeamMessages
                    .AsNoTracking()
                    .Where(m => m.ConversationId == conversationId
                             && m.SenderId == userId
                             && m.Status == "Pending")
                    .OrderBy(m => m.ScheduledAt)
                    .Select(m => new ScheduledTeamMessageDto
                    {
                        Id = m.Id,
                        ConversationId = m.ConversationId,
                        SenderId = m.SenderId,
                        Content = m.Content ?? string.Empty,
                        ScheduledAt = m.ScheduledAt,
                        Status = m.Status.ToString(),
                        JobId = m.JobId,
                        CreatedAt = m.CreatedAt,
                        Attachments = m.Attachments.Select(a => new TeamMessageAttachmentDto
                        {
                            Id = a.Id,
                            FileName = a.FileName,
                            FileUrl = a.FileUrl,
                            UploadId = a.UploadId,
                            ContentType = a.ContentType,
                            AttachmentType = a.AttachmentType,
                            SizeBytes = a.SizeBytes,
                            CreatedAt = a.CreatedAt,
                        }).ToList(),
                    })
                    .ToListAsync();

                return Ok(scheduled);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }

        // DELETE api/teams/conversations/{conversationId}/scheduled-messages/{messageId}
        [HttpDelete("conversations/{conversationId}/scheduled-messages/{messageId}")]
        public async Task<IActionResult> CancelScheduledMessage(string conversationId, string messageId)
        {
            try
            {
                var userId = UserId;

                var scheduled = await db.ScheduledTeamMessages
                    .FirstOrDefaultAsync(m => m.Id == messageId && m.ConversationId == conversationId);

                if (scheduled is null) return NotFound();
                if (scheduled.SenderId != userId) return Forbid();
                if (scheduled.Status != ScheduledMessageStatus.Pending.ToString()) return BadRequest("Message is no longer pending.");

                scheduled.Status = ScheduledMessageStatus.Cancelled.ToString();
                await db.SaveChangesAsync();

                // Optional: also cancel the BullMQ job on the Node scheduler service, e.g.:
                // if (!string.IsNullOrEmpty(scheduled.JobId))
                //     await _schedulerClient.CancelJobAsync(scheduled.JobId);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An unexpected error occurred.", details = ex.Message });
            }
        }





        //   PRIVATE  FUNCATIONS : 

        private IQueryable<TeamConversation> BaseConversationQuery() => db.TeamConversations
            .AsNoTracking()
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1)).ThenInclude(m => m.Sender)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1)).ThenInclude(m => m.Attachments);

        private Task<bool> IsMember(string conversationId) => db.TeamConversations
            .AnyAsync(c => c.Id == conversationId && c.Members.Contains(UserId));

        private async Task<Dictionary<string, TeamUserDto>> LoadUsers(IEnumerable<string> userIds)
        {
            var ids = userIds.Where(id => !string.IsNullOrWhiteSpace(id)).Distinct().ToArray();
            return await db.Users
                .AsNoTracking()
                .Where(u => ids.Contains(u.Id))
                .Select(u => new TeamUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ProfileImage = u.ProfileImage
                })
                .ToDictionaryAsync(u => u.Id);
        }

        private static TeamConversationDto MapConversation(TeamConversation conversation, IReadOnlyDictionary<string, TeamUserDto> users) => new()
        {
            Id = conversation.Id,
            Name = conversation.Name,
            IsGroup = conversation.IsGroup,
            CreatedById = conversation.CreatedById,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            Members = [.. conversation.Members
                .Select(id => users.TryGetValue(id, out var user) ? new TeamConversationMemberDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    ProfileImage = user.ProfileImage
                } : new TeamConversationMemberDto { Id = id, Name = id })
                .OrderBy(m => m.Name)],
            LastMessage = conversation.Messages.OrderByDescending(m => m.CreatedAt).Select(MapMessage).FirstOrDefault()
        };


        private static TeamMessageDto MapMessage(TeamMessage message) => new()
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SeenByIds = [.. message.SeenByIds],
            SenderName = message.Sender.Name,
            SenderProfileImage = message.Sender.ProfileImage,
            Content = message.IsDeleted ? string.Empty : (message.Content ?? ""),
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


        private static string GetAttachmentType(string? contentType, string fileName)
        {
            var type = contentType?.ToLowerInvariant() ?? string.Empty;
            if (type.StartsWith("image/")) return "image";
            if (type.StartsWith("audio/")) return "audio";
            if (type.StartsWith("video/")) return "video";

            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension is ".pdf" or ".doc" or ".docx" or ".xls" or ".xlsx" or ".ppt" or ".pptx" or ".txt" or ".csv"
                ? "document"
                : "file";
        }


        private async Task<string> ScheduleDelayedMessageAsync(ScheduledTeamMessage scheduled, TeamConversation conversation)
        {
            var client = httpClientFactory.CreateClient();
            var schedulerBaseUrl = configuration["MessageSchedulerUrl"]
                ?? throw new InvalidOperationException("MessageSchedulerUrl is not configured.");

            var payload = new
            {
                messageId = scheduled.Id,
                conversationId = scheduled.ConversationId,
                senderId = scheduled.SenderId,
                scheduledAt = scheduled.ScheduledAt.ToString("o"), // ISO-8601
                webhookPayload = new
                {
                    content = scheduled.Content,
                    recipientIds = conversation.Members
                }
            };

            var response = await client.PostAsJsonAsync($"{schedulerBaseUrl}/schedule-message", payload);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<ScheduleMessageResult>();
            return result?.JobId ?? scheduled.Id;
        }


        private static ScheduledTeamMessageDto MapScheduledMessage(ScheduledTeamMessage s) => new()
        {
            Id = s.Id,
            ConversationId = s.ConversationId,
            SenderId = s.SenderId,
            Content = s.Content ?? string.Empty,
            ScheduledAt = s.ScheduledAt,
            Status = s.Status,
            JobId = s.JobId,
            CreatedAt = s.CreatedAt,
            Attachments = [.. s.Attachments.OrderBy(a => a.CreatedAt).Select(a => new TeamMessageAttachmentDto
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


        private record ScheduleMessageResult(string JobId);
    }
}