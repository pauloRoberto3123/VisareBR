using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
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
    public async Task<IActionResult> SubmitForm([FromBody] JsonElement data)
    {
        if (data.ValueKind == JsonValueKind.Undefined || data.ValueKind == JsonValueKind.Null) 
            return BadRequest("Data is required.");

        // We extract a few key properties to store in standard columns for easy sorting/listing in the Admin Dashboard.
        // The raw JSON is safely dumped into PostgreSQL's native JSONB column.
        var submission = new Ds160Submission
        {
            ApplicantName = data.GetProperty("step1").GetProperty("fullName").GetString() ?? "Desconhecido",
            Email = data.GetProperty("step2").GetProperty("primaryEmail").GetString() ?? "Sem Email",
            PassportNumber = data.GetProperty("step3").GetProperty("passportNumber").GetString() ?? "",
            JsonData = data.GetRawText(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Ds160Submissions.Add(submission);
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