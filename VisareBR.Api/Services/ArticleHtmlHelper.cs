using System.Net;
using System.Text.RegularExpressions;

namespace VisareBR.Api.Services;

public static class ArticleHtmlHelper
{
    public const string DefaultAuthorName = "Gilceli Braga";

    private static readonly Regex ImgTagWithBase64Regex = new(
        @"<img\b([^>]*?)\bsrc\s*=\s*[""'](data:image/[^""']+)[""']([^>]*)>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled
    );

    private static readonly Regex ImgTagWithProjectedUrlRegex = new(
        @"src\s*=\s*[""']/imagens/artigos/[^""']*?-texto-(\d+)-(\d+)\.webp[""']",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled
    );

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

    public static string ProjectInlineBase64ImagesToWebpUrls(string? htmlContent, string slug, int blockOrder, string articleTitle)
    {
        if (string.IsNullOrWhiteSpace(htmlContent)) return string.Empty;

        int imgIndex = 0;
        string safeAlt = WebUtility.HtmlEncode(string.IsNullOrWhiteSpace(articleTitle) ? "Imagem do artigo" : articleTitle);

        return ImgTagWithBase64Regex.Replace(htmlContent, match =>
        {
            string beforeSrc = match.Groups[1].Value;
            string afterSrc = match.Groups[3].Value;
            string combinedAttrs = $"{beforeSrc} {afterSrc}";
            string cleanUrl = $"/imagens/artigos/{slug}-texto-{blockOrder}-{imgIndex++}.webp";

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
}

