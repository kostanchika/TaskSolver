using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class AddLanguageSolutionSupporting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileExtension",
                table: "ProgrammingLanguages",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Interpretor",
                table: "ProgrammingLanguages",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileExtension",
                table: "ProgrammingLanguages");

            migrationBuilder.DropColumn(
                name: "Interpretor",
                table: "ProgrammingLanguages");
        }
    }
}
