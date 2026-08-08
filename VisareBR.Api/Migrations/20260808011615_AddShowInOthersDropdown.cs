using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddShowInOthersDropdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowInOthersDropdown",
                table: "Articles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowInOthersDropdown",
                table: "Articles");
        }
    }
}
