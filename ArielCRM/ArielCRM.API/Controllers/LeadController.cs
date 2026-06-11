using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/leads")]
    public class LeadsController(ILeadService leadService, ILogger<LeadsController> logger) : ControllerBase
    {
        private readonly ILeadService _leadService = leadService;
        private readonly ILogger<LeadsController> _logger = logger;

        // GET api/leads
        [HttpGet]
        [Authorize(Policy = "Permission:Leads.View")]
        public async Task<IActionResult> GetAllLeadsAsync()
        {
            try
            {
                var leads = await _leadService.GetAllLeadsAsync(HttpContext);
                return Ok(leads);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all leads.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // GET api/leads/search?q=john
        [HttpGet("search")]
        public async Task<IActionResult> SearchLeadsAsync([FromQuery] string q)
        {
            if (string.IsNullOrWhiteSpace(q))
                return BadRequest("Search query is required.");

            try
            {
                var results = await _leadService.SearchLeadsAsync(q);
                return Ok(results);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while searching for leads with query: {Query}", q);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // GET api/leads/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLeadByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Lead is required.");
            try
            {
                var lead = await _leadService.GetLeadByIdAsync(id);
                return lead is null ? NotFound() : Ok(lead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching lead with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // POST api/leads
        [HttpPost]
        public async Task<IActionResult> CreateLeadAsync([FromBody] CreateLeadDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var lead = await _leadService.CreateLeadAsync(dto);
                return Ok(lead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a new lead.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // PUT api/leads/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLeadAsync(string id, [FromBody] UpdateLeadDto dto)
        {
            if (!ModelState.IsValid || string.IsNullOrWhiteSpace(id)) return BadRequest(ModelState);
            try
            {
                var lead = await _leadService.UpdateLeadAsync(id, dto);
                return Ok(lead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating lead with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // DELETE api/leads/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLeadAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id)) return BadRequest("Lead is required.");
            try
            {
                var deleted = await _leadService.DeleteLeadAsync(id);
                return deleted ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while deleting lead with ID: {Id}", id);
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
    }
}