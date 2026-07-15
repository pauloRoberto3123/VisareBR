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
                CompanyEmail = "contato@visarebr.com.br",
                Metric1Value = "+5000",
                Metric1Label = "Vistos Aprovados",
                Metric2Value = "98%",
                Metric2Label = "Índice de Sucesso",
                Metric3Value = "Suporte 24/7",
                Metric3Label = "Atendimento Especializado"
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
            
            // Map home page metrics
            existing.Metric1Value = settings.Metric1Value;
            existing.Metric1Label = settings.Metric1Label;
            existing.Metric2Value = settings.Metric2Value;
            existing.Metric2Label = settings.Metric2Label;
            existing.Metric3Value = settings.Metric3Value;
            existing.Metric3Label = settings.Metric3Label;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }
}
