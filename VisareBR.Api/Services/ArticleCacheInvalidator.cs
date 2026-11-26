using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Threading.Tasks;
using VisareBR.Core.Events;

namespace VisareBR.Api.Services;

public class ArticleCacheInvalidator : IArticleEventListener
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<ArticleCacheInvalidator> _logger;

    public ArticleCacheInvalidator(IMemoryCache memoryCache, ILogger<ArticleCacheInvalidator> logger)
    {
        _memoryCache = memoryCache;
        _logger = logger;
    }

    public Task HandleAsync(ArticlePublishedOrUpdatedEvent @event)
    {
        _logger.LogInformation("Invalidating blog cache for article: {Slug}", @event.Article.Slug);
        
        // Remove individual cached article by slug
        _memoryCache.Remove($"article_slug_{@event.Article.Slug}");
        _memoryCache.Remove($"article_prerender_{@event.Article.Slug}");
        _memoryCache.Remove($"article_img_{@event.Article.Slug}");

        if (!string.IsNullOrWhiteSpace(@event.PreviousSlug) &&
            !@event.PreviousSlug.Equals(@event.Article.Slug, System.StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogInformation("Invalidating blog cache for previous slug: {PreviousSlug}", @event.PreviousSlug);
            _memoryCache.Remove($"article_slug_{@event.PreviousSlug}");
            _memoryCache.Remove($"article_prerender_{@event.PreviousSlug}");
            _memoryCache.Remove($"article_img_{@event.PreviousSlug}");
        }
        
        // Remove the cached list of all articles and sitemap
        _memoryCache.Remove("articles_list_all");
        _memoryCache.Remove("sitemap_xml");
        
        return Task.CompletedTask;
    }
}
