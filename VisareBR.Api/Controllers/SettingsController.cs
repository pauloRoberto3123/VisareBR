using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SettingsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<SiteSettings>> GetSettings()
    {
        var settings = await _context.Settings.FirstOrDefaultAsync();
        if (settings == null)
        {
            // Default settings if none exist
            return new SiteSettings 
            { 
                WhatsappNumber = "5511999999999", 
                WhatsappDefaultMessage = "Olá, gostaria de saber mais sobre a assessoria de vistos.",
                CompanyEmail = "contato@visarebr.com.br"
            };
        }
        return settings;
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> UpdateSettings(SiteSettings settings)
    {
        var existing = await _context.Settings.FirstOrDefaultAsync();
        if (existing == null)
        {
            _context.Settings.Add(settings);
        }
        else
        {
            existing.WhatsappNumber = settings.WhatsappNumber;
            existing.WhatsappDefaultMessage = settings.WhatsappDefaultMessage;
            existing.CompanyEmail = settings.CompanyEmail;
            existing.Address = settings.Address;
            existing.Cnpj = settings.Cnpj;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
