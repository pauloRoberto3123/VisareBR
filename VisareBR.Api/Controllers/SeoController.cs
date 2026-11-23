using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using VisareBR.Api.Services;
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

    [HttpGet("/imagens/artigos/{fileName}.webp")]
    public async Task<IActionResult> GetArticleImage(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName)) return NotFound();

        // 1. Check if it is an inline text image: {slug}-texto-{order}-{index}
        var textMatch = Regex.Match(fileName, @"^(.+)-texto-(\d+)-(\d+)$", RegexOptions.IgnoreCase);
        if (textMatch.Success &&
            int.TryParse(textMatch.Groups[2].Value, out int txtOrder) &&
            int.TryParse(textMatch.Groups[3].Value, out int txtIndex))
        {
            return await GetArticleInlineTextImageInternalAsync(textMatch.Groups[1].Value, txtOrder, txtIndex);
        }

        // 2. Check if it is an ImageBlock image: {slug}-bloco-{order}
        var blockMatch = Regex.Match(fileName, @"^(.+)-bloco-(\d+)$", RegexOptions.IgnoreCase);
        if (blockMatch.Success && int.TryParse(blockMatch.Groups[2].Value, out int blkOrder))
        {
            return await GetArticleBlockImageInternalAsync(blockMatch.Groups[1].Value, blkOrder);
        }

        // 3. Default: Featured cover image for {slug}
        return await GetArticleFeaturedImageInternalAsync(fileName);
    }

    private async Task<IActionResult> GetArticleInlineTextImageInternalAsync(string slug, int order, int index)
    {
        string cacheKey = $"article_img_{slug}_txt_{order}_{index}";
        if (_cache.TryGetValue(cacheKey, out byte[]? cachedWebpBytes) && cachedWebpBytes != null)
        {
            Response.Headers["Cache-Control"] = "public, max-age=604800";
            return File(cachedWebpBytes, "image/webp");
        }

        var article = await _context.Articles
            .AsNoTracking()
            .Include(a => a.ContentBlocks)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null) return NotFound();

        var textBlock = article.ContentBlocks
            .OfType<TextBlock>()
            .FirstOrDefault(b => b.Order == order);

        if (textBlock == null || string.IsNullOrWhiteSpace(textBlock.Content))
            return NotFound();

        var inlineImages = ArticleHtmlHelper.ExtractInlineBase64Images(textBlock.Content);
        if (index < 0 || index >= inlineImages.Count)
            return NotFound();

        return ServeImageAsWebp(inlineImages[index], cacheKey);
    }

    private async Task<IActionResult> GetArticleBlockImageInternalAsync(string slug, int order)
    {
        string cacheKey = $"article_img_{slug}_blk_{order}";
        if (_cache.TryGetValue(cacheKey, out byte[]? cachedWebpBytes) && cachedWebpBytes != null)
        {
            Response.Headers["Cache-Control"] = "public, max-age=604800";
            return File(cachedWebpBytes, "image/webp");
        }

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

        return ServeImageAsWebp(imgBlock.ImageUrl, cacheKey);
    }

    private async Task<IActionResult> GetArticleFeaturedImageInternalAsync(string slug)
    {
        string cacheKey = $"article_img_{slug}";
        if (_cache.TryGetValue(cacheKey, out byte[]? cachedWebpBytes) && cachedWebpBytes != null)
        {
            Response.Headers["Cache-Control"] = "public, max-age=604800";
            return File(cachedWebpBytes, "image/webp");
        }

        var rawImage = await _context.Articles
            .AsNoTracking()
            .Where(a => a.Slug == slug)
            .Select(a => a.FeaturedImageUrl)
            .FirstOrDefaultAsync();

        if (string.IsNullOrWhiteSpace(rawImage))
            return NotFound();

        return ServeImageAsWebp(rawImage, cacheKey);
    }

    private IActionResult ServeImageAsWebp(string dataOrUrl, string cacheKey)
    {
        if (dataOrUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            int commaIndex = dataOrUrl.IndexOf(',');
            if (commaIndex < 0) return NotFound();

            string header = dataOrUrl.Substring(5, commaIndex - 5); // e.g., "image/webp;base64" or "image/jpeg;base64"
            string mimeType = header.Split(';')[0].Trim().ToLowerInvariant();
            string base64Data = dataOrUrl.Substring(commaIndex + 1);

            try
            {
                byte[] rawBytes = Convert.FromBase64String(base64Data);
                byte[] webpBytes;

                if (mimeType == "image/webp")
                {
                    webpBytes = rawBytes;
                }
                else
                {
                    using var image = Image.Load(rawBytes);
                    using var outStream = new MemoryStream();
                    image.SaveAsWebp(outStream, new WebpEncoder { Quality = 78 });
                    webpBytes = outStream.ToArray();
                }

                _cache.Set(cacheKey, webpBytes, TimeSpan.FromHours(6));
                Response.Headers["Cache-Control"] = "public, max-age=604800";
                return File(webpBytes, "image/webp");
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
