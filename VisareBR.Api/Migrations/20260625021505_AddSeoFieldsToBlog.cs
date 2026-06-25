using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSeoFieldsToBlog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Tags",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleSocial",
                table: "BlogPosts",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TitleWeb",
                table: "BlogPosts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Tags",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "TitleSocial",
                table: "BlogPosts");

            migrationBuilder.DropColumn(
                name: "TitleWeb",
                table: "BlogPosts");
        }
    }
}
