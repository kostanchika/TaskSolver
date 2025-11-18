using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class AddProgrammingTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProgrammingTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Degree = table.Column<int>(type: "integer", nullable: false),
                    Keywords = table.Column<List<string>>(type: "text[]", nullable: false),
                    Output = table.Column<string>(type: "text", nullable: false),
                    Hints = table.Column<List<string>>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProgrammingTasks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "TaskExample",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Input = table.Column<string>(type: "text", nullable: false),
                    Output = table.Column<string>(type: "text", nullable: false),
                    ProgrammingTaskId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskExample", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskExample_ProgrammingTasks_ProgrammingTaskId",
                        column: x => x.ProgrammingTaskId,
                        principalTable: "ProgrammingTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskInput",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Constraints = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ProgrammingTaskId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskInput", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskInput_ProgrammingTasks_ProgrammingTaskId",
                        column: x => x.ProgrammingTaskId,
                        principalTable: "ProgrammingTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TaskTest",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Input = table.Column<string>(type: "text", nullable: false),
                    Output = table.Column<string>(type: "text", nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    ProgrammingTaskId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskTest", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TaskTest_ProgrammingTasks_ProgrammingTaskId",
                        column: x => x.ProgrammingTaskId,
                        principalTable: "ProgrammingTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TaskExample_ProgrammingTaskId",
                table: "TaskExample",
                column: "ProgrammingTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskInput_ProgrammingTaskId",
                table: "TaskInput",
                column: "ProgrammingTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskTest_ProgrammingTaskId",
                table: "TaskTest",
                column: "ProgrammingTaskId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaskExample");

            migrationBuilder.DropTable(
                name: "TaskInput");

            migrationBuilder.DropTable(
                name: "TaskTest");

            migrationBuilder.DropTable(
                name: "ProgrammingTasks");
        }
    }
}
