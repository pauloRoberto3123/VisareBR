using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.RegularExpressions;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Services;

public class SpaPrerenderService
{
    private readonly ApplicationDbContext _context;
    private readonly IMemoryCache _cache;
    private readonly IWebHostEnvironment _env;
    private const string BaseUrl = "https://www.visarebr.com.br";
    private const string DefaultLogoUrl = "https://www.visarebr.com.br/logo.png";

    public SpaPrerenderService(ApplicationDbContext context, IMemoryCache cache, IWebHostEnvironment env)
    {
        _context = context;
        _cache = cache;
        _env = env;
    }

    public async Task<string> RenderPageHtmlAsync(string requestPath)
    {
        string template = await GetIndexHtmlTemplateAsync();
        if (string.IsNullOrEmpty(template))
        {
            return "<!doctype html><html lang=\"pt-BR\"><head><meta charset=\"UTF-8\"><title>VisareBR</title></head><body><div id=\"root\"></div></body></html>";
        }

        string cleanPath = (requestPath ?? "/").Trim();
        if (!cleanPath.StartsWith('/')) cleanPath = "/" + cleanPath;
        if (cleanPath.Length > 1) cleanPath = cleanPath.TrimEnd('/');

        // Match /artigos/{slug}
        var articleMatch = Regex.Match(cleanPath, @"^/artigos/([^/]+)$", RegexOptions.IgnoreCase);
        if (articleMatch.Success)
        {
            string slug = articleMatch.Groups[1].Value;
            return await RenderArticleHtmlAsync(template, slug);
        }

        return await RenderStaticRouteHtmlAsync(template, cleanPath);
    }

    private async Task<string> GetIndexHtmlTemplateAsync()
    {
        const string cacheKey = "spa_index_html_template";
        if (_cache.TryGetValue(cacheKey, out string? cached) && !string.IsNullOrEmpty(cached))
        {
            return cached;
        }

        string webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        string indexPath = Path.Combine(webRoot, "index.html");

        if (!File.Exists(indexPath))
        {
            return string.Empty;
        }

        string html = await File.ReadAllTextAsync(indexPath, Encoding.UTF8);
        _cache.Set(cacheKey, html, TimeSpan.FromMinutes(15));
        return html;
    }

    private async Task<string> RenderArticleHtmlAsync(string template, string slug)
    {
        string cacheKey = $"article_prerender_{slug}";
        if (_cache.TryGetValue(cacheKey, out string? cachedHtml) && !string.IsNullOrEmpty(cachedHtml))
        {
            return cachedHtml;
        }

        var article = await _context.Articles
            .AsNoTracking()
            .Include(a => a.Author)
            .Include(a => a.ContentBlocks)
            .FirstOrDefaultAsync(a => a.Slug == slug);

        if (article == null)
        {
            return await RenderStaticRouteHtmlAsync(template, "/artigos");
        }

        article.ContentBlocks = article.ContentBlocks.OrderBy(b => b.Order).ToList();

        string metaTitle = string.IsNullOrWhiteSpace(article.MetaTitle) ? article.Title : article.MetaTitle;
        string fullTitle = $"{metaTitle} | VisareBR";
        string metaDesc = string.IsNullOrWhiteSpace(article.MetaDescription) ? article.Summary : article.MetaDescription;
        string canonicalUrl = $"{BaseUrl}/artigos/{article.Slug}";
        string imageUrl = ResolveArticleAbsoluteImageUrl(article.FeaturedImageUrl, article.Slug);
        string authorName = ArticleHtmlHelper.NormalizeAuthorName(article.AuthorName, article.Author?.FullName);

        var datePublished = article.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ");
        var dateModified = (article.UpdatedAt ?? article.CreatedAt).ToString("yyyy-MM-ddTHH:mm:ssZ");

        var blogPostingLd = new Dictionary<string, object>
        {
            ["@context"] = "https://schema.org",
            ["@type"] = "BlogPosting",
            ["mainEntityOfPage"] = new Dictionary<string, object>
            {
                ["@type"] = "WebPage",
                ["@id"] = canonicalUrl
            },
            ["headline"] = metaTitle,
            ["description"] = metaDesc,
            ["image"] = new[] { imageUrl },
            ["datePublished"] = datePublished,
            ["dateModified"] = dateModified,
            ["author"] = new Dictionary<string, object>
            {
                ["@type"] = "Person",
                ["name"] = "Gilceli Braga",
                ["url"] = $"{BaseUrl}/quem-somos"
            },
            ["publisher"] = new Dictionary<string, object>
            {
                ["@type"] = "Organization",
                ["name"] = "VisareBR",
                ["logo"] = new Dictionary<string, object>
                {
                    ["@type"] = "ImageObject",
                    ["url"] = DefaultLogoUrl
                }
            }
        };

        var breadcrumbLd = new Dictionary<string, object>
        {
            ["@context"] = "https://schema.org",
            ["@type"] = "BreadcrumbList",
            ["itemListElement"] = new object[]
            {
                new Dictionary<string, object>
                {
                    ["@type"] = "ListItem",
                    ["position"] = 1,
                    ["name"] = "Início",
                    ["item"] = $"{BaseUrl}/"
                },
                new Dictionary<string, object>
                {
                    ["@type"] = "ListItem",
                    ["position"] = 2,
                    ["name"] = "Artigos",
                    ["item"] = $"{BaseUrl}/artigos"
                },
                new Dictionary<string, object>
                {
                    ["@type"] = "ListItem",
                    ["position"] = 3,
                    ["name"] = article.Title,
                    ["item"] = canonicalUrl
                }
            }
        };

        var jsonOpts = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        var initialArticleState = new
        {
            id = article.Id,
            title = article.Title,
            slug = article.Slug,
            summary = article.Summary,
            readTimeMinutes = article.ReadTimeMinutes,
            featuredImageUrl = !string.IsNullOrWhiteSpace(article.FeaturedImageUrl) &&
                               article.FeaturedImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
                ? $"/imagens/artigos/{article.Slug}.webp"
                : article.FeaturedImageUrl,
            metaTitle = article.MetaTitle,
            metaDescription = article.MetaDescription,
            tags = article.Tags ?? new List<string>(),
            createdAt = article.CreatedAt,
            updatedAt = article.UpdatedAt,
            authorName,
            contentBlocks = article.ContentBlocks.Select(b =>
            {
                if (b is TextBlock tb)
                {
                    return (object)new
                    {
                        id = tb.Id,
                        articleId = tb.ArticleId,
                        order = tb.Order,
                        type = "text",
                        content = ArticleHtmlHelper.ProjectInlineBase64ImagesToWebpUrls(
                            tb.Content,
                            article.Slug,
                            tb.Order,
                            article.Title
                        )
                    };
                }
                if (b is ImageBlock ib)
                {
                    return new
                    {
                        id = ib.Id,
                        articleId = ib.ArticleId,
                        order = ib.Order,
                        type = "image",
                        imageUrl = !string.IsNullOrWhiteSpace(ib.ImageUrl) &&
                                   ib.ImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
                            ? $"/imagens/artigos/{article.Slug}-bloco-{ib.Order}.webp"
                            : ib.ImageUrl,
                        altText = ib.AltText
                    };
                }
                if (b is VideoBlock vb)
                {
                    return new
                    {
                        id = vb.Id,
                        articleId = vb.ArticleId,
                        order = vb.Order,
                        type = "video",
                        sourceUrl = vb.SourceUrl,
                        embedData = vb.EmbedData
                    };
                }
                if (b is ButtonBlock bb)
                {
                    return new
                    {
                        id = bb.Id,
                        articleId = bb.ArticleId,
                        order = bb.Order,
                        type = "button",
                        label = bb.Label,
                        targetUrl = bb.TargetUrl,
                        hexColorCode = bb.HexColorCode
                    };
                }
                if (b is RecommendationBlock rb)
                {
                    return new
                    {
                        id = rb.Id,
                        articleId = rb.ArticleId,
                        order = rb.Order,
                        type = "recommendation",
                        recommendedArticleIds = rb.RecommendedArticleIds
                    };
                }
                return new { id = b.Id, order = b.Order, type = "text" };
            }).ToList()
        };

        string initialArticleJson = JsonSerializer.Serialize(initialArticleState, jsonOpts)
            .Replace("</script>", "<\\/script>", StringComparison.OrdinalIgnoreCase);

        string jsonLdScripts =
            $"<script id=\"jsonld-structured-data\" type=\"application/ld+json\">{JsonSerializer.Serialize(blogPostingLd, jsonOpts)}</script>\n" +
            $"  <script id=\"jsonld-breadcrumb-data\" type=\"application/ld+json\">{JsonSerializer.Serialize(breadcrumbLd, jsonOpts)}</script>\n" +
            $"  <script id=\"initial-article-state\">window.__INITIAL_ARTICLE__ = {initialArticleJson};</script>";

        // Build semantic pre-rendered HTML body for the article
        var bodySb = new StringBuilder();
        bodySb.Append("<article class=\"prerender-article\" style=\"max-width:860px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif\">");
        bodySb.Append("<nav aria-label=\"Breadcrumb\"><ol style=\"display:flex;gap:8px;list-style:none;padding:0;font-size:14px\">");
        bodySb.Append($"<li><a href=\"/\">Início</a> ›</li>");
        bodySb.Append($"<li><a href=\"/artigos\">Artigos</a> ›</li>");
        bodySb.Append($"<li>{WebUtility.HtmlEncode(article.Title)}</li>");
        bodySb.Append("</ol></nav>");

        bodySb.Append($"<h1>{WebUtility.HtmlEncode(article.Title)}</h1>");
        bodySb.Append($"<p><time datetime=\"{datePublished}\">{article.CreatedAt:dd/MM/yyyy}</time> · Por {WebUtility.HtmlEncode(authorName)} · {article.ReadTimeMinutes} min de leitura</p>");

        if (!string.IsNullOrWhiteSpace(article.FeaturedImageUrl))
        {
            string relCover = article.FeaturedImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
                ? $"/imagens/artigos/{article.Slug}.webp"
                : article.FeaturedImageUrl;
            bodySb.Append($"<figure><img src=\"{WebUtility.HtmlEncode(relCover)}\" alt=\"{WebUtility.HtmlEncode(article.Title)}\" width=\"1200\" height=\"630\" /></figure>");
        }

        if (!string.IsNullOrWhiteSpace(article.Summary))
        {
            bodySb.Append($"<p>{WebUtility.HtmlEncode(article.Summary)}</p>");
        }

        foreach (var block in article.ContentBlocks)
        {
            if (block is TextBlock textBlock && !string.IsNullOrWhiteSpace(textBlock.Content))
            {
                // Project any inline Base64 <img> tags inside Rich Text to clean /imagens/artigos/{slug}-texto-{order}-{index}.webp URLs
                string projectedHtml = ArticleHtmlHelper.ProjectInlineBase64ImagesToWebpUrls(
                    textBlock.Content,
                    article.Slug,
                    textBlock.Order,
                    article.Title
                );
                // Ensure only 1 H1 per page by demoting any inner <h1> to <h2>
                string sanitizedHtml = Regex.Replace(projectedHtml, @"<h1(\b[^>]*)>", "<h2$1>", RegexOptions.IgnoreCase);
                sanitizedHtml = Regex.Replace(sanitizedHtml, @"</h1>", "</h2>", RegexOptions.IgnoreCase);
                bodySb.Append($"<section>{sanitizedHtml}</section>");
            }
            else if (block is ImageBlock imgBlock && !string.IsNullOrWhiteSpace(imgBlock.ImageUrl))
            {
                string blockImgUrl = imgBlock.ImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase)
                    ? $"/imagens/artigos/{article.Slug}-bloco-{block.Order}.webp"
                    : imgBlock.ImageUrl;
                string alt = !string.IsNullOrWhiteSpace(imgBlock.AltText) ? imgBlock.AltText : article.Title;
                bodySb.Append($"<figure><img src=\"{WebUtility.HtmlEncode(blockImgUrl)}\" alt=\"{WebUtility.HtmlEncode(alt)}\" width=\"800\" height=\"450\" loading=\"lazy\" /></figure>");
            }
            else if (block is ButtonBlock btnBlock && !string.IsNullOrWhiteSpace(btnBlock.Label) && !string.IsNullOrWhiteSpace(btnBlock.TargetUrl))
            {
                bodySb.Append($"<p><a href=\"{WebUtility.HtmlEncode(btnBlock.TargetUrl)}\">{WebUtility.HtmlEncode(btnBlock.Label)}</a></p>");
            }
        }

        // Author Box (E-E-A-T)
        bodySb.Append("<aside aria-label=\"Sobre a autora\" style=\"margin-top:32px;padding-top:20px;border-top:1px solid #e5e7eb\">");
        bodySb.Append($"<h2>Sobre {WebUtility.HtmlEncode(authorName)}</h2>");
        bodySb.Append("<p>Especialista em Assessoria de Vistos Consulares na VisareBR, com mais de 5 anos de experiência auxiliando solicitantes brasileiros na aprovação do visto americano (B1/B2, F1, renovação e casos complexos) com estratégia, análise de perfil e preparação personalizada.</p>");
        bodySb.Append("<p><a href=\"/quem-somos\">Conheça a equipe VisareBR →</a></p>");
        bodySb.Append("</aside>");
        bodySb.Append("</article>");

        string finalHtml = InjectSeoIntoTemplate(
            template,
            fullTitle,
            metaDesc,
            canonicalUrl,
            "article",
            imageUrl,
            jsonLdScripts,
            bodySb.ToString()
        );

        _cache.Set(cacheKey, finalHtml, TimeSpan.FromHours(1));
        return finalHtml;
    }

    private async Task<string> RenderStaticRouteHtmlAsync(string template, string path)
    {
        var routeMeta = GetRouteMetadata(path);
        string canonicalUrl = path == "/" ? $"{BaseUrl}/" : $"{BaseUrl}{path}";

        var settings = await _context.Settings.AsNoTracking().FirstOrDefaultAsync();
        string phone = !string.IsNullOrWhiteSpace(settings?.WhatsappNumber)
            ? "+" + Regex.Replace(settings!.WhatsappNumber, @"\D", "")
            : "+5519998448417";
        string email = !string.IsNullOrWhiteSpace(settings?.CompanyEmail)
            ? settings!.CompanyEmail
            : "contato@visarebr.com.br";

        var orgLd = new Dictionary<string, object>
        {
            ["@context"] = "https://schema.org",
            ["@type"] = "Organization",
            ["name"] = "VisareBR",
            ["legalName"] = "VisareBR Assessoria de Vistos",
            ["url"] = $"{BaseUrl}/",
            ["logo"] = DefaultLogoUrl,
            ["telephone"] = phone,
            ["email"] = email,
            ["address"] = new Dictionary<string, object>
            {
                ["@type"] = "PostalAddress",
                ["addressLocality"] = settings?.Address ?? "Campinas / SP",
                ["addressCountry"] = "BR"
            },
            ["sameAs"] = new[]
            {
                "https://www.instagram.com/visarebr",
                "https://www.youtube.com/@visarebr"
            }
        };

        var jsonOpts = new JsonSerializerOptions
        {
            Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };
        string jsonLdScript = $"<script id=\"jsonld-organization-data\" type=\"application/ld+json\">{JsonSerializer.Serialize(orgLd, jsonOpts)}</script>";

        var bodySb = new StringBuilder();
        bodySb.Append("<main style=\"max-width:1100px;margin:0 auto;padding:24px 16px;font-family:system-ui,sans-serif\">");
        bodySb.Append($"<h1>{WebUtility.HtmlEncode(routeMeta.H1)}</h1>");
        bodySb.Append($"<p>{WebUtility.HtmlEncode(routeMeta.Description)}</p>");

        // Include recent articles links on / and /artigos so crawlers immediately discover all posts
        if (path == "/" || path == "/artigos" || path == "/vistos" || path == "/servicos")
        {
            var articles = await _context.Articles
                .AsNoTracking()
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new { a.Title, a.Slug, a.Summary, a.CreatedAt })
                .Take(path == "/artigos" ? 100 : 12)
                .ToListAsync();

            if (articles.Count > 0)
            {
                bodySb.Append("<section><h2>Artigos e Guias sobre Visto Americano</h2><ul>");
                foreach (var art in articles)
                {
                    bodySb.Append($"<li><a href=\"/artigos/{WebUtility.HtmlEncode(art.Slug)}\"><strong>{WebUtility.HtmlEncode(art.Title)}</strong></a> — {WebUtility.HtmlEncode(art.Summary)}</li>");
                }
                bodySb.Append("</ul></section>");
            }
        }

        bodySb.Append("<nav aria-label=\"Links principais\"><ul>");
        bodySb.Append("<li><a href=\"/\">Início</a></li>");
        bodySb.Append("<li><a href=\"/servicos\">Serviços e Assessoria</a></li>");
        bodySb.Append("<li><a href=\"/vistos\">Tipos de Vistos Americano</a></li>");
        bodySb.Append("<li><a href=\"/avaliacao-de-perfil\">Avaliação de Perfil Gratuita para Visto Americano</a></li>");
        bodySb.Append("<li><a href=\"/qual-visto-combina\">Qual Visto Combina com Você?</a></li>");
        bodySb.Append("<li><a href=\"/quem-somos\">Quem Somos</a></li>");
        bodySb.Append("<li><a href=\"/nossos-clientes\">Avaliações de Clientes</a></li>");
        bodySb.Append("<li><a href=\"/artigos\">Artigos e Dicas</a></li>");
        bodySb.Append("<li><a href=\"/duvidas\">Dúvidas Frequentes (FAQ)</a></li>");
        bodySb.Append("<li><a href=\"/contato\">Contato</a></li>");
        bodySb.Append("</ul></nav></main>");

        return InjectSeoIntoTemplate(
            template,
            routeMeta.Title,
            routeMeta.Description,
            canonicalUrl,
            "website",
            $"{BaseUrl}/logo%20fundo%20transparente.png",
            jsonLdScript,
            bodySb.ToString()
        );
    }

    private static (string Title, string H1, string Description) GetRouteMetadata(string path)
    {
        return path.ToLowerInvariant() switch
        {
            "/artigos" => (
                "Artigos e Guias sobre Visto Americano | VisareBR",
                "Artigos VisareBR — Dicas e Guias sobre Visto Americano",
                "Dicas práticas, notícias atualizadas e guias completos sobre como tirar ou renovar o visto americano B1/B2, F1, entrevista consular e formulário DS-160."
            ),
            "/servicos" => (
                "Serviços de Assessoria para Visto Americano | VisareBR",
                "Serviços Especializados de Assessoria Consular",
                "Conheça nossos serviços completos e avulsos para solicitação e renovação de visto americano: preenchimento do DS-160, agendamento CASV/Consulado, defesa de negativa e treinamento para entrevista."
            ),
            "/vistos" => (
                "Tipos de Visto Americano: Turismo, Negócios, Estudante e Renovação | VisareBR",
                "Tipos de Vistos para os Estados Unidos e Outros Países",
                "Entenda os requisitos e como solicitar o Visto de Turismo (B2), Negócios (B1), Estudante (F1), Renovação de Visto Americano e vistos para Canadá e Europa."
            ),
            "/quem-somos" => (
                "Quem Somos — Especialistas em Visto Americano | VisareBR",
                "Quem Somos — VisareBR Assessoria de Vistos",
                "Conheça a história da VisareBR e de Gilceli Braga. Mais de 5 anos de experiência e avaliação 5 estrelas no Google em assessoria para o visto americano."
            ),
            "/nossos-clientes" => (
                "Avaliações e Depoimentos de Clientes | VisareBR",
                "O que dizem nossos clientes sobre a VisareBR",
                "Confira depoimentos reais de clientes que conquistaram a aprovação do visto americano com a assessoria da VisareBR."
            ),
            "/duvidas" => (
                "Dúvidas Frequentes sobre o Visto Americano (FAQ) | VisareBR",
                "Perguntas e Dúvidas Frequentes sobre o Visto Americano",
                "Tire suas principais dúvidas sobre documentação, renda mínima, vínculos no Brasil, entrevista no consulado, DS-160 e taxa MRV."
            ),
            "/contato" => (
                "Fale Conosco — Atendimento e Consultoria | VisareBR",
                "Entre em Contato com a VisareBR",
                "Fale com nossos especialistas em visto americano pelo WhatsApp ou e-mail e inicie seu processo com segurança."
            ),
            "/avaliacao-de-perfil" or "/avaliacao-de-perfil.html" => (
                "Avaliação de Perfil Gratuita para Visto Americano | VisareBR",
                "Avaliação de Perfil para Visto Americano",
                "Responda algumas perguntas rápidas e descubra na hora como está o seu perfil e seus vínculos para solicitar o visto americano."
            ),
            "/qual-visto-combina" or "/qual-visto-combina.html" => (
                "Qual Visto Americano Combina com Você? Diagnóstico Gratuito | VisareBR",
                "Qual visto combina com o seu perfil?",
                "Compare seu perfil com 14 categorias de visto americano (temporários e Green Card) e veja quais requisitos você já atende."
            ),
            "/ds-160" => (
                "Formulário DS-160 em Português | VisareBR",
                "Formulário Inteligente de Coleta DS-160",
                "Preencha os dados para o seu formulário oficial DS-160 em português em ambiente seguro e criptografado com revisão da equipe VisareBR."
            ),
            _ => (
                "VisareBR | Assessoria de Visto Americano",
                "Assessoria Completa e Especializada para o seu Visto Americano",
                "Assessoria completa e especializada para o seu Visto Americano. Análise de perfil, preenchimento do formulário DS-160, agendamento consular e preparação para a entrevista."
            )
        };
    }

    private static string ResolveArticleAbsoluteImageUrl(string? featuredImageUrl, string slug)
    {
        if (string.IsNullOrWhiteSpace(featuredImageUrl))
        {
            return $"{BaseUrl}/logo%20fundo%20transparente.png";
        }

        if (featuredImageUrl.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase) ||
            featuredImageUrl.StartsWith("/imagens/artigos/", StringComparison.OrdinalIgnoreCase))
        {
            return $"{BaseUrl}/imagens/artigos/{slug}.webp";
        }

        if (featuredImageUrl.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            featuredImageUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return featuredImageUrl;
        }

        return $"{BaseUrl}/{featuredImageUrl.TrimStart('/')}";
    }

    private static string InjectSeoIntoTemplate(
        string html,
        string title,
        string description,
        string canonicalUrl,
        string ogType,
        string ogImageUrl,
        string jsonLdScripts,
        string prerenderedRootContent)
    {
        string safeTitle = WebUtility.HtmlEncode(title);
        string safeDesc = WebUtility.HtmlEncode(description);
        string safeCanonical = WebUtility.HtmlEncode(canonicalUrl);
        string safeImage = WebUtility.HtmlEncode(ogImageUrl);

        // Replace <title>...</title> using MatchEvaluator to avoid $& substitution issues
        html = Regex.Replace(
            html,
            @"<title>.*?</title>",
            _ => $"<title>{safeTitle}</title>",
            RegexOptions.Singleline | RegexOptions.IgnoreCase
        );

        // Replace meta tags in index.html
        html = ReplaceMetaContent(html, "name", "title", safeTitle);
        html = ReplaceMetaContent(html, "name", "description", safeDesc);
        html = ReplaceMetaContent(html, "property", "og:type", ogType);
        html = ReplaceMetaContent(html, "property", "og:url", safeCanonical);
        html = ReplaceMetaContent(html, "property", "og:title", safeTitle);
        html = ReplaceMetaContent(html, "property", "og:description", safeDesc);
        html = ReplaceMetaContent(html, "property", "og:image", safeImage);
        html = ReplaceMetaContent(html, "property", "og:image:secure_url", safeImage);
        html = ReplaceMetaContent(html, "property", "og:image:type", "image/webp");
        html = ReplaceMetaContent(html, "name", "twitter:url", safeCanonical);
        html = ReplaceMetaContent(html, "name", "twitter:title", safeTitle);
        html = ReplaceMetaContent(html, "name", "twitter:description", safeDesc);
        html = ReplaceMetaContent(html, "name", "twitter:image", safeImage);

        // Inject <link rel="canonical"> and JSON-LD before </head>
        string headInjection = $"  <link rel=\"canonical\" href=\"{safeCanonical}\" />\n  {jsonLdScripts}\n</head>";
        html = Regex.Replace(html, @"</head>", _ => headInjection, RegexOptions.IgnoreCase);

        // Inject pre-rendered content inside <div id="root"></div> using MatchEvaluator so R$&nbsp; is never altered
        html = Regex.Replace(
            html,
            @"<div\s+id=""root""\s*>\s*</div>",
            _ => $"<div id=\"root\">{prerenderedRootContent}</div>",
            RegexOptions.IgnoreCase
        );

        return html;
    }

    private static string ReplaceMetaContent(string html, string attrName, string attrVal, string newContent)
    {
        string pattern = $@"<meta\s+{attrName}=""{Regex.Escape(attrVal)}""\s+content=""[^""]*""\s*/?>";
        string replacement = $"<meta {attrName}=\"{attrVal}\" content=\"{newContent}\" />";
        if (Regex.IsMatch(html, pattern, RegexOptions.IgnoreCase | RegexOptions.Singleline))
        {
            return Regex.Replace(html, pattern, _ => replacement, RegexOptions.IgnoreCase | RegexOptions.Singleline);
        }
        return html;
    }
}
