using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Infrastructure.Interfaces.IRepository
{
    public interface IMeetingRepository
    {
        Task<IEnumerable<MeetingResDto>> GetAllAsync();
        Task<MeetingResDto> CreateAsync(Meeting meeting);
        Task<bool> DeleteAsync(string id);
    }
}