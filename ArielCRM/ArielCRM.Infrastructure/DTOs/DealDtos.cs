using ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateDealDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Range(0.00, double.MaxValue)]
        public decimal Value { get; set; }

        [Required]
        public DealStage Stage { get; set; }

        [Required]
        public DateOnly CloseDate { get; set; }

        [Required]
        [StringLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ContactId { get; set; }
    }

    public class UpdateDealDto
    {
        [Required]
        [StringLength(150)]
        public string Title { get; set; } = string.Empty;

        [Range(0.00, double.MaxValue)]
        public decimal Value { get; set; }

        [Required]
        public DealStage Stage { get; set; }

        [Required]
        public DateOnly CloseDate { get; set; }

        [Required]
        [StringLength(50)]
        public string AssignedToId { get; set; } = string.Empty;

        [StringLength(50)]
        public string? ContactId { get; set; }
    }

    public class UpdateDealStageDto
    {
        [Required]
        public DealStage Stage { get; set; }
    }
}
