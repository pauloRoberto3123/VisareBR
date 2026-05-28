using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var context = new ApplicationDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<ApplicationDbContext>>());

        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        // 1. Ensure Database is created
        await context.Database.MigrateAsync();

        // 2. Seed Admin User
        string adminEmail = "admin@visarebr.com.br";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "Administrador VisareBR",
                EmailConfirmed = true
            };
            await userManager.CreateAsync(adminUser, "Visare@2025!"); // Change this password later!
        }

        // 3. Seed Site Settings
        if (!await context.Settings.AnyAsync())
        {
            context.Settings.Add(new SiteSettings
            {
                WhatsappNumber = "5511948130382",
                WhatsappDefaultMessage = "Olá! Vi o site da VisareBR e gostaria de iniciar meu processo de visto.",
                CompanyEmail = "contato@visarebr.com.br",
                Cnpj = "00.000.000/0001-00",
                Address = "São Paulo, SP - Atendimento Online para todo o Brasil"
            });
        }

        // 4. Seed Blog Posts
        if (!await context.BlogPosts.AnyAsync())
        {
            context.BlogPosts.AddRange(
                new BlogPost
                {
                    Title = "5 Motivos que levam à negativa do Visto Americano",
                    Summary = "Descubra os erros mais comuns cometidos no formulário DS-160 e como evitá-los para garantir sua aprovação.",
                    Content = "O processo de solicitação do visto americano é rigoroso. Entre os principais motivos de negativa estão: \n1. Erros no preenchimento do DS-160.\n2. Falta de comprovação de vínculos com o Brasil.\n3. Inconsistência nas respostas da entrevista.\n4. Renda incompatível com a viagem.\n5. Falta de planejamento.\n\nNossa assessoria foca justamente em mitigar esses riscos através de uma análise minuciosa do seu perfil.",
                    AuthorId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    ImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
                },
                new BlogPost
                {
                    Title = "Renovação de Visto: Preciso fazer entrevista?",
                    Summary = "Muitas pessoas têm dúvida se precisam ir ao consulado novamente. Entenda as regras atuais para renovação.",
                    Content = "Atualmente, a maioria das renovações de visto de turismo (B1/B2) que venceram há menos de 48 meses podem ser feitas sem a necessidade de uma nova entrevista presencial. No entanto, é necessário o envio do passaporte e a conferência de dados no CASV. Facilitamos todo esse trâmite logístico para você.",
                    AuthorId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    ImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800"
                }
            );
        }

        // 5. Seed Evaluations (Testimonials)
        if (!await context.Evaluations.AnyAsync())
        {
            context.Evaluations.AddRange(
                new Evaluation
                {
                    UserName = "Ana Paula Moreira",
                    Comment = "Experiência excelente com a VisareBR! Renovei meu visto e das minhas irmãs com total tranquilidade. Atendimento claro, rápido e super atencioso.",
                    Rating = 5,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1)
                },
                new Evaluation
                {
                    UserName = "Carlos Alberto Silva",
                    Comment = "Tive o visto negado duas vezes sozinho. Com a assessoria da VisareBR, entendi o que estava errando e finalmente consegui a aprovação!",
                    Rating = 5,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new Evaluation
                {
                    UserName = "Isabela Clebis",
                    Comment = "Impecável do início ao fim. Me orientaram em cada etapa e fizeram tudo à distância, não tive nenhum trabalho.",
                    Rating = 5,
                    IsApproved = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                }
            );
        }

        await context.SaveChangesAsync();
    }
}
