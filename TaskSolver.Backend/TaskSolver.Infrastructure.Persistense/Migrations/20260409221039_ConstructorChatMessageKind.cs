using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class ConstructorChatMessageKind : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MessageKind",
                table: "ChatMessage",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MessageKind",
                table: "ChatMessage");
        }
    }
}
