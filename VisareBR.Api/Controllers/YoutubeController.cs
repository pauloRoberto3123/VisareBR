using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Xml.Linq;
using VisareBR.Core.Data;

namespace VisareBR.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class YoutubeController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly HttpClient _httpClient;

    public YoutubeController(ApplicationDbContext context)
    {
        _context = context;
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
    }

    [HttpGet("videos")]
    public async Task<IActionResult> GetVideos()
    {
        try
        {
            var settings = await _context.Settings.FirstOrDefaultAsync();
            Console.WriteLine($"[DEBUG] Retrieved YoutubeChannelId: '{settings?.YoutubeChannelId}'");
            if (settings == null || string.IsNullOrWhiteSpace(settings.YoutubeChannelId))
            {
                Console.WriteLine("[DEBUG] Settings is null or YoutubeChannelId is empty.");
                return Ok(new List<object>());
            }

            var channelId = settings.YoutubeChannelId.Trim();
            if (!channelId.StartsWith("UC"))
            {
                var handle = channelId.StartsWith("@") ? channelId : "@" + channelId;
                try
                {
                    var lookupUrl = $"https://www.youtube.com/{handle}";
                    Console.WriteLine($"[DEBUG] Resolving handle at lookupUrl: '{lookupUrl}'");
                    var lookupResponse = await _httpClient.GetAsync(lookupUrl);
                    Console.WriteLine($"[DEBUG] Lookup response status: {lookupResponse.StatusCode}");
                    if (lookupResponse.IsSuccessStatusCode)
                    {
                        var html = await lookupResponse.Content.ReadAsStringAsync();
                        var match = System.Text.RegularExpressions.Regex.Match(html, @"(?:/channel/|browseId"":""|externalId"":""|channelId"":""|itemprop=""channelId"" content="")(UC[a-zA-Z0-9_-]{22})");
                        if (match.Success)
                        {
                            channelId = match.Groups[1].Value;
                            Console.WriteLine($"[DEBUG] Resolved handle to Channel ID: '{channelId}'");
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error resolving YouTube handle: {ex.Message}");
                }
            }

            string feedUrl = $"https://www.youtube.com/feeds/videos.xml?channel_id={channelId}";
            Console.WriteLine($"[DEBUG] Fetching RSS feedUrl: '{feedUrl}'");
            var response = await _httpClient.GetAsync(feedUrl);
            Console.WriteLine($"[DEBUG] RSS response status: {response.StatusCode}");
            if (!response.IsSuccessStatusCode)
            {
                return Ok(new List<object>());
            }

            var content = await response.Content.ReadAsStringAsync();
            var doc = XDocument.Parse(content);
            XNamespace ns = "http://www.w3.org/2005/Atom";
            XNamespace yt = "http://www.youtube.com/xml/schemas/2015";
            XNamespace media = "http://search.yahoo.com/mrss/";

            var videos = doc.Descendants(ns + "entry")
                .Select(e => {
                    var videoId = e.Element(yt + "videoId")?.Value ?? "";
                    return new
                    {
                        VideoId = videoId,
                        Title = e.Element(ns + "title")?.Value ?? "",
                        Published = DateTime.TryParse(e.Element(ns + "published")?.Value, out var date) ? date : DateTime.UtcNow,
                        VideoUrl = $"https://www.youtube.com/watch?v={videoId}",
                        ThumbnailUrl = $"https://img.youtube.com/vi/{videoId}/hqdefault.jpg"
                    };
                })
                .Take(8)
                .ToList();

            return Ok(videos);
        }
        catch (Exception ex)
        {
            // Fail silently or log error
            Console.WriteLine($"Error fetching YouTube RSS: {ex.Message}");
            return Ok(new List<object>());
        }
    }
}
