using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using ArielCRM.Shared.Utils;

namespace ArielCRM.Application.Services
{

    public class TeamService(
        ITeamRepository repository,
        IEmailService emailService
        // IDepartmentRepository departmentRepository,
        // IDesignationRepository designationRepository
        ) : ITeamService
    {
        private readonly ITeamRepository _repository = repository;
        private readonly IEmailService _emailService = emailService;

        public async Task<TeamMemberDto> CreateAsync(CreateTeamDto dto)
        {
            if (await _repository.GetByEmailAsync(dto.Email) != null)
                throw new Exception("Email already exists.");

            // var department = await _departmentRepository.GetByNameAsync(dto.Department)
            //     ?? throw new Exception("Department not found.");

            // var designation = await _designationRepository.GetByNameAsync(dto.Designation)
            //     ?? throw new Exception("Designation not found.");

            string generatedPass = Utils.GeneratePassword();

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(generatedPass),
                DepartmentId = dto.DepartmentId,
                DesignationId = dto.DesignationId,
                AccessLevelId = dto.AccessLevelId,
                CreatedAt = DateTime.UtcNow
            };


            await _repository.AddAsync(user);
            await _emailService.SendWelcomeEmailAsync(dto.Email, dto.Name, generatedPass);

            return new TeamMemberDto
            {
                Id = user.Id,
                ProfileImage = user.ProfileImage,
                Name = user.Name,
                Email = user.Email,
                DepartmentId = dto.DepartmentId,
                DesignationId = dto.DesignationId,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<TeamMemberDto?> UpdateAsync(string id, UpdateTeamDto dto)
        {
            var user = await _repository.GetByIdAsync(id);

            if (user == null)
                return null;

            // var department = await _departmentRepository.GetByNameAsync(dto.Department)
            //     ?? throw new Exception("Department not found.");

            // var designation = await _designationRepository.GetByNameAsync(dto.Designation)
            //     ?? throw new Exception("Designation not found.");

            user.Name = dto.Name;
            user.Email = dto.Email;
            user.ProfileImage = dto.ProfileImage;
            user.DepartmentId = dto.DepartmentId;
            user.DesignationId = dto.DesignationId;

            await _repository.UpdateAsync(user);

            return new TeamMemberDto
            {
                Id = user.Id,
                ProfileImage = user.ProfileImage,
                Name = user.Name,
                Email = user.Email,
                DepartmentId = dto.DepartmentId,
                DesignationId = dto.DesignationId,
                CreatedAt = user.CreatedAt
            };
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var user = await _repository.GetByIdAsync(id);

            if (user == null)
                return false;

            await _repository.DeleteAsync(user);

            return true;
        }

        public async Task<List<TeamMemberDto>> GetAllAsync()
        {
            var users = await _repository.GetAllAsync();

            return [.. users.Select(x => new TeamMemberDto
            {
                Id = x.Id,
                ProfileImage = x.ProfileImage,
                Name = x.Name,
                Email = x.Email,
                Access = x.AccessLevel.Access,
                DepartmentId = x.DepartmentId,
                DesignationId = x.DesignationId,
                CreatedAt = x.CreatedAt
            })];
        }
    }

}