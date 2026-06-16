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
    public DbSet<Plan> Plans { get; set; }
    public DbSet<PlanBenefit> PlanBenefits { get; set; }
    public DbSet<PlanPricingTier> PlanPricingTiers { get; set; }
    public DbSet<StandaloneService> StandaloneServices { get; set; }

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

        // Plan Pricing precision configuration
        builder.Entity<PlanPricingTier>()
            .Property(t => t.TotalPrice)
            .HasPrecision(18, 2);
            
        builder.Entity<StandaloneService>()
            .Property(s => s.Price)
            .HasPrecision(18, 2);

        // Seed Data: Plans
        builder.Entity<Plan>().HasData(
            new Plan { Id = 1, Name = "Padrão", ProcessingTime = "4 dias úteis", IsActive = true },
            new Plan { Id = 2, Name = "Intermediário", ProcessingTime = "2 dias úteis", IsActive = true },
            new Plan { Id = 3, Name = "Premium", ProcessingTime = "24 horas", IsActive = true },
            new Plan { Id = 4, Name = "VIP", ProcessingTime = "24 horas", IsActive = true }
        );

        // Seed Data: Plan Benefits
        builder.Entity<PlanBenefit>().HasData(
            // Padrão
            new PlanBenefit { Id = 1, PlanId = 1, Description = "Avaliação de perfil", IsIncluded = true },
            new PlanBenefit { Id = 2, PlanId = 1, Description = "Preenchimento do DS-160", IsIncluded = true },
            new PlanBenefit { Id = 3, PlanId = 1, Description = "Criação de conta no consulado", IsIncluded = true },
            new PlanBenefit { Id = 4, PlanId = 1, Description = "Defesa em caso de negativa", IsIncluded = false },
            new PlanBenefit { Id = 5, PlanId = 1, Description = "Atendimento exclusivo", IsIncluded = false },
            // Intermediário
            new PlanBenefit { Id = 6, PlanId = 2, Description = "Avaliação de perfil", IsIncluded = true },
            new PlanBenefit { Id = 7, PlanId = 2, Description = "Preenchimento do DS-160", IsIncluded = true },
            new PlanBenefit { Id = 8, PlanId = 2, Description = "Criação de conta no consulado", IsIncluded = true },
            new PlanBenefit { Id = 9, PlanId = 2, Description = "Defesa em caso de negativa", IsIncluded = true },
            new PlanBenefit { Id = 10, PlanId = 2, Description = "Atendimento exclusivo", IsIncluded = false },
            // Premium
            new PlanBenefit { Id = 11, PlanId = 3, Description = "Tudo do Intermediário", IsIncluded = true },
            new PlanBenefit { Id = 12, PlanId = 3, Description = "Atendimento exclusivo", IsIncluded = true },
            new PlanBenefit { Id = 13, PlanId = 3, Description = "Isenção de taxa na 1ª renovação", IsIncluded = true },
            new PlanBenefit { Id = 14, PlanId = 3, Description = "Representação e eTA Canadá", IsIncluded = false },
            // VIP
            new PlanBenefit { Id = 15, PlanId = 4, Description = "Tudo do Premium", IsIncluded = true },
            new PlanBenefit { Id = 16, PlanId = 4, Description = "Representação em processos", IsIncluded = true },
            new PlanBenefit { Id = 17, PlanId = 4, Description = "eTA Canadá grátis", IsIncluded = true },
            new PlanBenefit { Id = 18, PlanId = 4, Description = "Isenção em 2 renovações", IsIncluded = true }
        );

        // Seed Data: Plan Pricing Tiers (1 to 2 applicants initially)
        builder.Entity<PlanPricingTier>().HasData(
            new PlanPricingTier { Id = 1, PlanId = 1, ApplicantCount = 1, TotalPrice = 549.00m },
            new PlanPricingTier { Id = 2, PlanId = 1, ApplicantCount = 2, TotalPrice = 999.00m },
            new PlanPricingTier { Id = 3, PlanId = 2, ApplicantCount = 1, TotalPrice = 749.00m },
            new PlanPricingTier { Id = 4, PlanId = 2, ApplicantCount = 2, TotalPrice = 1399.00m },
            new PlanPricingTier { Id = 5, PlanId = 3, ApplicantCount = 1, TotalPrice = 949.00m },
            new PlanPricingTier { Id = 6, PlanId = 3, ApplicantCount = 2, TotalPrice = 1799.00m },
            new PlanPricingTier { Id = 7, PlanId = 4, ApplicantCount = 1, TotalPrice = 1299.00m },
            new PlanPricingTier { Id = 8, PlanId = 4, ApplicantCount = 2, TotalPrice = 2399.00m }
        );

        // Seed Data: Standalone Services
        // Usando Guids fixos para garantir que as migrações sejam aplicadas de forma consistente
        builder.Entity<StandaloneService>().HasData(
            new StandaloneService { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "Serviço de Passaporte", Price = 250.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Emissão do eTA (eletrônico canadense)", Price = 250.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("33333333-3333-3333-3333-333333333333"), Name = "Emissão do ESTA (eletrônico americano)", Price = 250.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("44444444-4444-4444-4444-444444444444"), Name = "Serviço de Entrega Premium (renovação sem entrevista)", Price = 250.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("55555555-5555-5555-5555-555555555555"), Name = "Visto Canadá Turismo", Price = 490.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("66666666-6666-6666-6666-666666666666"), Name = "Reversão de Negativa", Price = 500.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("77777777-7777-7777-7777-777777777777"), Name = "Somente Agendamento", Price = 250.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("88888888-8888-8888-8888-888888888888"), Name = "Antecipação de Entrevista", Price = 150.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("99999999-9999-9999-9999-999999999999"), Name = "Simulação de Entrevista", Price = 500.00m, IsActive = true },
            new StandaloneService { Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), Name = "Revisão do DS-160", Price = 350.00m, IsActive = true }
        );
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
