using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class ConstructorChatMessageRunIo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProgramStderr",
                table: "ChatMessage",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProgramStdin",
                table: "ChatMessage",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProgramStdout",
                table: "ChatMessage",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProgramStderr",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "ProgramStdin",
                table: "ChatMessage");

            migrationBuilder.DropColumn(
                name: "ProgramStdout",
                table: "ChatMessage");
        }
    }
}
