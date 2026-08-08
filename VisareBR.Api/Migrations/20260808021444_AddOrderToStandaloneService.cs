using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderToStandaloneService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Order",
                table: "StandaloneServices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("55555555-5555-5555-5555-555555555555"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("66666666-6666-6666-6666-666666666666"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("77777777-7777-7777-7777-777777777777"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("88888888-8888-8888-8888-888888888888"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("99999999-9999-9999-9999-999999999999"),
                column: "Order",
                value: 0);

            migrationBuilder.UpdateData(
                table: "StandaloneServices",
                keyColumn: "Id",
                keyValue: new Guid("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                column: "Order",
                value: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Order",
                table: "StandaloneServices");
        }
    }
}
