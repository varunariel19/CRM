using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    [Table("DocumentFiles")]
    public class DocumentFile
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string ContentType { get; set; } = string.Empty;

        [Required]
        [MaxLength(1000)]
        public string StoragePath { get; set; } = string.Empty;


        [Required]
        [MaxLength(2048)]
        public string Url { get; set; } = string.Empty;

        public DateTime? UrlExpiresAt { get; set; }

        [Range(0, long.MaxValue)]
        public long Size { get; set; }

        public bool IsHidden { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        public DateTime? DeletedAt { get; set; }

        [Required]
        [ForeignKey(nameof(Folder))]
        public Guid FolderId { get; set; }

        [Required]
        [MaxLength(450)]
        public string UserId { get; set; } = string.Empty;

        public Folder Folder { get; set; } = null!;

        [ForeignKey(nameof(UserId))]
        public User UploadedBy { get; set; } = null!;

        [Required]
        public DateTime UploadedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        [Timestamp]
        public byte[]? RowVersion { get; set; }

        public ICollection<string> AllowedUsersId { get; set; } = [];
    }
}