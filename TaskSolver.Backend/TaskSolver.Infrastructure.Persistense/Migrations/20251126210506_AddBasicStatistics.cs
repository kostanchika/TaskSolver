using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class AddBasicStatistics : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserStatistics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    TotalSolutions = table.Column<int>(type: "integer", nullable: false),
                    GoodSolutions = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserStatistics", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TaskRatingHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TaskId = table.Column<Guid>(type: "uuid", nullable: false),
                    Difference = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserStatisticsId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskRatingHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskRatingHistory_UserStatistics_UserStatisticsId",
                        column: x => x.UserStatisticsId,
                        principalTable: "UserStatistics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskRatingHistory_UserStatisticsId",
                table: "TaskRatingHistory",
                column: "UserStatisticsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskRatingHistory");

            migrationBuilder.DropTable(
                name: "UserStatistics");
        }
    }
}
