using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DealsController(IDealService dealService, ILogger<DealsController> logger) : ControllerBase
    {
        private readonly IDealService _dealService = dealService;
        private readonly ILogger<DealsController> _logger = logger;

        // GET api/deals
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var deals = await _dealService.GetAllDealsAsync();
                return Ok(deals);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching all deals.");
                return StatusCode(500, "Internal server error.");
            }
        }

        // GET api/deals/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var deal = await _dealService.GetDealByIdAsync(id);
                return deal is null ? NotFound() : Ok(deal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching deal {Id}.", id);
                return StatusCode(500, "Internal server error.");
            }
        }

        // POST api/deals
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateDealDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var deal = await _dealService.CreateDealAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = deal.Id }, deal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating a deal.");
                return StatusCode(500, "Internal server error.");
            }
        }

        // PUT api/deals/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateDealDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var deal = await _dealService.UpdateDealAsync(id, dto);
                return deal is null ? NotFound() : Ok(deal);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while updating deal {Id}.", id);
                return StatusCode(500, "Internal server error.");
            }
        }

        // PATCH api/deals/{id}/stage (Optimized for drag-and-drop or arrow shift)
        [HttpPatch("{id}/stage")]
        public async Task<IActionResult> UpdateStage(string id, [FromBody] UpdateDealStageDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            try
            {
                var success = await _dealService.UpdateDealStageAsync(id, dto.Stage);
                return success ? NoContent() : NotFound();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while moving stage for deal {Id}.", id);
                return StatusCode(500, "Internal server error.");
            }
        }
    }
}
