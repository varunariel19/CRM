using System.ComponentModel.DataAnnotations;

namespace ArielCRM.Infrastructure.DTOs
{
    
public class UpdateNameDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
}

public class AddDesignationDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string DepartmentId { get; set; } = string.Empty;
}

public class UpdatePermissionsDto
{
    [Required]
    public List<string> PermissionIds { get; set; } = [];
}

}
