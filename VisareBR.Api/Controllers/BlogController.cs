using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;
using VisareBR.Core.Events;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly IArticleEventDispatcher _dispatcher;

    public class ArticleCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public int ReadTimeMinutes { get; set; }
        public string FeaturedImageUrl { get; set; } = string.Empty;
        public string MetaTitle { get; set; } = string.Empty;
        public string MetaDescription { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public List<ArticleBlock> ContentBlocks { get; set; } = new();
        public string? AuthorName { get; set; }
    }

    public BlogController(ApplicationDbContext context, IMemoryCache cache, IArticleEventDispatcher dispatcher)
    {
        _context = context;
        _cache = cache;
        _dispatcher = dispatcher;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Article>>> GetArticles()
    {
        const string cacheKey = "articles_list_all";
        if (!_cache.TryGetValue(cacheKey, out List<Article>? articles))
        {
            articles = await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ContentBlocks)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            // Order the content blocks manually
            foreach (var article in articles)
            {
                article.ContentBlocks = article.ContentBlocks.OrderBy(b => b.Order).ToList();
            }

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromHours(1))
                .SetAbsoluteExpiration(TimeSpan.FromDays(1));

            _cache.Set(cacheKey, articles, cacheOptions);
        }

        return Ok(articles);
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<Article>> GetArticleBySlug(string slug)
    {
        string cacheKey = $"article_slug_{slug}";
        if (!_cache.TryGetValue(cacheKey, out Article? article))
        {
            article = await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ContentBlocks)
                .FirstOrDefaultAsync(a => a.Slug == slug);

            if (article == null) return NotFound();

            article.ContentBlocks = article.ContentBlocks.OrderBy(b => b.Order).ToList();

            var cacheOptions = new MemoryCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromHours(1))
                .SetAbsoluteExpiration(TimeSpan.FromDays(1));

            _cache.Set(cacheKey, article, cacheOptions);
        }

        return Ok(article);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<Article>> CreateArticle(ArticleCreateDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        // Process any video embed URLs
        foreach (var block in dto.ContentBlocks)
        {
            if (block is VideoBlock videoBlock)
            {
                videoBlock.EmbedData = VideoParser.ParseEmbedUrl(videoBlock.SourceUrl);
            }
        }

        var article = new Article
        {
            Title = dto.Title,
            Summary = dto.Summary,
            ReadTimeMinutes = dto.ReadTimeMinutes,
            FeaturedImageUrl = dto.FeaturedImageUrl,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription,
            Tags = dto.Tags,
            AuthorName = dto.AuthorName,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow,
            Slug = await GetUniqueSlugAsync(dto.Title),
            ContentBlocks = dto.ContentBlocks.Select((b, idx) =>
            {
                b.Order = idx;
                return b;
            }).ToList()
        };

        _context.Articles.Add(article);
        await _context.SaveChangesAsync();

        // Dispatch cache invalidation event
        await _dispatcher.DispatchAsync(new ArticlePublishedOrUpdatedEvent(article, IsNew: true));

        return CreatedAtAction(nameof(GetArticleBySlug), new { slug = article.Slug }, article);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateArticle(int id, ArticleCreateDto dto)
    {
        var article = await _context.Articles
            .Include(a => a.ContentBlocks)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null) return NotFound();

        // Remove old blocks first to support replacement
        _context.ArticleBlocks.RemoveRange(article.ContentBlocks);

        // Process video blocks
        foreach (var block in dto.ContentBlocks)
        {
            if (block is VideoBlock videoBlock)
            {
                videoBlock.EmbedData = VideoParser.ParseEmbedUrl(videoBlock.SourceUrl);
            }
        }

        // Generate a new slug if the title has changed
        if (article.Title != dto.Title)
        {
            article.Slug = await GetUniqueSlugAsync(dto.Title, article.Id);
        }

        article.Title = dto.Title;
        article.Summary = dto.Summary;
        article.ReadTimeMinutes = dto.ReadTimeMinutes;
        article.FeaturedImageUrl = dto.FeaturedImageUrl;
        article.MetaTitle = dto.MetaTitle;
        article.MetaDescription = dto.MetaDescription;
        article.Tags = dto.Tags;
        article.AuthorName = dto.AuthorName;
        article.UpdatedAt = DateTime.UtcNow;

        article.ContentBlocks = dto.ContentBlocks.Select((b, idx) =>
        {
            b.Order = idx;
            b.Id = 0; // reset ID for EF to insert them as new
            b.ArticleId = id;
            return b;
        }).ToList();

        await _context.SaveChangesAsync();

        // Dispatch cache invalidation event
        await _dispatcher.DispatchAsync(new ArticlePublishedOrUpdatedEvent(article, IsNew: false));

        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteArticle(int id)
    {
        var article = await _context.Articles
            .Include(a => a.ContentBlocks)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (article == null) return NotFound();

        // Store slug and details for cache invalidation before deletion
        var slug = article.Slug;

        _context.Articles.Remove(article);
        await _context.SaveChangesAsync();

        // Dispatch cache invalidation event
        await _dispatcher.DispatchAsync(new ArticlePublishedOrUpdatedEvent(new Article { Slug = slug }, IsNew: false));

        return NoContent();
    }

    private async Task<string> GetUniqueSlugAsync(string title, int? excludeId = null)
    {
        var baseSlug = SlugGenerator.GenerateSlug(title);
        var slug = baseSlug;
        int count = 1;

        while (await _context.Articles.AnyAsync(a => a.Slug == slug && (excludeId == null || a.Id != excludeId)))
        {
            slug = $"{baseSlug}-{count++}";
        }

        return slug;
    }
}

public static class SlugGenerator
{
    public static string GenerateSlug(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            return string.Empty;

        string slug = title.ToLowerInvariant();
        slug = RemoveAccents(slug);
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", " ").Trim();
        slug = Regex.Replace(slug, @"\s", "-");
        slug = Regex.Replace(slug, @"-+", "-");

        if (slug.Length > 100)
        {
            slug = slug.Substring(0, 100);
        }

        return slug.Trim('-');
    }

    private static string RemoveAccents(string text)
    {
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var stringBuilder = new StringBuilder(capacity: normalizedString.Length);

        for (int i = 0; i < normalizedString.Length; i++)
        {
            char c = normalizedString[i];
            var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
            if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
            {
                stringBuilder.Append(c);
            }
        }

        return stringBuilder.ToString().Normalize(NormalizationForm.FormC);
    }
}

public static class VideoParser
{
    public static string ParseEmbedUrl(string sourceUrl)
    {
        if (string.IsNullOrWhiteSpace(sourceUrl)) return string.Empty;

        if (sourceUrl.Contains("youtube.com") || sourceUrl.Contains("youtu.be"))
        {
            var videoId = ExtractYouTubeId(sourceUrl);
            return !string.IsNullOrEmpty(videoId) ? $"https://www.youtube.com/embed/{videoId}" : sourceUrl;
        }

        if (sourceUrl.Contains("instagram.com"))
        {
            var cleanUrl = sourceUrl.Split('?')[0].TrimEnd('/');
            return $"{cleanUrl}/embed";
        }

        if (sourceUrl.Contains("tiktok.com"))
        {
            var match = Regex.Match(sourceUrl, @"video/(\d+)");
            if (match.Success)
            {
                return $"https://www.tiktok.com/embed/v2/{match.Groups[1].Value}";
            }
        }

        return sourceUrl;
    }

    private static string ExtractYouTubeId(string url)
    {
        var regExp = new Regex(@"^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*");
        var match = regExp.Match(url);
        return (match.Success && match.Groups[2].Value.Length == 11) ? match.Groups[2].Value : string.Empty;
    }
}
