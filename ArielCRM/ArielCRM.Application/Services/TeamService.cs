using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using ArielCRM.Infrastructure.Interfaces.IService;
using ArielCRM.Infrastructure.Services;
using ArielCRM.Shared.Utils;

namespace ArielCRM.Application.Services
{

    public class TeamService(
        ITeamRepository repository,
        IEmailService emailService,
         CredentialFileLogger credentialFileLogger,
         IAppwriteStorageService storageService

        ) : ITeamService
    {
        private readonly ITeamRepository _repository = repository;
        private readonly IEmailService _emailService = emailService;
        private readonly IAppwriteStorageService _storageService = storageService;


        private readonly CredentialFileLogger _credentialFileLogger = credentialFileLogger;


        public async Task<TeamMemberDto> CreateAsync(CreateTeamDto dto)
        {
            if (await _repository.GetByEmailAsync(dto.Email) != null)
                throw new Exception("Email already exists.");

            string generatedPass = Utils.GeneratePassword();

            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                EmployeeId = dto.EmployeeId,
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(generatedPass),
                DepartmentId = dto.DepartmentId,
                DesignationId = dto.DesignationId,
                AccessLevelId = dto.AccessLevelId,
                CreatedAt = DateTime.UtcNow
            };

            if (dto.ProfileImage is not null && dto.ProfileImage.Length > 0)
            {
                if (!dto.ProfileImage.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    throw new Exception("Only image files are allowed.");

                var upload = await _storageService.UploadFileAsync(dto.ProfileImage);
                user.ProfileImage = upload.FileUrl;
            }

            await _repository.AddAsync(user);

            // Append email + generated password to JSON file
            await _credentialFileLogger.AppendAsync(new CredentialLogEntry
            {
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Password = generatedPass,
                CreatedAt = user.CreatedAt
            });

            // await _emailService.SendWelcomeEmailAsync(dto.Email, dto.Name, generatedPass);

            return new TeamMemberDto
            {
                Id = user.Id,
                EmployeeId = user.EmployeeId,
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

            if (!string.IsNullOrWhiteSpace(dto.Name))
                user.Name = dto.Name;

            if (!string.IsNullOrWhiteSpace(dto.Email))
                user.Email = dto.Email;

            if (!string.IsNullOrWhiteSpace(dto.DepartmentId))
                user.DepartmentId = dto.DepartmentId;

            if (!string.IsNullOrWhiteSpace(dto.DesignationId))
                user.DesignationId = dto.DesignationId;

            if (!string.IsNullOrWhiteSpace(dto.AccessLevelId))
                user.AccessLevelId = dto.AccessLevelId;

            if (dto.ProfileImage is not null && dto.ProfileImage.Length > 0)
            {
                if (!dto.ProfileImage.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
                    throw new Exception("Only image files are allowed.");

                if (!string.IsNullOrWhiteSpace(user.ProfileImage))
                {
                    await _storageService.DeleteFileAsync(user.ProfileImage);
                }

                var upload = await _storageService.UploadFileAsync(dto.ProfileImage);
                user.ProfileImage = upload.FileUrl;
            }
            else if (dto.RemoveProfileImage)
            {
                if (!string.IsNullOrWhiteSpace(user.ProfileImage))
                {
                    await _storageService.DeleteFileAsync(user.ProfileImage);
                }
                user.ProfileImage = "";
            }

            await _repository.UpdateAsync(user);

            return new TeamMemberDto
            {
                Id = user.Id,
                EmployeeId = user.EmployeeId,
                ProfileImage = user.ProfileImage,
                Name = user.Name,
                Email = user.Email,
                DepartmentId = user.DepartmentId,
                DesignationId = user.DesignationId,
                AccessLevelId = user.AccessLevelId,
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
                EmployeeId = x.EmployeeId,
                ProfileImage = x.ProfileImage,
                Name = x.Name,
                AccessLevelId = x.AccessLevelId,
                PublicKey = x.EncryptionKey?.PublicKey,
                Email = x.Email,
                Access = x.AccessLevel.Access,
                DepartmentId = x.DepartmentId,
                DesignationId = x.DesignationId,
                CreatedAt = x.CreatedAt
            })];
        }
    }

}
