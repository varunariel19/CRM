using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;

namespace ArielCRM.Application.Interfaces
{
    public interface IContactService
    {
        Task<IEnumerable<Contact>> GetAllContactsAsync();
        Task<Contact?> GetContactByIdAsync(string id);
        Task<Contact> CreateContactAsync(CreateContactDto dto);
        Task<Contact?> UpdateContactAsync(string id, UpdateContactDto dto);
        Task<bool> DeleteContactAsync(string id);
    }
}
