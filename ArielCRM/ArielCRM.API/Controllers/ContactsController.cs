using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContactsController(IContactService contactService, ILogger<ContactsController> logger) : ControllerBase
    {
        private readonly IContactService _contactService = contactService;
        private readonly ILogger<ContactsController> _logger = logger;

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var contacts = await _contactService.GetAllContactsAsync();
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all contacts.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // GET api/contacts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var contact = await _contactService.GetContactByIdAsync(id);
                return contact is null ? NotFound() : Ok(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // POST api/contacts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateContactDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var contact = await _contactService.CreateContactAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = contact.Id }, contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a new contact.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // PUT api/contacts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateContactDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var contact = await _contactService.UpdateContactAsync(id, dto);
                return contact is null ? NotFound() : Ok(contact);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // DELETE api/contacts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var deleted = await _contactService.DeleteContactAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}
