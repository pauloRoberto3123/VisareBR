using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EvaluationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public class EvaluationCreateDto
    {
        public string UserName { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public int Rating { get; set; }
    }

    public EvaluationsController(ApplicationDbContext context)
    {
        _context = context;
    }

    // Public: Get all approved evaluations
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Evaluation>>> GetEvaluations()
    {
        return await _context.Evaluations
            .Where(e => e.IsApproved)
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    // Public: Submit a new evaluation (requires approval)
    [HttpPost]
    public async Task<ActionResult<Evaluation>> PostEvaluation(EvaluationCreateDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5) return BadRequest("Rating must be between 1 and 5.");

        var evaluation = new Evaluation
        {
            UserName = dto.UserName,
            Comment = dto.Comment,
            Rating = dto.Rating,
            CreatedAt = DateTime.UtcNow,
            IsApproved = false // Set to false by default
        };

        _context.Evaluations.Add(evaluation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetEvaluations), new { id = evaluation.Id }, evaluation);
    }

    // Admin only: Get all evaluations (including pending)
    [Authorize]
    [HttpGet("admin")]
    public async Task<ActionResult<IEnumerable<Evaluation>>> GetAllEvaluations()
    {
        return await _context.Evaluations
            .OrderByDescending(e => e.CreatedAt)
            .ToListAsync();
    }

    // Admin only: Approve/Reject an evaluation
    [Authorize]
    [HttpPut("{id}/approve")]
    public async Task<IActionResult> ApproveEvaluation(int id, [FromQuery] bool approve = true)
    {
        var evaluation = await _context.Evaluations.FindAsync(id);
        if (evaluation == null) return NotFound();

        evaluation.IsApproved = approve;
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
