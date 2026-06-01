using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
        public class CrmTaskService(ICrmTaskRepository repo) : ICrmTaskService
        {
            private readonly ICrmTaskRepository _repo = repo;

        public async Task<IEnumerable<CrmTaskDto>> GetAllAsync()
            {
                var tasks = await _repo.GetAllAsync();
                return tasks.Select(MapToDto);
            }

            public async Task<CrmTaskDto> CreateAsync(CreateCrmTaskDto dto)
            {
                var task = new CrmTask
                {
                    Title = dto.Title,
                    Type = dto.Type,
                    DueDate = dto.DueDate,
                    Status = CrmTaskStatus.Pending,
                    AssignedToId = dto.AssignedToId,
                    LeadId = string.IsNullOrWhiteSpace(dto.LeadId) ? null : dto.LeadId,
                    DealId = string.IsNullOrWhiteSpace(dto.DealId) ? null : dto.DealId,
                };

                var created = await _repo.CreateAsync(task);

                var full = await _repo.GetByIdAsync(created.Id);
                return MapToDto(full!);
            }

            public async Task<bool> DeleteAsync(string id)
            {
                return await _repo.DeleteAsync(id);
            }


        public async Task<bool> UpdateTaskStatusAsync(UpdateTaskStatusDto dto)
        {
            var task = await _repo.GetByIdAsync(dto.Id);
            if (task == null)
            {
                return false; 
            }

            task.Status = dto.Status;

            return await _repo.UpdateStatusAsync(task);
        }
        private static CrmTaskDto MapToDto(CrmTask t) => new()
            {
                Id = t.Id,
                Title = t.Title,
                Type = t.Type.ToString(),
                DueDate = t.DueDate.ToString("yyyy-MM-dd"),
                Status = t.Status.ToString(),
                AssignedToId = t.AssignedToId,
                AssignedToName = t.AssignedTo?.Name,
                LeadId = t.LeadId,
                LeadName = t.Lead?.Name,
                DealId = t.DealId,
                DealTitle = t.Deal?.Title,
                CreatedAt = t.CreatedAt,
            };
        }
}
