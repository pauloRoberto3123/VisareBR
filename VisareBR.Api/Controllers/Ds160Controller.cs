using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class Ds160Controller : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public Ds160Controller(ApplicationDbContext context)
    {
        _context = context;
    }

    // Public: Submit a new DS-160 Form
    [HttpPost]
    public async Task<IActionResult> SubmitForm(Ds160Submission dto)
    {
        if (dto == null) return BadRequest("Data is required.");

        // The frontend sends data matching the entity structure.
        // The PassportNumber will be automatically encrypted when saved to the database 
        // because of the ValueConverter we configured in ApplicationDbContext.
        
        dto.CreatedAt = DateTime.UtcNow;
        
        _context.Ds160Submissions.Add(dto);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Formulário recebido e criptografado com segurança." });
    }

    // Admin only: Get all received forms
    [Authorize]
    [HttpGet("admin")]
    public async Task<ActionResult<IEnumerable<Ds160Submission>>> GetAllSubmissions()
    {
        // The PassportNumber will be automatically decrypted when read from the database.
        var submissions = await _context.Ds160Submissions
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
            
        return Ok(submissions);
    }
}