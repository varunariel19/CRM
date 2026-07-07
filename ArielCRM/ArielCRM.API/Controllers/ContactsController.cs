using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ContactsController(IContactService contactService, ILogger<ContactsController> logger) : ControllerBase
    {
        // GET: api/contacts
        [HttpGet]
        [Authorize(Policy = "Permission:Customers.View")]
        public async Task<IActionResult> GetContacts()
        {
            try
            {
                var contacts = await contactService.GetAllContactsAsync(HttpContext);
                return Ok(contacts);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching all contacts.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // GET: api/contacts/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContactById(string id)
        {
            try
            {
                var contact = await contactService.GetContactByIdAsync(id);
                return contact is null ? NotFound() : Ok(contact);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while fetching contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // POST: api/contacts
        [HttpPost]
        public async Task<IActionResult> CreateContact([FromBody] CreateContactDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var contact = await contactService.CreateContactAsync(dto);

                return CreatedAtAction(nameof(GetContactById), new { id = contact.Id }, contact);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while creating a new contact.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // PUT: api/contacts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateContact(string id, [FromBody] UpdateContactDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var contact = await contactService.UpdateContactAsync(id, dto);
                return contact is null ? NotFound() : Ok(contact);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while updating contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // DELETE: api/contacts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContact(string id)
        {
            try
            {
                var deleted = await contactService.DeleteContactAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while deleting contact with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}