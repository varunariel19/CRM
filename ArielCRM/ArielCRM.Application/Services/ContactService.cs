using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class ContactService(IContactRepository contactRepository, IHistoryService historyService) : IContactService
    {
        private readonly IContactRepository _contactRepository = contactRepository;
        private readonly IHistoryService _historyService = historyService;

        public async Task<IEnumerable<Contact>> GetAllContactsAsync()
        {
            return await _contactRepository.GetAllAsync();
        }

        public async Task<Contact?> GetContactByIdAsync(string id)
        {
            return await _contactRepository.GetByIdAsync(id);
        }

        public async Task<Contact> CreateContactAsync(CreateContactDto dto)
        {
            var contact = new Contact
            {
                Name = dto.Name,
                Company = dto.Company,
                Designation = dto.Designation,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };


            await _contactRepository.AddAsync(contact);
            await _contactRepository.SaveChangesAsync();


            return contact;
        }

        public async Task<Contact?> UpdateContactAsync(string id, UpdateContactDto dto)
        {
            var contact = await _contactRepository.GetByIdAsync(id);
            if (contact == null) return null;

            var previousSnapshot = JsonSerializer.Serialize(contact);

            contact.Name = dto.Name;
            contact.Company = dto.Company;
            contact.Designation = dto.Designation;
            contact.Email = dto.Email;
            contact.Phone = dto.Phone;
            contact.Address = dto.Address;

            _contactRepository.Update(contact);
            await _contactRepository.SaveChangesAsync();

            return contact;
        }

        public async Task<bool> DeleteContactAsync(string id)
        {
            var contact = await _contactRepository.GetByIdAsync(id);
            if (contact == null) return false;

            var previousSnapshot = JsonSerializer.Serialize(contact);

            _contactRepository.Delete(contact);
            var result = await _contactRepository.SaveChangesAsync();


            return result;
        }
    }
}