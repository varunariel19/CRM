using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;

namespace ArielCRM.Application.Services
{
    public class MeetingService(IMeetingRepository repository) : IMeetingService
    {
        private readonly IMeetingRepository _repository = repository;

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

            return await _repository.CreateAsync(meeting);
        }

        public async Task<bool> DeleteMeetingAsync(string id)
        {
            return await _repository.DeleteAsync(id);
        }
    }
}
