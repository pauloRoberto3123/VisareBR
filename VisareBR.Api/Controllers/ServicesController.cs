using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ServicesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ServicesController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("standalone")]
    public async Task<ActionResult<IEnumerable<StandaloneService>>> GetStandaloneServices()
    {
        var services = await _context.StandaloneServices
            .Where(s => s.IsActive)
            .OrderBy(s => s.Order)
            .ToListAsync();

        return Ok(services);
    }

    [Authorize]
    [HttpPost("standalone")]
    public async Task<ActionResult<StandaloneService>> CreateStandaloneService([FromBody] StandaloneService service)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // O Guid é gerado na model, então não precisamos setar aqui.
        _context.StandaloneServices.Add(service);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStandaloneServices), new { id = service.Id }, service);
    }

    [Authorize]
    [HttpPut("standalone/{id}")]
    public async Task<IActionResult> UpdateStandaloneService(Guid id, [FromBody] StandaloneService updatedService)
    {
        if (id != updatedService.Id) return BadRequest("O ID do serviço não coincide.");

        var service = await _context.StandaloneServices.FindAsync(id);
        if (service == null) return NotFound("Serviço não encontrado.");

        service.Name = updatedService.Name;
        service.Price = updatedService.Price;
        service.IsActive = updatedService.IsActive;
        service.Description = updatedService.Description;
        service.Features = updatedService.Features;
        service.IconName = updatedService.IconName;
        service.Order = updatedService.Order;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("standalone/{id}")]
    public async Task<IActionResult> DeleteStandaloneService(Guid id)
    {
        var service = await _context.StandaloneServices.FindAsync(id);
        if (service == null)
        {
            return NotFound("Serviço não encontrado.");
        }

        _context.StandaloneServices.Remove(service);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpPost("standalone/reorder")]
    public async Task<IActionResult> ReorderStandaloneServices([FromBody] List<Guid> ids)
    {
        for (int i = 0; i < ids.Count; i++)
        {
            var id = ids[i];
            var service = await _context.StandaloneServices.FindAsync(id);
            if (service != null)
            {
                service.Order = i;
            }
        }
        await _context.SaveChangesAsync();
        return NoContent();
    }
}