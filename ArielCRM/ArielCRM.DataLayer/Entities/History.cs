using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ArielCRM.DataLayer.Entities
{
    public enum CRMActionType
    {
        Create,
        Update,
        Delete
    }

    public enum CRMRevertType
    {
        None,
        Delete,
        Update,
        Create
    }

    [Table("crm_history")]
    public class CRMHistory
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

        [Required]
        [Column("title", TypeName = "text")]
        public string Title { get; set; } = string.Empty;

        [Required]
        [Column("action_type")]
        [MaxLength(20)]
        public string ActionTypeRaw { get; set; } = CRMActionType.Create.ToString();

        [NotMapped]
        public CRMActionType ActionType
        {
            get => Enum.Parse<CRMActionType>(ActionTypeRaw, ignoreCase: true);
            set => ActionTypeRaw = value.ToString();
        }

        [Required]
        [Column("revert_type")]
        [MaxLength(20)]
        public string RevertTypeRaw { get; set; } = CRMRevertType.None.ToString();

        [NotMapped]
        public CRMRevertType RevertType
        {
            get => Enum.Parse<CRMRevertType>(RevertTypeRaw, ignoreCase: true);
            set => RevertTypeRaw = value.ToString();
        }

        [Column("modified_data", TypeName = "text")]
        public string? ModifiedData { get; set; }

        [Required]
        [Column("initiated_at")]
        public DateTime InitiatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [Column("initiated_by_id")]
        [MaxLength(50)]
        public string InitiatedById { get; set; } = string.Empty;

        [ForeignKey("InitiatedById")]
        public User InitiatedBy { get; set; } = null!;

        [Column("previous_state", TypeName = "text")]
        public string? PreviousState { get; set; }

        [Column("updated_state", TypeName = "text")]
        public string? UpdatedState { get; set; }
    }
}