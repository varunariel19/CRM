using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class MeetingService : IMeetingService
    {
        private readonly IMeetingRepository _repository;
        private readonly IHistoryService _historyService;

        public MeetingService(IMeetingRepository repository, IHistoryService historyService)
        {
            _repository = repository;
            _historyService = historyService;
        }

        public async Task<IEnumerable<MeetingResDto>> GetAllMeetingsAsync()
        {
            return await _repository.GetAllAsync();
        }

        public async Task<MeetingResDto> ScheduleMeetingAsync(CreateMeetingDto dto)
        {
            var meeting = new Meeting
            {
                Title = dto.Title,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Notes = dto.Notes,
                LeadId = dto.LeadId
            };

            var created = await _repository.CreateAsync(meeting);

            await _historyService.LogAsync(new LogHistoryRequest
            {
                EntityName = "Meeting",
                EntityId = meeting.Id,
                ActionType = CRMActionType.Create,
                Title = $"Created meeting '{meeting.Title}'",
                PreviousState = null,
                UpdatedState = JsonSerializer.Serialize(meeting)
            });

            return created;
        }

        public async Task<bool> DeleteMeetingAsync(string id)
        {
            var meeting = await _repository.GetByIdAsync(id);
            if (meeting == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(meeting);

            var result = await _repository.DeleteAsync(id);

            if (result)
            {
                await _historyService.LogAsync(new LogHistoryRequest
                {
                    EntityName = "Meeting",
                    EntityId = id,
                    ActionType = CRMActionType.Delete,
                    Title = $"Deleted meeting '{meeting.Title}'",
                    PreviousState = previousSnapshot,
                    UpdatedState = null
                });
            }

            return result;
        }
    }
}