using System.Security.Claims;
using ArielCRM.Application.Interfaces;
using ArielCRM.Infrastructure.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ArielCRM.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommentsController(ICommentService commentService) : ControllerBase
    {
        private readonly ICommentService _commentService = commentService;

        // GET api/comments/ticket/{ticketId}
        [HttpGet("ticket/{ticketId}")]
        [ProducesResponseType(typeof(IEnumerable<CommentResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCommentsByTicketId(string ticketId)
        {
            var comments = await _commentService.GetCommentsByTicketIdAsync(ticketId);
            return Ok(comments);
        }

        // POST api/comments
        [HttpPost]
        [ProducesResponseType(typeof(CommentResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddComment([FromBody] CreateCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            var result = await _commentService.AddCommentAsync(userId, dto);
            return CreatedAtAction(nameof(AddComment), new { id = result.Id }, result);
        }

        // PUT api/comments/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(CommentResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> EditComment(string id, [FromBody] EditCommentDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;

            try
            {
                var result = await _commentService.EditCommentAsync(id, userId, dto);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}