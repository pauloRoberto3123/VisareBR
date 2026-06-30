using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VisareBR.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthorNameToBlogPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AuthorName",
                table: "BlogPosts",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuthorName",
                table: "BlogPosts");
        }
    }
}
