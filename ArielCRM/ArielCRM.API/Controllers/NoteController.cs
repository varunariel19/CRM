using ArielCRM.Application.Interfaces;
using ArielCRM.DataLayer.Enums;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/notes")]
    public class NotesController(INoteService service) : ControllerBase
    {
        private readonly INoteService _service = service;

        // GET api/notes?relatedTo=Contact&relatedId=abc123
        [HttpGet]
        public async Task<IActionResult> GetNotes(
            [FromQuery] RelatedEntityType relatedTo,
            [FromQuery] string relatedId)
        {
            if (string.IsNullOrWhiteSpace(relatedId))
                return BadRequest("relatedId is required.");

            var notes = await _service.GetNotesAsync(relatedTo, relatedId);
            return Ok(notes);
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

            var note = await _service.CreateNoteAsync(request);
            return CreatedAtAction(nameof(GetNotes), new { relatedTo = request.RelatedTo, relatedId = request.RelatedId }, note);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNote(string id, [FromBody] UpdateNoteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Content))
                return BadRequest("Content is required.");

            var updated = await _service.UpdateNoteAsync(id, request);
            if (updated is null)
                return NotFound($"Note '{id}' not found.");

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNote(string id)
        {
            var deleted = await _service.DeleteNoteAsync(id);
            if (!deleted)
                return NotFound($"Note '{id}' not found.");

            return NoContent();
        }
    }
}