using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{

    public class TaskManagementService(ITaskManagementRepository repository) : ITaskManagementService
    {
        private readonly ITaskManagementRepository _repository = repository;

        public async Task<IEnumerable<TaskDetailDto>> GetAllAsync()
        {
            var tasks = await _repository.GetAllAsync();

            return tasks.Select(MapToDto);
        }

        public async Task<TaskDetailDto?> GetByIdAsync(string taskId)
        {
            var task = await _repository.GetByIdAsync(taskId);

            return task == null ? null : MapToDto(task);
        }

        public async Task<string> CreateAsync(CreateTaskDto dto, string reportedById)
        {
            var task = new TicketTask
            {
                TaskId = await GenerateUniqueTaskIdAsync(),
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority.ToString(),
                Type = dto.Type.ToString(),
                AssignToId = dto.AssignToId,
                ProjectId = dto.ProjectId,
                TicketId = dto.TicketId,
                ReportedById = reportedById,
                Status = TasksStatus.TODO.ToString()
            };

            await _repository.CreateAsync(task);

            return task.TaskId;
        }

        private async Task<string> GenerateUniqueTaskIdAsync()
        {
            const int maxAttempts = 20;

            for (var attempt = 0; attempt < maxAttempts; attempt++)
            {
                var taskId = TicketTask.GenerateFiveDigitTaskId();
                if (await _repository.GetByIdAsync(taskId) is null)
                    return taskId;
            }

            throw new InvalidOperationException("Unable to generate a unique task ID.");
        }

        public async Task<bool> UpdateAsync(string taskId, UpdateTaskDto dto)
        {
            var task = await _repository.GetByIdAsync(taskId);

            if (task == null)
                return false;

            if (dto.Title is not null)
                task.Title = dto.Title;

            if (dto.Description is not null)
                task.Description = dto.Description;

            if (dto.Priority.HasValue)
                task.Priority = dto.Priority.Value.ToString();

            if (dto.Type.HasValue)
                task.Type = dto.Type.Value.ToString();

            if (dto.Status.HasValue)
                task.Status = dto.Status.Value.ToString();

            if (dto.AssignToId is not null)
                task.AssignToId = dto.AssignToId;

            task.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(task);

            return true;
        }
        public async Task<bool> DeleteAsync(string taskId)
        {
            var task = await _repository.GetByIdAsync(taskId);

            if (task == null)
                return false;

            await _repository.DeleteAsync(task);

            return true;
        }

        private static TaskDetailDto MapToDto(TicketTask task)
        {
            return new TaskDetailDto
            {
                TaskId = task.TaskId,
                TicketId = task.TicketId,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority,
                Type = task.Type,
                Status = task.Status,
                Assignee =  new UserSummaryDto
                {
                    Id = task.AssignToId!,
                    Name = task.AssignedUser?.Name ?? "",
                    ProfileImage = task.AssignedUser?.ProfileImage,
                },
                Reporter = new UserSummaryDto
                {
                    Id  = task.ReportedById,
                    Name = task.ReportedUser?.Name ?? "",
                    ProfileImage = task.ReportedUser?.ProfileImage,
                },
                ProjectId = task.ProjectId,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
        }
    }
}
