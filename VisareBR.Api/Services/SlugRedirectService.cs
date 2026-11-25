using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using VisareBR.Core.Data;

namespace VisareBR.Api.Services;

public interface ISlugRedirectService
{
    bool TryGetTargetSlug(string oldSlug, out string newSlug);
    Task RegisterRedirectAsync(string oldSlug, string newSlug);
    Task InitializeAsync(IServiceProvider services);
}

public class SlugRedirectService : ISlugRedirectService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<SlugRedirectService> _logger;
    private readonly ConcurrentDictionary<string, string> _redirects = new(StringComparer.OrdinalIgnoreCase);

    public SlugRedirectService(IServiceScopeFactory scopeFactory, ILogger<SlugRedirectService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;

        // Pre-seed the 214(b) article 301 redirect in memory immediately
        _redirects["visto-americano-negado-214b-o-que-significa-e-como-reverter"] =
            "visto-americano-negado-214b-o-que-significa-e-como-pedir-de-novo";
    }

    public bool TryGetTargetSlug(string oldSlug, out string newSlug)
    {
        if (string.IsNullOrWhiteSpace(oldSlug))
        {
            newSlug = string.Empty;
            return false;
        }

        // Resolve up to 5 hops in case of chained renames, avoiding cycles
        string current = oldSlug.Trim();
        int hops = 0;
        while (hops < 5 && _redirects.TryGetValue(current, out var next) &&
               !string.IsNullOrWhiteSpace(next) &&
               !next.Equals(current, StringComparison.OrdinalIgnoreCase))
        {
            current = next;
            hops++;
        }

        if (hops > 0 && !current.Equals(oldSlug.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            newSlug = current;
            return true;
        }

        newSlug = string.Empty;
        return false;
    }

    public async Task InitializeAsync(IServiceProvider services)
    {
        try
        {
            var context = services.GetRequiredService<ApplicationDbContext>();
            if (!context.Database.IsRelational()) return;

            await context.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE IF NOT EXISTS ""ArticleSlugRedirects"" (
                    ""OldSlug"" text PRIMARY KEY,
                    ""NewSlug"" text NOT NULL,
                    ""UpdatedAt"" timestamp with time zone NOT NULL
                );
            ");

            // Ensure the initial 214(b) redirect is persisted in PostgreSQL
            await UpsertRedirectInDbAsync(
                context,
                "visto-americano-negado-214b-o-que-significa-e-como-reverter",
                "visto-americano-negado-214b-o-que-significa-e-como-pedir-de-novo"
            );

            // Load all stored redirects from PostgreSQL into memory
            using var command = context.Database.GetDbConnection().CreateCommand();
            command.CommandText = @"SELECT ""OldSlug"", ""NewSlug"" FROM ""ArticleSlugRedirects""";
            if (command.Connection?.State != System.Data.ConnectionState.Open)
            {
                await context.Database.OpenConnectionAsync();
            }

            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                string oldS = reader.GetString(0);
                string newS = reader.GetString(1);
                if (!string.IsNullOrWhiteSpace(oldS) && !string.IsNullOrWhiteSpace(newS))
                {
                    _redirects[oldS] = newS;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not initialize ArticleSlugRedirects table from DB; using in-memory redirects.");
        }
    }

    public async Task RegisterRedirectAsync(string oldSlug, string newSlug)
    {
        if (string.IsNullOrWhiteSpace(oldSlug) ||
            string.IsNullOrWhiteSpace(newSlug) ||
            oldSlug.Equals(newSlug, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        oldSlug = oldSlug.Trim().ToLowerInvariant();
        newSlug = newSlug.Trim().ToLowerInvariant();

        // If the article was renamed back to a slug that previously redirected elsewhere, remove that old redirect to prevent a loop
        _redirects.TryRemove(newSlug, out _);

        // Update any existing redirects that pointed to oldSlug so they point directly to newSlug
        foreach (var kvp in _redirects.ToArray())
        {
            if (kvp.Value.Equals(oldSlug, StringComparison.OrdinalIgnoreCase))
            {
                if (kvp.Key.Equals(newSlug, StringComparison.OrdinalIgnoreCase))
                {
                    _redirects.TryRemove(kvp.Key, out _);
                }
                else
                {
                    _redirects[kvp.Key] = newSlug;
                }
            }
        }

        _redirects[oldSlug] = newSlug;

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            if (!context.Database.IsRelational()) return;

            await context.Database.ExecuteSqlRawAsync(
                @"DELETE FROM ""ArticleSlugRedirects"" WHERE ""OldSlug"" = {0}",
                newSlug
            );

            await context.Database.ExecuteSqlRawAsync(
                @"UPDATE ""ArticleSlugRedirects"" SET ""NewSlug"" = {0}, ""UpdatedAt"" = {1} WHERE ""NewSlug"" = {2}",
                newSlug,
                DateTime.UtcNow,
                oldSlug
            );

            await UpsertRedirectInDbAsync(context, oldSlug, newSlug);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to persist slug redirect {OldSlug} -> {NewSlug} to DB; kept in memory.", oldSlug, newSlug);
        }
    }

    private static async Task UpsertRedirectInDbAsync(ApplicationDbContext context, string oldSlug, string newSlug)
    {
        await context.Database.ExecuteSqlRawAsync(@"
            INSERT INTO ""ArticleSlugRedirects"" (""OldSlug"", ""NewSlug"", ""UpdatedAt"")
            VALUES ({0}, {1}, {2})
            ON CONFLICT (""OldSlug"")
            DO UPDATE SET ""NewSlug"" = EXCLUDED.""NewSlug"", ""UpdatedAt"" = EXCLUDED.""UpdatedAt"";
        ", oldSlug, newSlug, DateTime.UtcNow);
    }
}
