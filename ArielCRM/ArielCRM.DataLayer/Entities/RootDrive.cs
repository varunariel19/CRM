using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities;

[Table("RootDrives")]
public class RootDrive
{
    [Key]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string DriveName { get; set; } = string.Empty;

    [Required]
    [MaxLength(5)]
    public string DriveKey { get; set; } = string.Empty;

    [Required]
    public long DiskSize { get; set; } = 0;

    public int FoldersCount { get; set; } = 0;
    public int FileCount { get; set; } = 0;

    public bool CanCreate { get; set; } = false;

    [Required]
    public long OccupiedSpace { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public List<string> AllowedUsersId { get; set; } = [];

    public ICollection<Folder> Folders { get; set; } = [];
}