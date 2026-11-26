using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using System.Net;
using System.Text.RegularExpressions;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Services;

public static class ArticleHtmlHelper
{
    public const string DefaultAuthorName = "Gilceli Braga";

    private static readonly Regex ImgTagWithBase64Regex = new(
        @"<img\b([^>]*?)\bsrc\s*=\s*[""'](data:image/[^""']+)[""']([^>]*)>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled
    );

    private static readonly Regex ImgTagWithProjectedUrlRegex = new(
        @"src\s*=\s*[""']/imagens/artigos/[^""']*?-texto-(\d+)-(\d+)\.webp(?:\?[^""']*)?[""']",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled
    );

    public static string GetImageVersionParam(DateTime createdAt, DateTime? updatedAt)
    {
        var dt = updatedAt ?? createdAt;
        var utc = dt.Kind == DateTimeKind.Utc ? dt : DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        return new DateTimeOffset(utc).ToUnixTimeSeconds().ToString();
    }

    public static string NormalizeAuthorName(string? authorName, string? fallbackFullName = null)
    {
        string candidate = !string.IsNullOrWhiteSpace(authorName)
            ? authorName.Trim()
            : (fallbackFullName?.Trim() ?? string.Empty);

        if (string.IsNullOrWhiteSpace(candidate) ||
            candidate.Equals("Administrador VisareBR", StringComparison.OrdinalIgnoreCase) ||
            candidate.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
            candidate.Equals("VisareBR", StringComparison.OrdinalIgnoreCase))
        {
            return DefaultAuthorName;
        }

        return candidate;
    }

    public static List<string> ExtractInlineBase64Images(string? htmlContent)
    {
        var result = new List<string>();
        if (string.IsNullOrWhiteSpace(htmlContent)) return result;

        var matches = ImgTagWithBase64Regex.Matches(htmlContent);
        foreach (Match match in matches)
        {
            if (match.Groups.Count > 2)
            {
                result.Add(match.Groups[2].Value);
            }
        }
        return result;
    }

    public static string ProjectInlineBase64ImagesToWebpUrls(string? htmlContent, string slug, int blockOrder, string articleTitle, string? versionParam = null)
    {
        if (string.IsNullOrWhiteSpace(htmlContent)) return string.Empty;

        int imgIndex = 0;
        string safeAlt = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(articleTitle) ? "Imagem do artigo" : articleTitle);
        string vSuffix = !string.IsNullOrWhiteSpace(versionParam) ? $"?v={versionParam}" : string.Empty;

        return ImgTagWithBase64Regex.Replace(htmlContent, match =>
        {
            string beforeSrc = match.Groups[1].Value;
            string afterSrc = match.Groups[3].Value;
            string combinedAttrs = $"{beforeSrc} {afterSrc}";
            string cleanUrl = $"/imagens/artigos/{slug}-texto-{blockOrder}-{imgIndex++}.webp{vSuffix}";

            var extraAttrs = new List<string>();
            if (!Regex.IsMatch(combinedAttrs, @"\balt\s*=", RegexOptions.IgnoreCase))
            {
                extraAttrs.Add($"alt=\"{safeAlt}\"");
            }
            if (!Regex.IsMatch(combinedAttrs, @"\bwidth\s*=", RegexOptions.IgnoreCase))
            {
                extraAttrs.Add("width=\"800\"");
            }
            if (!Regex.IsMatch(combinedAttrs, @"\bheight\s*=", RegexOptions.IgnoreCase))
            {
                extraAttrs.Add("height=\"450\"");
            }
            if (!Regex.IsMatch(combinedAttrs, @"\bloading\s*=", RegexOptions.IgnoreCase))
            {
                extraAttrs.Add("loading=\"lazy\"");
            }
            if (!Regex.IsMatch(combinedAttrs, @"\bdecoding\s*=", RegexOptions.IgnoreCase))
            {
                extraAttrs.Add("decoding=\"async\"");
            }

            string extraStr = extraAttrs.Count > 0 ? " " + string.Join(" ", extraAttrs) : string.Empty;
            return $"<img{beforeSrc}src=\"{cleanUrl}\"{afterSrc}{extraStr}>";
        });
    }

    public static string RestoreProjectedInlineImagesToBase64(
        string? htmlContent,
        Dictionary<(int Order, int Index), string> existingInlineImages)
    {
        if (string.IsNullOrWhiteSpace(htmlContent) || existingInlineImages.Count == 0)
            return htmlContent ?? string.Empty;

        return ImgTagWithProjectedUrlRegex.Replace(htmlContent, match =>
        {
            if (int.TryParse(match.Groups[1].Value, out int oldOrder) &&
                int.TryParse(match.Groups[2].Value, out int oldIndex) &&
                existingInlineImages.TryGetValue((oldOrder, oldIndex), out var base64Data) &&
                !string.IsNullOrEmpty(base64Data))
            {
                return $"src=\"{base64Data}\"";
            }
            return match.Value;
        });
    }

    public static string ConvertBase64DataUrlToWebpDataUrl(string? dataUrl, int maxWidth = 1200, int quality = 78)
    {
        if (string.IsNullOrWhiteSpace(dataUrl) ||
            !dataUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
        {
            return dataUrl ?? string.Empty;
        }

        if (dataUrl.StartsWith("data:image/webp;", StringComparison.OrdinalIgnoreCase))
        {
            return dataUrl;
        }

        int commaIndex = dataUrl.IndexOf(',');
        if (commaIndex < 0) return dataUrl;

        string base64Payload = dataUrl.Substring(commaIndex + 1);
        try
        {
            byte[] rawBytes = Convert.FromBase64String(base64Payload);
            using var image = Image.Load(rawBytes);

            if (image.Width > maxWidth)
            {
                int newHeight = (int)Math.Round((double)image.Height * maxWidth / image.Width);
                image.Mutate(x => x.Resize(maxWidth, newHeight));
            }

            using var outStream = new MemoryStream();
            image.SaveAsWebp(outStream, new WebpEncoder { Quality = quality });
            string webpBase64 = Convert.ToBase64String(outStream.ToArray());
            return $"data:image/webp;base64,{webpBase64}";
        }
        catch
        {
            return dataUrl;
        }
    }

    public static string ConvertInlineHtmlBase64ImagesToWebp(string? htmlContent, int maxWidth = 1000, int quality = 78)
    {
        if (string.IsNullOrWhiteSpace(htmlContent)) return string.Empty;

        return ImgTagWithBase64Regex.Replace(htmlContent, match =>
        {
            string beforeSrc = match.Groups[1].Value;
            string originalDataUrl = match.Groups[2].Value;
            string afterSrc = match.Groups[3].Value;

            string webpDataUrl = ConvertBase64DataUrlToWebpDataUrl(originalDataUrl, maxWidth, quality);
            return $"<img{beforeSrc}src=\"{webpDataUrl}\"{afterSrc}>";
        });
    }

    public static async Task ConvertAllLegacyDatabaseImagesToWebpAsync(ApplicationDbContext context, ILogger logger)
    {
        var articles = await context.Articles
            .Include(a => a.ContentBlocks)
            .ToListAsync();

        int convertedCount = 0;

        foreach (var article in articles)
        {
            bool articleChanged = false;

            if (!string.IsNullOrWhiteSpace(article.FeaturedImageUrl) &&
                article.FeaturedImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) &&
                !article.FeaturedImageUrl.StartsWith("data:image/webp;", StringComparison.OrdinalIgnoreCase))
            {
                var newCover = ConvertBase64DataUrlToWebpDataUrl(article.FeaturedImageUrl, 1200, 78);
                if (newCover != article.FeaturedImageUrl)
                {
                    article.FeaturedImageUrl = newCover;
                    articleChanged = true;
                    convertedCount++;
                }
            }

            if (article.ContentBlocks != null)
            {
                foreach (var block in article.ContentBlocks)
                {
                    if (block is ImageBlock imgBlock &&
                        !string.IsNullOrWhiteSpace(imgBlock.ImageUrl) &&
                        imgBlock.ImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) &&
                        !imgBlock.ImageUrl.StartsWith("data:image/webp;", StringComparison.OrdinalIgnoreCase))
                    {
                        var newImg = ConvertBase64DataUrlToWebpDataUrl(imgBlock.ImageUrl, 1000, 78);
                        if (newImg != imgBlock.ImageUrl)
                        {
                            imgBlock.ImageUrl = newImg;
                            articleChanged = true;
                            convertedCount++;
                        }
                    }
                    else if (block is TextBlock textBlock &&
                             !string.IsNullOrWhiteSpace(textBlock.Content) &&
                             textBlock.Content.Contains("data:image/", StringComparison.OrdinalIgnoreCase))
                    {
                        var newHtml = ConvertInlineHtmlBase64ImagesToWebp(textBlock.Content, 1000, 78);
                        if (newHtml != textBlock.Content)
                        {
                            textBlock.Content = newHtml;
                            articleChanged = true;
                            convertedCount++;
                        }
                    }
                }
            }

            if (articleChanged)
            {
                await context.SaveChangesAsync();
            }
        }

        if (convertedCount > 0)
        {
            logger.LogInformation("Converted {Count} legacy article images in PostgreSQL to WebP.", convertedCount);
        }
    }
}

