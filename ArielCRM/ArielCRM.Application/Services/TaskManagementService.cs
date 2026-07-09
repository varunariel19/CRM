using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{

    public class TaskManagementService(ITaskManagementRepository repository,
    ITicketHistoryRepository ticketHistory, IUserRepository userRepo) : ITaskManagementService
    {
        private readonly ITaskManagementRepository _repository = repository;
        private readonly IUserRepository _userRepo = userRepo;

        private readonly ITicketHistoryRepository _ticketHRepo = ticketHistory;

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

        public async Task<TaskDetailDto> CreateAsync(CreateTaskDto dto, string reportedById)
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

            var created = await _repository.GetByIdAsync(task.TaskId)
                ?? task;

            return MapToDto(created);
        }



        public async Task<bool> UpdateAsync(string taskId, UpdateTaskDto dto, string committedById)
        {
            var task = await _repository.GetByIdAsync(taskId);

            if (task == null)
                return false;

            var changes = new List<(string Field, string OldValue, string NewValue)>();

            if (dto.Title is not null && dto.Title != task.Title)
            {
                changes.Add(("Title", task.Title, dto.Title));
                task.Title = dto.Title;
            }

            if (dto.AiSummary is not null)
            {
                task.AiSummary = dto.AiSummary;
            }

            if (dto.Description is not null && dto.Description != task.Description)
            {
                changes.Add(("Description", task.Description, dto.Description));
                task.Description = dto.Description;
            }

            if (dto.Priority.HasValue && dto.Priority.Value.ToString() != task.Priority)
            {
                changes.Add(("Priority", task.Priority, dto.Priority.Value.ToString()));
                task.Priority = dto.Priority.Value.ToString();
            }

            if (dto.Type.HasValue && dto.Type.Value.ToString() != task.Type)
            {
                changes.Add(("Type", task.Type, dto.Type.Value.ToString()));
                task.Type = dto.Type.Value.ToString();
            }

            if (dto.Status.HasValue && dto.Status.Value.ToString() != task.Status)
            {
                changes.Add(("Status", task.Status, dto.Status.Value.ToString()));
                task.Status = dto.Status.Value.ToString();
            }

            if (dto.AssignToId is not null && dto.AssignToId != task.AssignToId)
            {
                var oldName = task.AssignedUser?.Name ?? task.AssignToId ?? "Unassigned";
                var user = await _userRepo.GetByIdAsync(dto.AssignToId);
                changes.Add(("Assignee", oldName, user?.Name ?? "UnAssigneed"));
                task.AssignToId = dto.AssignToId;
            }

            task.UpdatedAt = DateTime.UtcNow;

            if (changes.Count == 1)
            {
                var (field, oldVal, newVal) = changes.First();

                await _ticketHRepo.CreateAsync(new TicketHistory
                {
                    TicketId = task.TaskId,
                    Title = GetHistoryTitle(field),
                    Content = BuildPillHtml(field, oldVal, newVal),
                    CommitedById = committedById,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (changes.Count > 1)
            {
                var rows = changes
                    .Select(c => $"<li>{BuildPillHtml(c.Field, c.OldValue, c.NewValue)}</li>")
                    .Aggregate((a, b) => a + b);

                await _ticketHRepo.CreateAsync(new TicketHistory
                {
                    TicketId = task.TaskId,
                    Title = "Bulk update",
                    Content = $"<ul class=\"history-change-list\">{rows}</ul>",
                    CommitedById = committedById,
                    CreatedAt = DateTime.UtcNow
                });
            }

            await _repository.UpdateAsync(task);
            return true;
        }

        private static string GetHistoryTitle(string field) => field switch
        {
            "Status" => "Status changed",
            "Priority" => "Priority changed",
            "Type" => "Type changed",
            "Assignee" => "Assignee changed",
            "Title" => "Title updated",
            "Description" => "Description updated",
            _ => $"{field} changed"
        };

        private static string BuildPillHtml(string field, string oldVal, string newVal)
        {
            if (field == "Description" || field == "Title")
                return $"<span class=\"history-text-change\">{oldVal} → {newVal}</span>";

            // Pill-style for Status / Priority / Type / Assignee
            var category = field.ToLower(); // used as CSS modifier: pill-status, pill-priority, etc.
            return
                $"<span class=\"from-pill old\">{oldVal}</span>" +
                $"<span class=\"arrow\">→</span>" +
                $"<span class=\"from-pill new {category}\">{newVal}</span>";
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
                AiSummary = task.AiSummary ?? [],
                Status = task.Status,
                Assignee = new UserSummaryDto
                {
                    Id = task.AssignToId!,
                    Name = task.AssignedUser?.Name ?? "",
                    ProfileImage = task.AssignedUser?.ProfileImage,
                },
                Reporter = new UserSummaryDto
                {
                    Id = task.ReportedById,
                    Name = task.ReportedUser?.Name ?? "",
                    ProfileImage = task.ReportedUser?.ProfileImage,
                },
                ProjectId = task.ProjectId,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt
            };
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

    }
}
