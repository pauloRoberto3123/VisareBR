using Xunit;
using VisareBR.Api.Controllers;

namespace VisareBR.Tests;

public class SlugGeneratorTests
{
    [Theory]
    [InlineData("Visto Americano", "visto-americano")]
    [InlineData("Visto Americano: Renovação Simplificada", "visto-americano-renovacao-simplificada")]
    [InlineData("Como tirar o visto aos 14 anos?!", "como-tirar-o-visto-aos-14-anos")]
    [InlineData("  Espaços   Duplos  ", "espacos-duplos")]
    [InlineData("---Hifens-Repetidos---", "hifens-repetidos")]
    [InlineData("", "")]
    [InlineData("   ", "")]
    public void GenerateSlug_ShouldReturnExpectedSlug(string input, string expected)
    {
        // Act
        var result = SlugGenerator.GenerateSlug(input);

        // Assert
        Assert.Equal(expected, result);
    }

    [Fact]
    public void GenerateSlug_ShouldTruncateCorrectly()
    {
        // Arrange
        var longTitle = new string('a', 150);

        // Act
        var result = SlugGenerator.GenerateSlug(longTitle);

        // Assert
        Assert.Equal(100, result.Length);
    }
}
