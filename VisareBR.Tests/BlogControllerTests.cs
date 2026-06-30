using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Moq;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using VisareBR.Api.Controllers;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;
using VisareBR.Core.Events;
using Xunit;

namespace VisareBR.Tests;

public class BlogControllerTests
{
    private (ApplicationDbContext Context, Mock<IMemoryCache> Cache, Mock<IArticleEventDispatcher> Dispatcher) CreateMocks()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["EncryptionKey"]).Returns("Test_Super_Secret_Key_2026_Key!");

        var context = new ApplicationDbContext(options, mockConfig.Object);
        var cache = new Mock<IMemoryCache>();
        var dispatcher = new Mock<IArticleEventDispatcher>();

        // Cache Set stub
        cache.Setup(c => c.CreateEntry(It.IsAny<object>())).Returns(Mock.Of<ICacheEntry>());

        return (context, cache, dispatcher);
    }

    private BlogController CreateController(ApplicationDbContext context, IMemoryCache cache, IArticleEventDispatcher dispatcher)
    {
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "test-author-id")
        }, "mock"));

        return new BlogController(context, cache, dispatcher)
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            }
        };
    }

    [Fact]
    public async Task GetArticles_ShouldReturnAllArticles()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        context.Users.Add(new ApplicationUser
        {
            Id = "test-author-id",
            UserName = "test-author@visarebr.com",
            FullName = "Test Author"
        });
        context.Articles.Add(new Article
        {
            Title = "Test Article 1",
            Slug = "test-article-1",
            AuthorId = "test-author-id",
            FeaturedImageUrl = "https://example.com/img1.jpg"
        });
        await context.SaveChangesAsync();

        var dbCount = await context.Articles.CountAsync();
        Assert.Equal(1, dbCount);

        var controller = CreateController(context, cache.Object, dispatcher.Object);

        // Act
        var result = await controller.GetArticles();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var articles = Assert.IsAssignableFrom<IEnumerable<Article>>(okResult.Value);
        Assert.Single(articles);
    }

    [Fact]
    public async Task CreateArticle_ShouldSaveAndGenerateSlug()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        var controller = CreateController(context, cache.Object, dispatcher.Object);

        var dto = new BlogController.ArticleCreateDto
        {
            Title = "Minha Nova Postagem",
            Summary = "Resumo da postagem",
            ReadTimeMinutes = 4,
            FeaturedImageUrl = "https://example.com/image.jpg",
            ContentBlocks = new List<ArticleBlock>
            {
                new TextBlock { Content = "<p>Conteúdo principal</p>" }
            }
        };

        // Act
        var result = await controller.CreateArticle(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var article = Assert.IsType<Article>(createdResult.Value);
        Assert.Equal("minha-nova-postagem", article.Slug);
        Assert.Equal("test-author-id", article.AuthorId);
        Assert.Single(article.ContentBlocks);

        dispatcher.Verify(d => d.DispatchAsync(It.Is<ArticlePublishedOrUpdatedEvent>(e => e.Article.Slug == "minha-nova-postagem")), Times.Once);
    }

    [Fact]
    public async Task CreateArticle_ShouldEnforceUniqueSlug()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        context.Articles.Add(new Article
        {
            Title = "Duplicate Title",
            Slug = "duplicate-title",
            AuthorId = "test-author-id",
            FeaturedImageUrl = "https://example.com/img.jpg"
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, cache.Object, dispatcher.Object);

        var dto = new BlogController.ArticleCreateDto
        {
            Title = "Duplicate Title",
            Summary = "Outro resumo",
            FeaturedImageUrl = "https://example.com/img2.jpg"
        };

        // Act
        var result = await controller.CreateArticle(dto);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
        var article = Assert.IsType<Article>(createdResult.Value);
        Assert.Equal("duplicate-title-1", article.Slug);
    }

    [Fact]
    public async Task GetArticleBySlug_ShouldReturnArticle()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        context.Users.Add(new ApplicationUser
        {
            Id = "test-author-id",
            UserName = "test-author@visarebr.com",
            FullName = "Test Author"
        });
        context.Articles.Add(new Article
        {
            Title = "Unique Slug Title",
            Slug = "unique-slug-title",
            AuthorId = "test-author-id",
            FeaturedImageUrl = "https://example.com/img.jpg"
        });
        await context.SaveChangesAsync();

        var controller = CreateController(context, cache.Object, dispatcher.Object);

        // Act
        var result = await controller.GetArticleBySlug("unique-slug-title");

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var article = Assert.IsType<Article>(okResult.Value);
        Assert.Equal("Unique Slug Title", article.Title);
    }

    [Fact]
    public async Task UpdateArticle_ShouldModifyArticleAndTriggerCacheInvalidation()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        var existingArticle = new Article
        {
            Id = 123,
            Title = "Old Title",
            Slug = "old-title",
            AuthorId = "test-author-id",
            FeaturedImageUrl = "https://example.com/old.jpg",
            ContentBlocks = new List<ArticleBlock>
            {
                new TextBlock { Content = "Old content", Order = 1 }
            }
        };
        context.Articles.Add(existingArticle);
        await context.SaveChangesAsync();

        var controller = CreateController(context, cache.Object, dispatcher.Object);

        var dto = new BlogController.ArticleCreateDto
        {
            Title = "New Title",
            Summary = "New summary",
            FeaturedImageUrl = "https://example.com/new.jpg",
            ContentBlocks = new List<ArticleBlock>
            {
                new TextBlock { Content = "New content", Order = 1 }
            }
        };

        // Act
        var result = await controller.UpdateArticle(123, dto);

        // Assert
        Assert.IsType<NoContentResult>(result);
        
        var updated = await context.Articles.Include(a => a.ContentBlocks).FirstOrDefaultAsync(a => a.Id == 123);
        Assert.NotNull(updated);
        Assert.Equal("New Title", updated.Title);
        Assert.Equal("new-title", updated.Slug); // Slug should change to new-title because title changed
        Assert.Single(updated.ContentBlocks);
        Assert.Equal("New content", ((TextBlock)updated.ContentBlocks[0]).Content);

        dispatcher.Verify(d => d.DispatchAsync(It.Is<ArticlePublishedOrUpdatedEvent>(e => e.Article.Id == 123 && !e.IsNew)), Times.Once);
    }

    [Fact]
    public async Task DeleteArticle_ShouldRemoveArticleAndTriggerCacheInvalidation()
    {
        // Arrange
        var (context, cache, dispatcher) = CreateMocks();
        var existingArticle = new Article
        {
            Id = 456,
            Title = "To Delete",
            Slug = "to-delete",
            AuthorId = "test-author-id",
            FeaturedImageUrl = "https://example.com/del.jpg"
        };
        context.Articles.Add(existingArticle);
        await context.SaveChangesAsync();

        var controller = CreateController(context, cache.Object, dispatcher.Object);

        // Act
        var result = await controller.DeleteArticle(456);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var deleted = await context.Articles.FindAsync(456);
        Assert.Null(deleted);

        dispatcher.Verify(d => d.DispatchAsync(It.Is<ArticlePublishedOrUpdatedEvent>(e => e.Article.Slug == "to-delete")), Times.Once);
    }
}
