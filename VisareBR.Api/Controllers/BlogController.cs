using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public class BlogCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
    }

    public BlogController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogPost>>> GetPosts()
    {
        return await _context.BlogPosts
            .Include(p => p.Author)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BlogPost>> GetPost(int id)
    {
        var post = await _context.BlogPosts
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();
        return post;
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<BlogPost>> CreatePost(BlogCreateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var post = new BlogPost
        {
            Title = dto.Title,
            Content = dto.Content,
            Summary = dto.Summary,
            ImageUrl = dto.ImageUrl,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.BlogPosts.Add(post);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        var post = await _context.BlogPosts.FindAsync(id);
        if (post == null) return NotFound();

        // Optional: Check if the user is the author or an admin
        _context.BlogPosts.Remove(post);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
