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
                .Where(c => c.Members.Any(m => m.UserId == UserId))
                .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
                .ToListAsync();

            return Ok(conversations.Select(MapConversation).ToList());
        }

        [HttpGet("conversations/{conversationId}/messages")]
        public async Task<ActionResult<List<TeamMessageDto>>> GetMessages(string conversationId, [FromQuery] int take = 80)
        {
            if (!await IsMember(conversationId)) return Forbid();

            take = Math.Clamp(take, 1, 200);
            var messages = await db.TeamMessages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Include(m => m.Attachments)
                .Where(m => m.ConversationId == conversationId)
                .OrderByDescending(m => m.SentAt)
                .Take(take)
                .OrderBy(m => m.SentAt)
                .Select(m => MapMessage(m))
                .ToListAsync();

            return Ok(messages);
        }

        [HttpPost("conversations/direct")]
        public async Task<ActionResult<TeamConversationDto>> CreateDirectConversation(CreateDirectConversationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserId) || dto.UserId == UserId)
                return BadRequest(new { message = "Select another employee to start a direct chat." });

            var targetExists = await db.Users.AnyAsync(u => u.Id == dto.UserId);
            if (!targetExists) return NotFound(new { message = "Employee not found." });

            var existing = await BaseConversationQuery()
                .Where(c => !c.IsGroup && c.Members.Any(m => m.UserId == UserId) && c.Members.Any(m => m.UserId == dto.UserId))
                .FirstOrDefaultAsync();

            if (existing is not null) return Ok(MapConversation(existing));

            var conversation = new TeamConversation
            {
                IsGroup = false,
                CreatedById = UserId,
                Members =
                [
                    new TeamConversationMember { UserId = UserId },
                    new TeamConversationMember { UserId = dto.UserId }
                ]
            };

            db.TeamConversations.Add(conversation);
            await db.SaveChangesAsync();

            var created = await BaseConversationQuery().FirstAsync(c => c.Id == conversation.Id);
            await hubContext.Clients.Users(UserId, dto.UserId).SendAsync("ConversationChanged", MapConversation(created));
            return Ok(MapConversation(created));
        }

        [HttpPost("conversations/groups")]
        public async Task<ActionResult<TeamConversationDto>> CreateGroupConversation(CreateGroupConversationDto dto)
        {
            var name = dto.Name.Trim();
            var memberIds = dto.MemberIds.Where(id => !string.IsNullOrWhiteSpace(id)).Append(UserId).Distinct().ToList();

            if (name.Length < 2) return BadRequest(new { message = "Group name must be at least 2 characters." });
            if (memberIds.Count < 3) return BadRequest(new { message = "A group needs at least 3 employees including you." });

            var validMemberIds = await db.Users.Where(u => memberIds.Contains(u.Id)).Select(u => u.Id).ToListAsync();
            if (validMemberIds.Count != memberIds.Count) return BadRequest(new { message = "One or more selected employees do not exist." });

            var conversation = new TeamConversation
            {
                Name = name,
                IsGroup = true,
                CreatedById = UserId,
                Members = validMemberIds.Select(id => new TeamConversationMember { UserId = id }).ToList()
            };

            db.TeamConversations.Add(conversation);
            await db.SaveChangesAsync();

            var created = await BaseConversationQuery().FirstAsync(c => c.Id == conversation.Id);
            await hubContext.Clients.Users(validMemberIds).SendAsync("ConversationChanged", MapConversation(created));
            return Ok(MapConversation(created));
        }

        [HttpPost("conversations/{conversationId}/messages")]
        [RequestSizeLimit(420_000_000)]
        public async Task<ActionResult<TeamMessageDto>> SendMessage(string conversationId, [FromForm] SendTeamMessageDto dto)
        {
            if (!await IsMember(conversationId)) return Forbid();

            var body = (dto.Body ?? string.Empty).Trim();
            var files = dto.Attachments.Where(f => f.Length > 0).ToList();
            if (body.Length == 0 && files.Count == 0) return BadRequest(new { message = "Message cannot be empty." });
            if (body.Length > 4000) return BadRequest(new { message = "Message is too long." });
            if (files.Count > MaxAttachmentCount) return BadRequest(new { message = $"Attach up to {MaxAttachmentCount} files per message." });
            if (files.Any(f => f.Length > MaxAttachmentBytes)) return BadRequest(new { message = "Each attachment must be 50 MB or smaller." });

            var message = new TeamMessage
            {
                ConversationId = conversationId,
                SenderId = UserId,
                Body = body,
                SentAt = DateTime.UtcNow
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
                    CreatedAt = message.SentAt
                });
            }

            var conversation = await db.TeamConversations.FirstAsync(c => c.Id == conversationId);
            conversation.LastMessageAt = message.SentAt;

            db.TeamMessages.Add(message);
            await db.SaveChangesAsync();

            var saved = await db.TeamMessages
                .AsNoTracking()
                .Include(m => m.Sender)
                .Include(m => m.Attachments)
                .FirstAsync(m => m.Id == message.Id);

            var mapped = MapMessage(saved);
            var memberIds = await db.TeamConversationMembers
                .Where(m => m.ConversationId == conversationId)
                .Select(m => m.UserId)
                .ToListAsync();

            await hubContext.Clients.Users(memberIds).SendAsync("MessageReceived", mapped);
            return Ok(mapped);
        }

        [HttpPost("conversations/{conversationId}/read")]
        public async Task<IActionResult> MarkRead(string conversationId)
        {
            var member = await db.TeamConversationMembers.FirstOrDefaultAsync(m => m.ConversationId == conversationId && m.UserId == UserId);
            if (member is null) return Forbid();

            member.LastReadAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
            return NoContent();
        }

        private IQueryable<TeamConversation> BaseConversationQuery() => db.TeamConversations
            .AsNoTracking()
            .Include(c => c.Members).ThenInclude(m => m.User)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1)).ThenInclude(m => m.Sender)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1)).ThenInclude(m => m.Attachments);

        private Task<bool> IsMember(string conversationId) => db.TeamConversationMembers
            .AnyAsync(m => m.ConversationId == conversationId && m.UserId == UserId);

        private static TeamConversationDto MapConversation(TeamConversation conversation) => new()
        {
            Id = conversation.Id,
            Name = conversation.Name,
            IsGroup = conversation.IsGroup,
            CreatedById = conversation.CreatedById,
            CreatedAt = conversation.CreatedAt,
            LastMessageAt = conversation.LastMessageAt,
            Members = conversation.Members.Select(m => new TeamConversationMemberDto
            {
                Id = m.User.Id,
                Name = m.User.Name,
                Email = m.User.Email,
                ProfileImage = m.User.ProfileImage,
                JoinedAt = m.JoinedAt,
                LastReadAt = m.LastReadAt
            }).OrderBy(m => m.Name).ToList(),
            LastMessage = conversation.Messages.OrderByDescending(m => m.SentAt).Select(MapMessage).FirstOrDefault()
        };

        private static TeamMessageDto MapMessage(TeamMessage message) => new()
        {
            Id = message.Id,
            ConversationId = message.ConversationId,
            SenderId = message.SenderId,
            SenderName = message.Sender.Name,
            SenderProfileImage = message.Sender.ProfileImage,
            Body = message.Body,
            SentAt = message.SentAt,
            EditedAt = message.EditedAt,
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
