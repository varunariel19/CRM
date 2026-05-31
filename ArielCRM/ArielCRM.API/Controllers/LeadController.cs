using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeadsController(ILeadService leadService, ILogger<LeadsController> logger) : ControllerBase
    {
        private readonly ILeadService _leadService = leadService;
        private readonly ILogger<LeadsController> _logger = logger;

        // GET api/leads
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var leads = await _leadService.GetAllLeadsAsync();
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
        public async Task<IActionResult> Search([FromQuery] string q)
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
        public async Task<IActionResult> GetById(string id)
        {
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
        public async Task<IActionResult> Create([FromBody] CreateLeadDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var lead = await _leadService.CreateLeadAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = lead.Id }, lead);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a new lead.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }

        // PUT api/leads/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> HandleUpdateLeadData(string id, [FromBody] UpdateLeadDto dto)
        {
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
        public async Task<IActionResult> Delete(string id)
        {
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