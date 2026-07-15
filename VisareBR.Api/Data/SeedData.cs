using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VisareBR.Core.Data;
using VisareBR.Core.Entities;

namespace VisareBR.Api.Data;

public static class SeedData
{
    public static async Task Initialize(IServiceProvider serviceProvider)
    {
        using var context = serviceProvider.GetRequiredService<ApplicationDbContext>();

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
                WhatsappNumber = "5519998448417",
                WhatsappDefaultMessage = "Olá! Vi o site da VisareBR e gostaria de iniciar meu processo de visto.",
                CompanyEmail = "contato@visarebr.com.br",
                Cnpj = "00.000.000/0001-00",
                Address = "São Paulo, SP - Atendimento Online para todo o Brasil",
                Metric1Value = "+5000",
                Metric1Label = "Vistos Aprovados",
                Metric2Value = "98%",
                Metric2Label = "Índice de Sucesso",
                Metric3Value = "Suporte 24/7",
                Metric3Label = "Atendimento Especializado"
            });
        }

        // 4. Seed Articles
        if (!await context.Articles.AnyAsync())
        {
            context.Articles.AddRange(
                new Article
                {
                    Title = "5 Motivos que levam à negativa do Visto Americano",
                    Slug = "5-motivos-que-levam-a-negativa-do-visto-americano",
                    Summary = "Descubra os erros mais comuns cometidos no formulário DS-160 e como evitá-los para garantir sua aprovação.",
                    ReadTimeMinutes = 5,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
                    MetaTitle = "5 Motivos de Negativa de Visto Americano e Como Evitar",
                    MetaDescription = "Saiba quais são os principais motivos que fazem o Consulado Americano negar o visto e entenda como nossa assessoria pode te ajudar.",
                    Tags = new List<string> { "VistoAmericano", "NegativaDeVisto", "DS160" },
                    AuthorId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    ContentBlocks = new List<ArticleBlock>
                    {
                        new TextBlock
                        {
                            Order = 0,
                            Content = "<h2>O processo de solicitação do visto americano é rigoroso.</h2><p>Entender os critérios de avaliação do cônsul é fundamental para evitar frustrações. Abaixo, detalhamos os principais motivos de recusa.</p>"
                        },
                        new TextBlock
                        {
                            Order = 1,
                            Content = "<h3>1. Erros no preenchimento do formulário DS-160</h3><p>O DS-160 é a sua principal apresentação para o consulado. Informações incompletas, erros de digitação ou contradições são motivos imediatos para recusa.</p><h3>2. Falta de comprovação de vínculos fortes com o Brasil</h3><p>A lei de imigração americana (Seção 214b) presume que todo solicitante de visto tem intenção de imigrar, a menos que comprove o contrário. Apresentar poucos vínculos de emprego, estudo ou bens no Brasil resulta em visto negado.</p>"
                        },
                        new ImageBlock
                        {
                            Order = 2,
                            ImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800",
                            AltText = "Passaporte e formulário DS-160 para visto americano"
                        },
                        new TextBlock
                        {
                            Order = 3,
                            Content = "<h3>3. Inconsistência nas respostas da entrevista</h3><p>Na hora da entrevista, o cônsul confrontará o que você diz com o que foi preenchido no DS-160. Nervosismo e respostas evasivas geram desconfiança.</p><h3>4. Renda incompatível com a viagem</h3><p>Você precisa provar que tem recursos financeiros suficientes para custear toda a sua estadia nos Estados Unidos sem precisar trabalhar lá.</p>"
                        },
                        new VideoBlock
                        {
                            Order = 4,
                            SourceUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                            EmbedData = "https://www.youtube.com/embed/dQw4w9WgXcQ"
                        },
                        new ButtonBlock
                        {
                            Order = 5,
                            Label = "Iniciar Assessoria de Visto",
                            TargetUrl = "/ds-160",
                            HexColorCode = "#0A3161"
                        }
                    }
                },
                new Article
                {
                    Title = "Renovação de Visto: Preciso fazer entrevista?",
                    Slug = "renovacao-de-visto-preciso-fazer-entrevista",
                    Summary = "Muitas pessoas têm dúvida se precisam ir ao consulado novamente. Entenda as regras atuais para renovação.",
                    ReadTimeMinutes = 3,
                    FeaturedImageUrl = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800",
                    MetaTitle = "Como Funciona a Renovação do Visto Americano",
                    MetaDescription = "Tire suas dúvidas sobre a renovação de visto de turismo americano e descubra se você se enquadra na isenção de entrevista presencial.",
                    Tags = new List<string> { "RenovacaoVisto", "DicasConsular", "EntrevistaVisto" },
                    AuthorId = adminUser.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    ContentBlocks = new List<ArticleBlock>
                    {
                        new TextBlock
                        {
                            Order = 0,
                            Content = "<h2>Renovar o visto americano é muito mais simples!</h2><p>Atualmente, a maioria das renovações de visto de turismo e negócios (B1/B2) vencidos há menos de 48 meses dispensam a necessidade de agendar uma nova entrevista presencial no Consulado ou na Embaixada.</p>"
                        },
                        new TextBlock
                        {
                            Order = 1,
                            Content = "<h3>Quais são os requisitos para a isenção de entrevista?</h3><ul><li>O visto anterior deve ter sido emitido após os 14 anos de idade.</li><li>O visto não pode ter sido roubado, perdido ou cancelado.</li><li>A última solicitação de visto não pode ter sido recusada.</li></ul>"
                        },
                        new ButtonBlock
                        {
                            Order = 2,
                            Label = "Fazer Renovação Simplificada",
                            TargetUrl = "/ds-160",
                            HexColorCode = "#C5A880"
                        }
                    }
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
