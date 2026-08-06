using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFaqItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Faqs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Question = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<string>(type: "text", nullable: false),
                    DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faqs", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Faqs",
                columns: new[] { "Id", "Answer", "Category", "DisplayOrder", "IsActive", "Question" },
                values: new object[,]
                {
                    { 1, "O visto americano é um documento que permite a entrada nos Estados Unidos para diversos fins, como turismo, negócios, estudo ou trabalho. Brasileiros precisam de visto para entrar nos EUA. A VisareBR auxilia em todo o processo de solicitação.", "Geral", 1, true, "O que é o visto americano e quem precisa dele?" },
                    { 2, "O tempo varia conforme a demanda do consulado. Após o pagamento das taxas e preenchimento do DS-160, é possível agendar a entrevista. A disponibilidade de datas varia entre consulados. Após a entrevista, se aprovado, o passaporte com o visto geralmente é devolvido em até 10 dias úteis.", "Geral", 2, true, "Quanto tempo demora para conseguir o visto americano?" },
                    { 3, "O visto B1/B2 é o mais comum e serve tanto para turismo quanto para negócios. O B1 (negócios) é para reuniões, conferências e consultas. O B2 (turismo) é para férias, visitar amigos/família e tratamento médico. Geralmente, ambos vêm juntos no mesmo visto.", "Processo", 3, true, "Qual a diferença entre visto de turismo e visto de negócios?" },
                    { 4, "Sim, a VisareBR conta com serviços de antecipação de datas para os próximos 60 dias. Temos um monitoramento de datas constante em que conseguimos pegar datas que liberam por diversos motivos como cancelamento de agendamento, reagendamento ou novos lotes de datas disponibilizados pelo Consulado.", "Agendamento", 4, true, "É possível adiantar as datas da entrevista?" },
                    { 5, "Você precisará de: passaporte válido, formulário DS-160 preenchido, comprovante de pagamento das taxas (MRV), foto recente no padrão americano, e documentos que comprovem vínculos com o Brasil (emprego, propriedades, vínculos familiares) e capacidade financeira para a viagem.", "Documentos", 5, true, "Quais documentos preciso para solicitar o visto americano?" },
                    { 6, "O DS-160 é o formulário de solicitação de visto não-imigrante. Deve ser preenchido online em inglês no site do Departamento de Estado dos EUA. Ele contém informações pessoais, sobre a viagem, educação, trabalho e segurança. É importante preencher com atenção e veracidade. A VisareBR auxilia no preenchimento correto.", "Documentos", 6, true, "O que é o formulário DS-160?" },
                    { 7, "A entrevista é presencial no consulado americano. Você apresentará seus documentos ao oficial consular, que fará perguntas sobre sua viagem, vínculos com o Brasil e situação financeira. É importante ser honesto e objetivo nas respostas. A VisareBR prepara você com orientações específicas sobre a entrevista.", "Entrevista", 7, true, "Como funciona a entrevista no consulado?" },
                    { 8, "Os principais motivos incluem: falta de comprovação de vínculos com o Brasil, suspeita de intenção de imigração, informações inconsistentes ou falsas no formulário ou entrevista, falta de recursos financeiros comprovados, e histórico de violação de leis de imigração. A preparação adequada reduz muito o risco de negativa.", "Entrevista", 8, true, "Quais são os principais motivos de negativa de visto?" },
                    { 9, "Não é obrigatório, mas uma assessoria especializada como a VisareBR aumenta significativamente suas chances de aprovação. Auxiliamos no preenchimento correto do DS-160, análise de documentos, preparação para a entrevista e acompanhamento de todo o processo, evitando erros que podem causar negativas.", "Geral", 9, true, "Preciso de assessoria para tirar o visto americano?" },
                    { 10, "Sim, em alguns casos é possível renovar através do programa de Renovação sem Entrevista. Alguns dos requisitos são ter o visto anterior ainda válido ou vencido há menos de 48 meses, mesma categoria de visto, e nunca ter tido problemas de imigração nos EUA. A VisareBR verifica sua elegibilidade.", "Processo", 10, true, "É possível renovar o visto americano sem entrevista?" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Faqs");
        }
    }
}
