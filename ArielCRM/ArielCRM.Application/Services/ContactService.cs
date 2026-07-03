using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using ArielCRM.Infrastructure.Interfaces.IRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using System.Text.Json;

namespace ArielCRM.Application.Services
{
    public class ContactService(IContactRepository contactRepository, IHistoryService historyService, IConfiguration configuration) : IContactService
    {
        private readonly IContactRepository _contactRepository = contactRepository;
        private readonly IHistoryService _historyService = historyService;

        private readonly IConfiguration _configuration = configuration;
        public Task<IEnumerable<Contact>> GetAllContactsAsync(HttpContext context)
        {

            if (context.User.Identity is null || !context.User.Identity.IsAuthenticated)
                return Task.FromResult(Enumerable.Empty<Contact>());

            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId is null) return Task.FromResult(Enumerable.Empty<Contact>());

            var adminAccessLvlId = _configuration["Seeding:AdminLevel"];
            var accessLevelId = context.User.FindFirst("AccessLevelId")?.Value;

            if (accessLevelId == adminAccessLvlId)
            {
                return _contactRepository.GetAllAsync();
            }

            // based on lead id
            return _contactRepository.GetAllByAssigneeAsync(userId);
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