using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;
using VisareBR.Core.Events;
using VisareBR.Api.Data; // Add this line
using VisareBR.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;
if (!string.IsNullOrEmpty(databaseUrl))
{
    // Parse Render's connection URL into Npgsql key-value format
    var databaseUri = new Uri(databaseUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : string.Empty;
    var host = databaseUri.Host;
    var port = databaseUri.Port == -1 ? 5432 : databaseUri.Port;
    var database = databaseUri.AbsolutePath.TrimStart('/');

    connectionString = $"Host={host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
}

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, x => x.MigrationsAssembly("VisareBR.Api")));



builder.Services.AddIdentityApiEndpoints<ApplicationUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthorization();

builder.Services.AddControllers(); // Add this line
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
});
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<ISlugRedirectService, SlugRedirectService>();
builder.Services.AddScoped<IArticleEventDispatcher, ArticleEventDispatcher>();
builder.Services.AddScoped<IArticleEventListener, ArticleCacheInvalidator>();
builder.Services.AddScoped<SpaPrerenderService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173")
 // Default Vite port
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Seed the database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();
        var slugRedirectService = services.GetRequiredService<ISlugRedirectService>();
        await context.Database.MigrateAsync(); // Auto-apply migrations on Render startup
        await SeedData.Initialize(services);
        await slugRedirectService.InitializeAsync(services);
        await ArticleHtmlHelper.ConvertAllLegacyDatabaseImagesToWebpAsync(context, logger);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

// Configure the HTTP request pipeline.

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseResponseCompression();

// 301 Permanent Redirect Middleware for renamed article slugs (/artigos/{oldSlug})
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? string.Empty;
    if (path.StartsWith("/artigos/", StringComparison.OrdinalIgnoreCase))
    {
        string rawSlug = path.Substring("/artigos/".Length).Trim('/');
        if (!string.IsNullOrWhiteSpace(rawSlug) && !rawSlug.Contains('/'))
        {
            var redirectSvc = context.RequestServices.GetRequiredService<ISlugRedirectService>();
            if (redirectSvc.TryGetTargetSlug(rawSlug, out string targetSlug))
            {
                string query = context.Request.QueryString.HasValue ? context.Request.QueryString.Value! : string.Empty;
                context.Response.StatusCode = StatusCodes.Status301MovedPermanently;
                context.Response.Headers.Location = $"/artigos/{targetSlug}{query}";
                return;
            }
        }
    }
    await next();
});

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var path = ctx.Context.Request.Path.Value ?? string.Empty;
        if (path.StartsWith("/assets/", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=31536000, immutable";
        }
        else
        {
            ctx.Context.Response.Headers["Cache-Control"] = "public, max-age=86400";
        }
    }
});

app.UseCors("AllowReactApp");


app.UseAuthorization();


app.MapControllers(); // Add this line

app.MapGroup("/api/identity").MapIdentityApi<ApplicationUser>();

app.MapFallback(async (HttpContext httpContext, SpaPrerenderService prerenderService) =>
{
    var html = await prerenderService.RenderPageHtmlAsync(httpContext.Request.Path.Value ?? "/");
    httpContext.Response.ContentType = "text/html; charset=utf-8";
    await httpContext.Response.WriteAsync(html);
});

app.Run();
