using System.Security.Claims;
using ArielCRM.Application.Hubs;
using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Entities;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/leads")]
    public class LeadsController(ILeadService leadService, ILogger<LeadsController> logger, IHubContext<TeamsHub> hubContext, INotificationService notificationService) : ControllerBase
    {
        private readonly ILeadService _leadService = leadService;
        private readonly ILogger<LeadsController> _logger = logger;

        private readonly INotificationService _notificationService = notificationService;

        private readonly IHubContext<TeamsHub> _hub = hubContext;

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

        [HttpPost]
        public async Task<IActionResult> CreateLeadAsync([FromBody] CreateLeadDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var lead = await _leadService.CreateLeadAsync(dto);
                if (lead == null) return BadRequest("Lead Doesn't Exists !");

                if (!string.IsNullOrEmpty(lead.AssignedToId))
                {
                    try
                    {
                        await _notificationService.CreateAsync(new CreateNotificationDto
                        {
                            UserIds = [lead.AssignedToId],
                            Title = "New lead assigned to you",
                            Message = $"\"{lead.Name}\" from {lead.Company} was assigned to you",
                            EntityType = "Lead",
                            EntityId = lead.Id,
                            Link = "leads"
                        });
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogError(notifyEx, "Failed to send assignment notification for lead {LeadId}", lead.Id);
                    }
                }

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
                var existingLead = await _leadService.GetLeadByIdAsync(id);
                var previousStatus = existingLead?.Status;
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

                var lead = await _leadService.UpdateLeadAsync(id, dto);
                bool isStatusUpdated = false;
                if (lead is null) return NotFound();

                if (!string.Equals(previousStatus, lead.Status, StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        await _hub.Clients.All.SendAsync("LeadStatusChanged", id, lead.Status);

                        if (string.Equals(lead.Status, "Converted", StringComparison.OrdinalIgnoreCase))
                        {
                            await _hub.Clients.All.SendAsync("LeadConverted", id, lead.Status);
                        }
                    }
                    catch (Exception hubEx)
                    {
                        _logger.LogError(hubEx, "Failed to broadcast status change via SignalR for lead {LeadId}", id);
                    }

                    try
                    {
                        isStatusUpdated = true;
                        await _notificationService.CreateAsync(new CreateNotificationDto
                        {
                            UserIds = [userId == lead.AssignedToId ? "fb66c485-4219-4ed8-a443-bf4b5f09276e" : lead.AssignedToId],
                            Title = "Lead status changed !",
                            Message = $"\"{lead.Name}\" from {lead.Company} status change from {previousStatus} to {lead.Status} !",
                            EntityType = "Lead",
                            EntityId = lead.Id,
                            Link = "leads"
                        });
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogError(notifyEx, "Failed to send status-change notification for lead {LeadId}", id);
                    }
                }


                if (!isStatusUpdated)
                {
                    try
                    {
                        await _notificationService.CreateAsync(new CreateNotificationDto
                        {
                            UserIds = [userId == lead.AssignedToId ? "fb66c485-4219-4ed8-a443-bf4b5f09276e" : lead.AssignedToId],
                            Title = "Lead Updated !",
                            Message = $"\"Updated lead {lead.Name}!",
                            EntityType = "Lead",
                            EntityId = lead.Id,
                            Link = "leads"
                        });
                    }
                    catch (Exception notifyEx)
                    {
                        _logger.LogError(notifyEx, "Failed to send status-change notification for lead {LeadId}", id);
                    }
                }
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