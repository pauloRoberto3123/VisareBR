using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Microsoft.Extensions.Configuration;
using System.Security.Cryptography;
using System.Text;
using VisareBR.Core.Entities;

namespace VisareBR.Core.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    private readonly IConfiguration _configuration;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, IConfiguration configuration)
        : base(options)
    {
        _configuration = configuration;
    }

    public DbSet<BlogPost> BlogPosts { get; set; }
    public DbSet<Evaluation> Evaluations { get; set; }
    public DbSet<SiteSettings> Settings { get; set; }
    public DbSet<Ds160Submission> Ds160Submissions { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Custom configurations if needed
        builder.Entity<BlogPost>()
            .HasOne(p => p.Author)
            .WithMany()
            .HasForeignKey(p => p.AuthorId);
            
        builder.Entity<Evaluation>()
            .Property(e => e.Rating)
            .IsRequired();

        // Security: Configure AES Encryption for the PassportNumber column
        // The key is now securely loaded from Render Environment Variables
        var encryptionKey = _configuration["EncryptionKey"] ?? "VisareBR_Super_Secret_Key_2026!!"; // Fallback for local dev

        var passportEncryptor = new ValueConverter<string, string>(
            v => Encrypt(v, encryptionKey),
            v => Decrypt(v, encryptionKey)
        );

        builder.Entity<Ds160Submission>()
            .Property(e => e.PassportNumber)
            .HasConversion(passportEncryptor);

        // Store the deeply nested form data natively as JSONB in PostgreSQL
        builder.Entity<Ds160Submission>()
            .Property(e => e.JsonData)
            .HasColumnType("jsonb");
    }

    private static string Encrypt(string clearText, string key)
    {
        if (string.IsNullOrEmpty(clearText)) return clearText;
        using Aes aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));
        aes.IV = new byte[16]; // Fixed IV for simplicity. Use random IV + cipher in production.
        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using MemoryStream ms = new MemoryStream();
        using CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);
        using (StreamWriter sw = new StreamWriter(cs)) { sw.Write(clearText); }
        return Convert.ToBase64String(ms.ToArray());
    }

    private static string Decrypt(string cipherText, string key)
    {
        if (string.IsNullOrEmpty(cipherText)) return cipherText;
        using Aes aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(key.PadRight(32).Substring(0, 32));
        aes.IV = new byte[16];
        var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
        using MemoryStream ms = new MemoryStream(Convert.FromBase64String(cipherText));
        using CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
        using StreamReader sr = new StreamReader(cs);
        return sr.ReadToEnd();
    }
}
