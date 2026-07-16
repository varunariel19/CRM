using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/notes")]
    [Authorize]
    public class NotesController(INoteService service) : ControllerBase
    {
        private readonly INoteService _service = service;

        [HttpGet]
        public async Task<IActionResult> GetNotes(
            [FromQuery] RelatedEntityType relatedTo,
            [FromQuery] string relatedId)
        {
            if (string.IsNullOrWhiteSpace(relatedId))
                return BadRequest("relatedId is required.");

            try
            {
                var notes = await _service.GetNotesAsync(relatedTo, relatedId);
                return Ok(notes);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while retrieving notes.", details = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateNote([FromBody] CreateNoteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Content is required.");

            if (string.IsNullOrWhiteSpace(request.RelatedId))
                return BadRequest("RelatedId is required.");

            if (string.IsNullOrWhiteSpace(request.CreatedById))
                return BadRequest("CreatedBy is required.");

            try
            {
                var note = await _service.CreateNoteAsync(request);
                return CreatedAtAction(nameof(GetNotes), new { relatedTo = request.RelatedTo, relatedId = request.RelatedId }, note);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while creating the note.", details = ex.Message });
            }
        }

        [HttpPost("{id}")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(string id, [FromBody] UpdateNoteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Content is required.");

            try
            {
                var updated = await _service.UpdateNoteAsync(id, request);
                if (updated is null)
                    return NotFound($"Note '{id}' not found.");

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"An error occurred while updating note {id}.", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(string id)
        {
            try
            {
                var deleted = await _service.DeleteNoteAsync(id);
                if (!deleted)
                    return NotFound($"Note '{id}' not found.");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = $"An error occurred while deleting note {id}.", details = ex.Message });
            }
        }
    }
}