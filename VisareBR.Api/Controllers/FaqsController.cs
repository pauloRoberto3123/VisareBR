using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaqsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public FaqsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FaqItem>>> GetFaqs()
    {
        var faqs = await _context.Faqs
            .Where(f => f.IsActive)
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync();
        return Ok(faqs);
    }

    [Authorize]
    [HttpGet("admin-all")]
    public async Task<ActionResult<IEnumerable<FaqItem>>> GetAllFaqsAdmin()
    {
        var faqs = await _context.Faqs
            .OrderBy(f => f.DisplayOrder)
            .ToListAsync();
        return Ok(faqs);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<FaqItem>> CreateFaq([FromBody] FaqItem faq)
    {
        _context.Faqs.Add(faq);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetFaqs), new { id = faq.Id }, faq);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFaq(int id, [FromBody] FaqItem updatedFaq)
    {
        if (id != updatedFaq.Id) return BadRequest("ID da dúvida não coincide.");

        var faq = await _context.Faqs.FindAsync(id);
        if (faq == null) return NotFound();

        faq.Question = updatedFaq.Question;
        faq.Answer = updatedFaq.Answer;
        faq.DisplayOrder = updatedFaq.DisplayOrder;
        faq.IsActive = updatedFaq.IsActive;
        faq.Category = updatedFaq.Category;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFaq(int id)
    {
        var faq = await _context.Faqs.FindAsync(id);
        if (faq == null) return NotFound();

        _context.Faqs.Remove(faq);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
