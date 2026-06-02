using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface IMeetingService
    {
        Task<IEnumerable<MeetingResDto>> GetAllMeetingsAsync();
        Task<MeetingResDto> ScheduleMeetingAsync(CreateMeetingDto dto);
        Task<bool> DeleteMeetingAsync(string id);
    }
}
