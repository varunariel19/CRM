using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.DataLayer.Enums.ArielCRM.DataLayer.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ArielCRM.Infrastructure.DTOs
{
    public class CreateLeadDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Company { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public LeadSource Source { get; set; }

        [Required]
        public string AssignedToId { get; set; } = string.Empty;

        public string ProjectTitle { get; set; } = string.Empty;

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ProjectType? ProjectType { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Budget must be greater than zero.")]
        public decimal? Budget { get; set; }

        public DateOnly? DealStartDate { get; set; }

        public DateOnly? DealCloseDate { get; set; } = null;
    }

    public class UpdateLeadDto
    {
        public string? Name { get; set; }
        public string? Company { get; set; }
        public string? ContactId { get; set; }

        [EmailAddress]
        public string? Email { get; set; }
        public string? Phone { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public LeadSource? Source { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public LeadStatus? Status { get; set; }

        public string? AssignedToId { get; set; }

        public string? ProjectTitle { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ProjectType? ProjectType { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Budget must be greater than zero.")]
        public decimal? Budget { get; set; }

        public DateOnly? DealStartDate { get; set; }
        public DateOnly? DealCloseDate { get; set; }

        public string? ProjectLeadId { get; set; }
    }

    public class LeadResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string ContactId { get; set; } = string.Empty;
        public string AssignedToId { get; set; } = string.Empty;
        public string AssignedToName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public ContactDto? CreatedContact { get; set; }

        public List<LeadProjectSummaryDto> Projects { get; set; } = [];
    }

    public class LeadProjectSummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? ProjectType { get; set; }
        public decimal? Budget { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public bool IsListed { get; set; }
        public bool IsActive { get; set; }
        public string? ProjectLeadId { get; set; }
        public string? ProjectLeadName { get; set; }
        public string? Description { get; set; }
        public List<ProjectDocumentDto> Documents { get; set; } = [];
    }
}
