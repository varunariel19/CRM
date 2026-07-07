using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.Data;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdminController(AppDbContext db, IConfiguration configuration) : Controller
    {

        private readonly IConfiguration _configuration = configuration;

        private readonly AppDbContext _db = db;


        [HttpPost("seed-admin")]
        public async Task<IActionResult> SeedAdmin([FromQuery] string key, [FromBody] SeedAdminRequestDto dto)
        {
            try
            {
                if (key != _configuration["Seeding:AdminSecretKey"])
                    return Unauthorized(new { message = "Invalid secret key." });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
                if (exists)
                    return Conflict(new { message = "User with this email already exists." });

                var user = new User
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.Name,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    DepartmentId = dto.DepartmentId,
                    DesignationId = dto.DesignationId,
                    AccessLevelId = dto.AccessLevelId,
                    CreatedAt = DateTime.UtcNow
                };

                _db.Users.Add(user);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Admin created successfully.", userId = user.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while seeding admin.", error = ex.Message });
            }
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetPermissions()
        {
            try
            {
                var permissions = await _db.Permissions
                    .Select(p => new { p.Id, p.Code, p.Description })
                    .ToListAsync();

                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching permissions.", error = ex.Message });
            }
        }

        [HttpGet("departments")]
        public async Task<IActionResult> GetDepartments()
        {
            try
            {
                var departments = await _db.Departments
                    .Select(d => new { d.Id, d.Name, d.DepartmentKey })
                    .ToListAsync();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching departments.", error = ex.Message });
            }
        }

        [HttpGet("access-levels")]
        public async Task<IActionResult> GetAccessLevels()
        {
            try
            {
                var accessLevels = await _db.AccessLevels
                    .Include(i => i.Permissions)
                        .ThenInclude(p => p.Permission)
                    .Select(a => new
                    {
                        a.Id,
                        a.Name,
                        a.Access,
                        Permissions = a.Permissions.Select(p => new
                        {
                            p.Permission.Id,
                            p.Permission.Code,
                            p.Permission.Description
                        })
                    })
                    .ToListAsync();

                return Ok(accessLevels);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching access levels.", error = ex.Message });
            }
        }
        [HttpGet("designations")]
        public async Task<IActionResult> GetDesignations()
        {
            try
            {
                var designations = await _db.Designations
                    .Select(d => new { d.Id, d.Name, d.DepartmentId })
                    .ToListAsync();

                return Ok(designations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while fetching designations.", error = ex.Message });
            }
        }



        // UPDATE DEPARTMENT
        [HttpPut("departments/{id}")]
        public async Task<IActionResult> UpdateDepartment(string id, [FromBody] UpdateNameDto dto)
        {
            try
            {
                var dept = await _db.Departments.FindAsync(id);
                if (dept is null) return NotFound(new { message = "Department not found." });

                dept.Name = dto.Name;
                await _db.SaveChangesAsync();

                return Ok(new { message = "Department updated.", id = dept.Id, name = dept.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating department.", error = ex.Message });
            }
        }

        // ADD DEPARTMENT
        [HttpPost("departments")]
        public async Task<IActionResult> AddDepartment([FromBody] UpdateNameDto dto)
        {
            try
            {
                var dept = new Department { Id = Guid.NewGuid().ToString(), Name = dto.Name };
                _db.Departments.Add(dept);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Department created.", id = dept.Id, name = dept.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating department.", error = ex.Message });
            }
        }

        // DELETE DEPARTMENT
        [HttpDelete("departments/{id}")]
        public async Task<IActionResult> DeleteDepartment(string id)
        {
            try
            {
                var dept = await _db.Departments.FindAsync(id);
                if (dept is null) return NotFound(new { message = "Department not found." });

                _db.Departments.Remove(dept);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Department deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting department.", error = ex.Message });
            }
        }

        // UPDATE DESIGNATION
        [HttpPut("designations/{id}")]
        public async Task<IActionResult> UpdateDesignation(string id, [FromBody] UpdateNameDto dto)
        {
            try
            {
                var desig = await _db.Designations.FindAsync(id);
                if (desig is null) return NotFound(new { message = "Designation not found." });

                desig.Name = dto.Name;
                await _db.SaveChangesAsync();

                return Ok(new { message = "Designation updated.", id = desig.Id, name = desig.Name });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating designation.", error = ex.Message });
            }
        }

        // ADD DESIGNATION
        [HttpPost("designations")]
        public async Task<IActionResult> AddDesignation([FromBody] AddDesignationDto dto)
        {
            try
            {
                var desig = new Designation
                {
                    Id = Guid.NewGuid().ToString(),
                    Name = dto.Name,
                    DepartmentId = dto.DepartmentId
                };
                _db.Designations.Add(desig);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Designation created.", id = desig.Id, name = desig.Name, departmentId = desig.DepartmentId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating designation.", error = ex.Message });
            }
        }

        // DELETE DESIGNATION
        [HttpDelete("designations/{id}")]
        public async Task<IActionResult> DeleteDesignation(string id)
        {
            try
            {
                var desig = await _db.Designations.FindAsync(id);
                if (desig is null) return NotFound(new { message = "Designation not found." });

                _db.Designations.Remove(desig);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Designation deleted." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting designation.", error = ex.Message });
            }
        }

        // SAVE ACCESS LEVEL PERMISSIONS
        [HttpPut("access-levels/{id}/permissions")]
        public async Task<IActionResult> UpdateAccessLevelPermissions(string id, [FromBody] UpdatePermissionsDto dto)
        {
            try
            {
                var accessLevel = await _db.AccessLevels
                    .Include(a => a.Permissions)
                    .FirstOrDefaultAsync(a => a.Id == id);

                if (accessLevel is null) return NotFound(new { message = "Access level not found." });

                _db.AccessLevelPermissions.RemoveRange(accessLevel.Permissions);

                var newPermissions = dto.PermissionIds.Select(permId => new AccessLevelPermission
                {
                    Id = Guid.NewGuid().ToString(),
                    AccessLevelId = id,
                    PermissionId = permId
                });

                _db.AccessLevelPermissions.AddRange(newPermissions);
                await _db.SaveChangesAsync();

                return Ok(new { message = "Permissions updated." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating permissions.", error = ex.Message });
            }
        }



    }
}




