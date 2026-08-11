using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGoogleAnalyticsId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GoogleAnalyticsId",
                table: "Settings",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GoogleAnalyticsId",
                table: "Settings");
        }
    }
}
