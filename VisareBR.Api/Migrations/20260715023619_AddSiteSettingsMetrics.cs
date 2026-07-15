using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSiteSettingsMetrics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Metric1Label",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metric1Value",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metric2Label",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metric2Value",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metric3Label",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Metric3Value",
                table: "Settings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Metric1Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Metric1Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Metric2Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Metric2Value",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Metric3Label",
                table: "Settings");

            migrationBuilder.DropColumn(
                name: "Metric3Value",
                table: "Settings");
        }
    }
}
