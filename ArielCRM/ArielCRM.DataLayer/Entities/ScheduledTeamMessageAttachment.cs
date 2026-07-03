using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("scheduled_team_message_attachments")]
    public class ScheduledTeamMessageAttachment
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("scheduled_message_id")]
        [MaxLength(50)]
        public string ScheduledMessageId { get; set; } = string.Empty;

        [ForeignKey(nameof(ScheduledMessageId))]
        public ScheduledTeamMessage ScheduledMessage { get; set; } = null!;

        [Required]
        [Column("file_name")]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [Column("file_url")]
        [MaxLength(1000)]
        public string FileUrl { get; set; } = string.Empty;

        [Required]
        [Column("upload_id")]
        [MaxLength(255)]
        public string UploadId { get; set; } = string.Empty;

        [Required]
        [Column("content_type")]
        [MaxLength(100)]
        public string ContentType { get; set; } = "application/octet-stream";

        [Required]
        [Column("attachment_type")]
        [MaxLength(20)]
        public string AttachmentType { get; set; } = "file";

        [Column("size_bytes")]
        public long SizeBytes { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}