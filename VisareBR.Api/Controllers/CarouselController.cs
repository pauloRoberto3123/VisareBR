using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarouselController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public class CarouselItemDto
    {
        public string ImageUrl { get; set; } = string.Empty;
        public string? Title { get; set; }
        public string? Subtitle { get; set; }
        public string? LinkUrl { get; set; }
        public int Order { get; set; }
        public bool IsActive { get; set; }
    }

    public CarouselController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CarouselItem>>> GetActiveItems()
    {
        var items = await _context.CarouselItems
            .Where(x => x.IsActive)
            .OrderBy(x => x.Order)
            .ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpGet("all")]
    public async Task<ActionResult<IEnumerable<CarouselItem>>> GetAllItems()
    {
        var items = await _context.CarouselItems
            .OrderBy(x => x.Order)
            .ToListAsync();
        return Ok(items);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CarouselItem>> CreateItem(CarouselItemDto dto)
    {
        var item = new CarouselItem
        {
            ImageUrl = dto.ImageUrl,
            Title = dto.Title,
            Subtitle = dto.Subtitle,
            LinkUrl = dto.LinkUrl,
            Order = dto.Order,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.CarouselItems.Add(item);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetActiveItems), new { }, item);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateItem(int id, CarouselItemDto dto)
    {
        var item = await _context.CarouselItems.FindAsync(id);
        if (item == null) return NotFound();

        item.ImageUrl = dto.ImageUrl;
        item.Title = dto.Title;
        item.Subtitle = dto.Subtitle;
        item.LinkUrl = dto.LinkUrl;
        item.Order = dto.Order;
        item.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPut("{id}/toggle")]
    public async Task<IActionResult> ToggleItem(int id, [FromQuery] bool isActive)
    {
        var item = await _context.CarouselItems.FindAsync(id);
        if (item == null) return NotFound();

        item.IsActive = isActive;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderItems([FromBody] List<int> ids)
    {
        if (ids == null || ids.Count == 0) return BadRequest("Lista de IDs vazia.");

        var items = await _context.CarouselItems.Where(x => ids.Contains(x.Id)).ToListAsync();
        foreach (var item in items)
        {
            item.Order = ids.IndexOf(item.Id);
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.CarouselItems.FindAsync(id);
        if (item == null) return NotFound();

        _context.CarouselItems.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
