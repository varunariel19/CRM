using System.Security.Claims;
using ArielCRM.API.Hubs;
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
    public class TeamsController(AppDbContext db, IHubContext<TeamsHub> hubContext, IAppwriteStorageService storageService) : ControllerBase
    {
        private const int MaxAttachmentCount = 8;
        private const long MaxAttachmentBytes = 50 * 1024 * 1024;

        private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet("users")]
        public async Task<ActionResult<List<TeamUserDto>>> GetUsers()
        {
            var users = await db.Users
                .AsNoTracking()
                .OrderBy(u => u.Name)
                .Select(u => new TeamUserDto
                {
                    Id = u.Id,
                    Name = u.Name,
                    Email = u.Email,
                    ProfileImage = u.ProfileImage
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("conversations")]
        public async Task<ActionResult<List<TeamConversationDto>>> GetConversations()
        {
            var conversations = await BaseConversationQuery()
                .Where(c => c.Members.Contains(UserId))
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();

            var users = await LoadUsers(conversations.SelectMany(c => c.Members));
            return Ok(conversations.Select(c => MapConversation(c, users)).ToList());
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<TeamMessageDto>>> GetMessages(
            string conversationId,
            [FromQuery] int take = 40,
            [FromQuery] string? before = null)
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

        [HttpPost("conversations/direct")]
        [RequestSizeLimit(420_000_000)]
        public async Task<ActionResult<TeamConversationDto>> CreateDirectConversation([FromForm] CreateDirectConversationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserId) || dto.UserId == UserId)
                return BadRequest(new { message = "Select another employee to start a direct chat." });

            var content = (dto.FirstMessage ?? string.Empty).Trim();
            var files = (dto.Attachments ?? []).Where(f => f.Length > 0).ToList();

            if (content.Length == 0 && files.Count == 0)
                return BadRequest(new { message = "A message is required to start a conversation." });
            if (content.Length > 4000)
                return BadRequest(new { message = "Message is too long." });
            if (files.Count > MaxAttachmentCount)
                return BadRequest(new { message = $"Attach up to {MaxAttachmentCount} files per message." });
            if (files.Any(f => f.Length > MaxAttachmentBytes))
                return BadRequest(new { message = "Each attachment must be 50 MB or smaller." });

            var targetExists = await db.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!targetExists) return NotFound(new { message = "Employee not found." });

            // If conversation already exists, just send the message normally into it
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

            // Save the first message exactly like SendMessage does
            var now = DateTime.UtcNow;
            var message = new TeamMessage
            {
                ConversationId = conversationId,
                SenderId = UserId,
                SeenByIds = [UserId],
                Content = content,
                CreatedAt = now
            };

            foreach (var file in files)
            {
                var uploaded = await storageService.UploadFileAsync(file);
                message.Attachments.Add(new TeamMessageAttachment
                {
                    FileName = Path.GetFileName(file.FileName),
                    FileUrl = uploaded.FileUrl,
                    UploadId = uploaded.FileId,
                    ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                    AttachmentType = GetAttachmentType(file.ContentType, file.FileName),
                    SizeBytes = file.Length,
                    CreatedAt = now
                });
            }

            // Update conversation's LastMessageAt
            var targetConversation = await db.TeamConversations.FirstAsync(c => c.Id == conversationId);
            targetConversation.LastMessageAt = now;

            db.TeamMessages.Add(message);
            await db.SaveChangesAsync();

            // Load the saved message with sender + attachments for SignalR broadcast
            var savedMessage = await db.TeamMessages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Include(m => m.Attachments)
                .FirstAsync(m => m.Id == message.Id);

            var mappedMessage = MapMessage(savedMessage);

            // Load conversation for response
            var created = await BaseConversationQuery().FirstAsync(c => c.Id == conversationId);
            var users = await LoadUsers(created.Members);
            var mappedConversation = MapConversation(created, users);

            // Broadcast both events to all members
            await hubContext.Clients.Users(created.Members).SendAsync("ConversationChanged", mappedConversation);
            await hubContext.Clients.Users(created.Members).SendAsync("MessageReceived", mappedMessage);

            return Ok(mappedConversation);
        }

        [HttpPost("conversations/groups")]
        public async Task<ActionResult<TeamConversationDto>> CreateGroupConversation(CreateGroupConversationDto dto)
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

        [HttpPost("conversations/{conversationId}/members")]
        public async Task<ActionResult<TeamConversationDto>> AddGroupMembers(string conversationId, AddGroupMembersDto dto)
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

        [HttpPost("conversations/{conversationId}/messages")]
        [RequestSizeLimit(420_000_000)]
        public async Task<ActionResult<TeamMessageDto>> SendMessage(string conversationId, [FromForm] SendTeamMessageDto dto)
        {
            var conversation = await db.TeamConversations.FirstOrDefaultAsync(c => c.Id == conversationId);
            if (conversation is null || !conversation.Members.Contains(UserId)) return Forbid();

            var content = (dto.Body ?? string.Empty).Trim();
            var files = (dto.Attachments ?? []).Where(f => f.Length > 0).ToList();
            if (content.Length == 0 && files.Count == 0) return BadRequest(new { message = "Message cannot be empty." });
            if (content.Length > 4000) return BadRequest(new { message = "Message is too long." });
            if (files.Count > MaxAttachmentCount) return BadRequest(new { message = $"Attach up to {MaxAttachmentCount} files per message." });
            if (files.Any(f => f.Length > MaxAttachmentBytes)) return BadRequest(new { message = "Each attachment must be 50 MB or smaller." });

            var now = DateTime.UtcNow;
            var message = new TeamMessage
            {
                ConversationId = conversationId,
                SenderId = UserId,
                SeenByIds = [UserId],
                Content = content,
                CreatedAt = now
            };

            foreach (var file in files)
            {
                var uploaded = await storageService.UploadFileAsync(file);
                message.Attachments.Add(new TeamMessageAttachment
                {
                    FileName = Path.GetFileName(file.FileName),
                    FileUrl = uploaded.FileUrl,
                    UploadId = uploaded.FileId,
                    ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                    AttachmentType = GetAttachmentType(file.ContentType, file.FileName),
                    SizeBytes = file.Length,
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
            return Ok(mapped);
        }

        [HttpPost("conversations/{conversationId}/read")]
        public async Task<IActionResult> MarkRead(string conversationId)
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
            Members = conversation.Members
                .Select(id => users.TryGetValue(id, out var user) ? new TeamConversationMemberDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    ProfileImage = user.ProfileImage
                } : new TeamConversationMemberDto { Id = id, Name = id })
                .OrderBy(m => m.Name)
                .ToList(),
            LastMessage = conversation.Messages.OrderByDescending(m => m.CreatedAt).Select(MapMessage).FirstOrDefault()
        };

        private static TeamMessageDto MapMessage(TeamMessage message) => new()
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SeenByIds = message.SeenByIds.ToList(),
            SenderName = message.Sender.Name,
            SenderProfileImage = message.Sender.ProfileImage,
            Content = message.Content ?? string.Empty,
            CreatedAt = message.CreatedAt,
            UpdatedAt = message.UpdatedAt,
            Attachments = message.Attachments.OrderBy(a => a.CreatedAt).Select(a => new TeamMessageAttachmentDto
            {
                Id = a.Id,
                FileName = a.FileName,
                FileUrl = a.FileUrl,
                UploadId = a.UploadId,
                ContentType = a.ContentType,
                AttachmentType = a.AttachmentType,
                SizeBytes = a.SizeBytes,
                CreatedAt = a.CreatedAt
            }).ToList()
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
    }
}
