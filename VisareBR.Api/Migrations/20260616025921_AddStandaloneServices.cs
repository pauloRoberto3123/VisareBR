using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStandaloneServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StandaloneServices",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StandaloneServices", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "StandaloneServices",
                columns: new[] { "Id", "IsActive", "Name", "Price" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), true, "Serviço de Passaporte", 250.00m },
                    { new Guid("22222222-2222-2222-2222-222222222222"), true, "Emissão do eTA (eletrônico canadense)", 250.00m },
                    { new Guid("33333333-3333-3333-3333-333333333333"), true, "Emissão do ESTA (eletrônico americano)", 250.00m },
                    { new Guid("44444444-4444-4444-4444-444444444444"), true, "Serviço de Entrega Premium (renovação sem entrevista)", 250.00m },
                    { new Guid("55555555-5555-5555-5555-555555555555"), true, "Visto Canadá Turismo", 490.00m },
                    { new Guid("66666666-6666-6666-6666-666666666666"), true, "Reversão de Negativa", 500.00m },
                    { new Guid("77777777-7777-7777-7777-777777777777"), true, "Somente Agendamento", 250.00m },
                    { new Guid("88888888-8888-8888-8888-888888888888"), true, "Antecipação de Entrevista", 150.00m },
                    { new Guid("99999999-9999-9999-9999-999999999999"), true, "Simulação de Entrevista", 500.00m },
                    { new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), true, "Revisão do DS-160", 350.00m }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StandaloneServices");
        }
    }
}
