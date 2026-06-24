using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("team_message_attachments")]
    public class TeamMessageAttachment
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("message_id")]
        [MaxLength(50)]
        public string MessageId { get; set; } = string.Empty;

        [ForeignKey(nameof(MessageId))]
        public TeamMessage Message { get; set; } = null!;

        [Required]
        [Column("file_name")]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [Column("file_url")]
        public string FileUrl { get; set; } = string.Empty;

        [Required]
        [Column("upload_id")]
        [MaxLength(100)]
        public string UploadId { get; set; } = string.Empty;

        [Required]
        [Column("content_type")]
        [MaxLength(120)]
        public string ContentType { get; set; } = string.Empty;

        [Required]
        [Column("attachment_type")]
        [MaxLength(30)]
        public string AttachmentType { get; set; } = "file";

        [Required]
        [Column("size_bytes")]
        public long SizeBytes { get; set; }

        [Required]
        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
