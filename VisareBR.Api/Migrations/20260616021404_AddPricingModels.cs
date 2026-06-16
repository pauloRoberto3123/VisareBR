using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPricingModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Plans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProcessingTime = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Plans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlanBenefits",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanId = table.Column<int>(type: "integer", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsIncluded = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanBenefits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanBenefits_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlanPricingTiers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlanId = table.Column<int>(type: "integer", nullable: false),
                    ApplicantCount = table.Column<int>(type: "integer", nullable: false),
                    TotalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlanPricingTiers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlanPricingTiers_Plans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Plans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Plans",
                columns: new[] { "Id", "IsActive", "Name", "ProcessingTime" },
                values: new object[,]
                {
                    { 1, true, "Padrão", "4 dias úteis" },
                    { 2, true, "Intermediário", "2 dias úteis" },
                    { 3, true, "Premium", "24 horas" },
                    { 4, true, "VIP", "24 horas" }
                });

            migrationBuilder.InsertData(
                table: "PlanBenefits",
                columns: new[] { "Id", "Description", "IsIncluded", "PlanId" },
                values: new object[,]
                {
                    { 1, "Avaliação de perfil", true, 1 },
                    { 2, "Preenchimento do DS-160", true, 1 },
                    { 3, "Criação de conta no consulado", true, 1 },
                    { 4, "Defesa em caso de negativa", false, 1 },
                    { 5, "Atendimento exclusivo", false, 1 },
                    { 6, "Avaliação de perfil", true, 2 },
                    { 7, "Preenchimento do DS-160", true, 2 },
                    { 8, "Criação de conta no consulado", true, 2 },
                    { 9, "Defesa em caso de negativa", true, 2 },
                    { 10, "Atendimento exclusivo", false, 2 },
                    { 11, "Tudo do Intermediário", true, 3 },
                    { 12, "Atendimento exclusivo", true, 3 },
                    { 13, "Isenção de taxa na 1ª renovação", true, 3 },
                    { 14, "Representação e eTA Canadá", false, 3 },
                    { 15, "Tudo do Premium", true, 4 },
                    { 16, "Representação em processos", true, 4 },
                    { 17, "eTA Canadá grátis", true, 4 },
                    { 18, "Isenção em 2 renovações", true, 4 }
                });

            migrationBuilder.InsertData(
                table: "PlanPricingTiers",
                columns: new[] { "Id", "ApplicantCount", "PlanId", "TotalPrice" },
                values: new object[,]
                {
                    { 1, 1, 1, 549.00m },
                    { 2, 2, 1, 999.00m },
                    { 3, 1, 2, 749.00m },
                    { 4, 2, 2, 1399.00m },
                    { 5, 1, 3, 949.00m },
                    { 6, 2, 3, 1799.00m },
                    { 7, 1, 4, 1299.00m },
                    { 8, 2, 4, 2399.00m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlanBenefits_PlanId",
                table: "PlanBenefits",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_PlanPricingTiers_PlanId",
                table: "PlanPricingTiers",
                column: "PlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlanBenefits");

            migrationBuilder.DropTable(
                name: "PlanPricingTiers");

            migrationBuilder.DropTable(
                name: "Plans");
        }
    }
}
