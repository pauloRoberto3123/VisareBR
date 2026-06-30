using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using System.Collections.Generic;
using System.Threading.Tasks;
using VisareBR.Api.Services;
using VisareBR.Core.Entities;
using VisareBR.Core.Events;
using Xunit;

namespace VisareBR.Tests;

public class ArticleEventsTests
{
    [Fact]
    public async Task DispatchAsync_ShouldNotifyListenersAndInvalidateCache()
    {
        // Arrange
        var mockCache = new Mock<IMemoryCache>();
        var mockLogger = new Mock<ILogger<ArticleCacheInvalidator>>();

        // Setup expectations on cache removals
        mockCache.Setup(c => c.Remove("articles_list_all")).Verifiable();
        mockCache.Setup(c => c.Remove("article_slug_test-article")).Verifiable();

        var invalidator = new ArticleCacheInvalidator(mockCache.Object, mockLogger.Object);
        var listeners = new List<IArticleEventListener> { invalidator };
        var dispatcher = new ArticleEventDispatcher(listeners);

        var article = new Article { Slug = "test-article" };
        var @event = new ArticlePublishedOrUpdatedEvent(article, IsNew: true);

        // Act
        await dispatcher.DispatchAsync(@event);

        // Assert
        mockCache.Verify(c => c.Remove("articles_list_all"), Times.Once);
        mockCache.Verify(c => c.Remove("article_slug_test-article"), Times.Once);
    }
}
