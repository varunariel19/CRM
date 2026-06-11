using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{

    public enum AuditActionType { Create, Update, Delete, Restore, BulkCreate, BulkUpdate, BulkDelete }

    public enum AuditRevertType { None, Create, Update, Delete }

    public enum AuditStatus { Success, Failed, PartialSuccess }

    public enum AuditSourceType { User, System, Api, Webhook, Migration, Scheduled }

    [Table("audit_logs")]
    public class AuditLog
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("entity_name")]
        [MaxLength(100)]
        public string EntityName { get; set; } = string.Empty;

        [Required]
        [Column("entity_id")]
        [MaxLength(50)]
        public string EntityId { get; set; } = string.Empty;

        [Column("entity_display_name")]
        [MaxLength(255)]
        public string? EntityDisplayName { get; set; }

        [Column("entity_url")]
        [MaxLength(500)]
        public string? EntityUrl { get; set; }


        [Required]
        [Column("title", TypeName = "text")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("action_type")]
        [MaxLength(30)]
        public string ActionTypeRaw { get; set; } = AuditActionType.Create.ToString();

        [NotMapped]
        public AuditActionType ActionType
        {
            get => Enum.Parse<AuditActionType>(ActionTypeRaw, true);
            set => ActionTypeRaw = value.ToString();
        }

        [Column("action_description", TypeName = "text")]
        public string? ActionDescription { get; set; }

        [Required]
        [Column("revert_type")]
        [MaxLength(30)]
        public string RevertTypeRaw { get; set; } = AuditRevertType.None.ToString();

        [NotMapped]
        public AuditRevertType RevertType
        {
            get => Enum.Parse<AuditRevertType>(RevertTypeRaw, true);
            set => RevertTypeRaw = value.ToString();
        }

        [Column("is_reverted")]
        public bool IsReverted { get; set; } = false;

        [Column("reverted_at")]
        public DateTime? RevertedAt { get; set; }

        [Column("reverted_by_id")]
        [MaxLength(50)]
        public string? RevertedById { get; set; }

        [ForeignKey("RevertedById")]
        public User? RevertedBy { get; set; }

        [Column("previous_state", TypeName = "text")]
        public string? PreviousState { get; set; }

        [Column("updated_state", TypeName = "text")]
        public string? UpdatedState { get; set; }

        [Column("diff_data", TypeName = "text")]
        public string? DiffData { get; set; }

        [Column("affected_fields", TypeName = "text")]
        public string? AffectedFields { get; set; }

        [Column("batch_id")]
        [MaxLength(50)]
        public string? BatchId { get; set; }

        [Column("parent_audit_id")]
        [MaxLength(50)]
        public string? ParentAuditId { get; set; }

        [ForeignKey("ParentAuditId")]
        public AuditLog? ParentAudit { get; set; }

        [Required]
        [Column("status")]
        [MaxLength(20)]
        public string StatusRaw { get; set; } = AuditStatus.Success.ToString();

        [NotMapped]
        public AuditStatus Status
        {
            get => Enum.Parse<AuditStatus>(StatusRaw, true);
            set => StatusRaw = value.ToString();
        }

        [Column("failure_reason", TypeName = "text")]
        public string? FailureReason { get; set; }

        [Required]
        [Column("source")]
        [MaxLength(30)]
        public string SourceRaw { get; set; } = AuditSourceType.User.ToString();

        [NotMapped]
        public AuditSourceType Source
        {
            get => Enum.Parse<AuditSourceType>(SourceRaw, true);
            set => SourceRaw = value.ToString();
        }

        [Column("ip_address")]
        [MaxLength(45)]
        public string? IpAddress { get; set; }

        [Column("user_agent", TypeName = "text")]
        public string? UserAgent { get; set; }

        [Column("correlation_id")]
        [MaxLength(100)]
        public string? CorrelationId { get; set; }

        [Column("session_id")]
        [MaxLength(100)]
        public string? SessionId { get; set; }

        [Column("extra_metadata", TypeName = "text")]
        public string? ExtraMetadata { get; set; }

        [Required]
        [Column("initiated_by_id")]
        [MaxLength(50)]
        public string InitiatedById { get; set; } = string.Empty;

        [ForeignKey("InitiatedById")]
        public User InitiatedBy { get; set; } = null!;

        [Required]
        [Column("initiated_at")]
        public DateTime InitiatedAt { get; set; } = DateTime.UtcNow;
    }


    [Table("audit_revert_history")]
    public class AuditRevertHistory
    {
        [Key]
        [Column("id")]
        [MaxLength(50)]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [Column("audit_log_id")]
        [MaxLength(50)]
        public string AuditLogId { get; set; } = string.Empty;

        [ForeignKey("AuditLogId")]
        public AuditLog AuditLog { get; set; } = null!;

        [Column("snapshot_before_revert", TypeName = "text")]
        public string? SnapshotBeforeRevert { get; set; }

        [Column("snapshot_after_revert", TypeName = "text")]
        public string? SnapshotAfterRevert { get; set; }

        [Column("revert_note", TypeName = "text")]
        public string? RevertNote { get; set; }

        [Required]
        [Column("reverted_by_id")]
        [MaxLength(50)]
        public string RevertedById { get; set; } = string.Empty;

        [ForeignKey("RevertedById")]
        public User RevertedBy { get; set; } = null!;

        [Required]
        [Column("reverted_at")]
        public DateTime RevertedAt { get; set; } = DateTime.UtcNow;
    }
}