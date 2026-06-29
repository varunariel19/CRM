namespace ArielCRM.Infrastructure.DTOs
{
    using Microsoft.AspNetCore.Http;

    public class TeamUserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? ProfileImage { get; set; }
    }

    public class TeamConversationMemberDto : TeamUserDto
    {
    }

    public class TeamMessageDto
    {
        public string Id { get; set; } = string.Empty;
        public string ConversationId { get; set; } = string.Empty;
        public string SenderId { get; set; } = string.Empty;
        public List<string> SeenByIds { get; set; } = [];
        public string SenderName { get; set; } = string.Empty;
        public string? SenderProfileImage { get; set; }
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<TeamMessageAttachmentDto> Attachments { get; set; } = [];
    }

    public class TeamMessageAttachmentDto
    {
        public string Id { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public string UploadId { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public string AttachmentType { get; set; } = "file";
        public long SizeBytes { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class TeamConversationDto
    {
        public string Id { get; set; } = string.Empty;
        public string? Name { get; set; }
        public bool IsGroup { get; set; }
        public string CreatedById { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public List<TeamConversationMemberDto> Members { get; set; } = [];
        public TeamMessageDto? LastMessage { get; set; }
    }

    public class CreateDirectConversationDto
    {
        public string UserId { get; set; } = string.Empty;
        public string? FirstMessage { get; set; }
        public List<IFormFile>? Attachments { get; set; }
    }

    public class CreateGroupConversationDto
    {
        public string Name { get; set; } = string.Empty;
        public List<string> MemberIds { get; set; } = [];
    }

    public class SendTeamMessageDto
    {
        public string? Body { get; set; }
        public List<IFormFile> Attachments { get; set; } = [];
    }

    public class AddGroupMembersDto
    {
        public List<string> MemberIds { get; set; } = [];
    }
}
