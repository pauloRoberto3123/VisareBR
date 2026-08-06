using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDescriptionAndFeaturesToStandaloneServices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "StandaloneServices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Features",
                table: "StandaloneServices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IconName",
                table: "StandaloneServices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                columns: new[] { "Description", "Features", "IconName" },
                values: new object[] { "", "", "Briefcase" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "StandaloneServices");

            migrationBuilder.DropColumn(
                name: "Features",
                table: "StandaloneServices");

            migrationBuilder.DropColumn(
                name: "IconName",
                table: "StandaloneServices");
        }
    }
}
