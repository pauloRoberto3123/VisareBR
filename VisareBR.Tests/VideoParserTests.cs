using Xunit;
using VisareBR.Api.Controllers;

namespace VisareBR.Tests;

public class VideoParserTests
{
    [Theory]
    [InlineData("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ")]
    [InlineData("https://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ")]
    [InlineData("https://www.youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ")]
    [InlineData("https://www.instagram.com/p/CgXyZa0J2xG/?igsh=MTd2", "https://www.instagram.com/p/CgXyZa0J2xG/embed")]
    [InlineData("https://www.tiktok.com/@visarebr/video/7123456789012345678", "https://www.tiktok.com/embed/v2/7123456789012345678")]
    [InlineData("https://visarebr.com.br", "https://visarebr.com.br")]
    [InlineData("", "")]
    [InlineData("   ", "")]
    public void ParseEmbedUrl_ShouldReturnExpectedEmbedUrl(string input, string expected)
    {
        // Act
        var result = VideoParser.ParseEmbedUrl(input);

        // Assert
        Assert.Equal(expected, result);
    }
}
