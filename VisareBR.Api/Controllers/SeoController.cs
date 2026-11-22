using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Text;
using System.Xml;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Controllers;

[ApiController]
public class SeoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private const string BaseSiteUrl = "https://www.visarebr.com.br";

    public SeoController(ApplicationDbContext context, IMemoryCache cache)
    {
        _context = context;
        _cache = cache;
    }

    [HttpGet("/robots.txt")]
    public IActionResult GetRobotsTxt()
    {
        var sb = new StringBuilder();
        sb.AppendLine("User-agent: *");
        sb.AppendLine("Allow: /");
        sb.AppendLine("Disallow: /admin");
        sb.AppendLine("Disallow: /login");
        sb.AppendLine("Disallow: /api/");
        sb.AppendLine();
        sb.AppendLine($"Sitemap: {BaseSiteUrl}/sitemap.xml");

        return Content(sb.ToString(), "text/plain", Encoding.UTF8);
    }

    [HttpGet("/sitemap.xml")]
    public async Task<IActionResult> GetSitemapXml()
    {
        const string cacheKey = "sitemap_xml";
        if (!_cache.TryGetValue(cacheKey, out string? xmlContent) || string.IsNullOrEmpty(xmlContent))
        {
            var articles = await _context.Articles
                .AsNoTracking()
                .OrderByDescending(a => a.UpdatedAt ?? a.CreatedAt)
                .Select(a => new { a.Slug, a.CreatedAt, a.UpdatedAt })
                .ToListAsync();

            var latestArticleDate = articles.FirstOrDefault() is { } latest
                ? (latest.UpdatedAt ?? latest.CreatedAt)
                : DateTime.UtcNow;

            var staticPages = new (string Path, string Priority, string ChangeFreq)[]
            {
                ("/", "1.0", "weekly"),
                ("/artigos", "0.9", "daily"),
                ("/servicos", "0.9", "weekly"),
                ("/vistos", "0.9", "weekly"),
                ("/avaliacao-de-perfil", "0.9", "monthly"),
                ("/qual-visto-combina", "0.9", "monthly"),
                ("/quem-somos", "0.8", "monthly"),
                ("/nossos-clientes", "0.8", "weekly"),
                ("/duvidas", "0.8", "monthly"),
                ("/ds-160", "0.7", "monthly"),
                ("/contato", "0.7", "monthly")
            };

            var settings = new XmlWriterSettings
            {
                Indent = true,
                Encoding = new UTF8Encoding(false),
                OmitXmlDeclaration = false
            };

            using var ms = new MemoryStream();
            using (var writer = XmlWriter.Create(ms, settings))
            {
                writer.WriteStartDocument();
                writer.WriteStartElement("urlset", "http://www.sitemaps.org/schemas/sitemap/0.9");

                foreach (var page in staticPages)
                {
                    writer.WriteStartElement("url");
                    writer.WriteElementString("loc", $"{BaseSiteUrl}{page.Path}");
                    writer.WriteElementString("lastmod", latestArticleDate.ToString("yyyy-MM-dd"));
                    writer.WriteElementString("changefreq", page.ChangeFreq);
                    writer.WriteElementString("priority", page.Priority);
                    writer.WriteEndElement();
                }

                foreach (var art in articles)
                {
                    if (string.IsNullOrWhiteSpace(art.Slug)) continue;
                    var modDate = art.UpdatedAt ?? art.CreatedAt;
                    writer.WriteStartElement("url");
                    writer.WriteElementString("loc", $"{BaseSiteUrl}/artigos/{art.Slug}");
                    writer.WriteElementString("lastmod", modDate.ToString("yyyy-MM-dd"));
                    writer.WriteElementString("changefreq", "monthly");
                    writer.WriteElementString("priority", "0.8");
                    writer.WriteEndElement();
                }

                writer.WriteEndElement();
                writer.WriteEndDocument();
            }

            xmlContent = Encoding.UTF8.GetString(ms.ToArray());
            _cache.Set(cacheKey, xmlContent, TimeSpan.FromHours(2));
        }

        return Content(xmlContent, "application/xml", Encoding.UTF8);
    }

    [HttpGet("/imagens/artigos/{slug}-bloco-{order:int}.webp")]
    public async Task<IActionResult> GetArticleBlockImage(string slug, int order)
    {
        var article = await _context.Articles
            .AsNoTracking()
            .Include(a => a.ContentBlocks)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null) return NotFound();

        var imgBlock = article.ContentBlocks
            .OfType<ImageBlock>()
            .FirstOrDefault(b => b.Order == order);

        if (imgBlock == null || string.IsNullOrWhiteSpace(imgBlock.ImageUrl))
            return NotFound();

        return ServeImageFromDataOrUrl(imgBlock.ImageUrl);
    }

    [HttpGet("/imagens/artigos/{slug}.webp")]
    public async Task<IActionResult> GetArticleFeaturedImage(string slug)
    {
        string cacheKey = $"article_img_{slug}";
        if (!_cache.TryGetValue(cacheKey, out string? rawImage) || string.IsNullOrEmpty(rawImage))
        {
            rawImage = await _context.Articles
                .AsNoTracking()
                .Where(a => a.Slug == slug)
                .Select(a => a.FeaturedImageUrl)
                .FirstOrDefaultAsync();

            if (string.IsNullOrWhiteSpace(rawImage))
                return NotFound();

            _cache.Set(cacheKey, rawImage, TimeSpan.FromHours(6));
        }

        return ServeImageFromDataOrUrl(rawImage);
    }

    private IActionResult ServeImageFromDataOrUrl(string dataOrUrl)
    {
        if (dataOrUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            int commaIndex = dataOrUrl.IndexOf(',');
            if (commaIndex < 0) return NotFound();

            string header = dataOrUrl.Substring(5, commaIndex - 5); // e.g., "image/webp;base64"
            string mimeType = header.Split(';')[0];
            if (string.IsNullOrWhiteSpace(mimeType)) mimeType = "image/webp";

            string base64Data = dataOrUrl.Substring(commaIndex + 1);
            try
            {
                byte[] bytes = Convert.FromBase64String(base64Data);
                Response.Headers["Cache-Control"] = "public, max-age=604800";
                return File(bytes, mimeType);
            }
            catch
            {
                return NotFound();
            }
        }

        if (dataOrUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            dataOrUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return Redirect(dataOrUrl);
        }

        return NotFound();
    }
}

