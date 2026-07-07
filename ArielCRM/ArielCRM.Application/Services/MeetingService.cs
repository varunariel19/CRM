using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class MeetingService(IMeetingRepository repository, IHistoryService historyService) : IMeetingService
    {
        private readonly IMeetingRepository _repository = repository;
        private readonly IHistoryService _historyService = historyService;

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

            return created;
        }

        public async Task<bool> DeleteMeetingAsync(string id)
        {
            var meeting = await _repository.GetByIdAsync(id);
            if (meeting == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(meeting);

            var result = await _repository.DeleteAsync(id);


            return result;
        }
    }
}