using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities;

[Table("Folders")]
public class Folder
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string FolderKey { get; set; } = string.Empty;

    public Guid? ParentFolderId { get; set; }

    public Guid? RootDriveId { get; set; }

    public string? UserId { get; set; }

    public bool IsSystem { get; set; }

    public long FolderSize { get; set; } = 0;

    public int FoldersCount { get; set; } = 0;
    public int FileCount { get; set; } = 0;

    public bool CanCreate { get; set; } = true;

    public bool IsDeleted { get; set; }

    public bool IsDeletedAsRoot { get; set; }

    public DateTime? DeletedAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }



    [ForeignKey(nameof(ParentFolderId))]
    public Folder? ParentFolder { get; set; }

    [ForeignKey(nameof(RootDriveId))]
    public RootDrive? Drive { get; set; }

    public ICollection<Folder> ChildFolders { get; set; } = [];

    [ForeignKey(nameof(UserId))]
    public User? CreatedBy { get; set; }

    public ICollection<DocumentFile> Files { get; set; } = [];

    public List<string> AllowedUsersId { get; set; } = [];
}