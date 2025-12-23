using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaskSolver.Infrastructure.Persistense.Migrations
{
    /// <inheritdoc />
    public partial class AddResultsToSolveRecord : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SolveRecordId",
                table: "TestResult",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "SolveRecord",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_TestResult_SolveRecordId",
                table: "TestResult",
                column: "SolveRecordId");

            migrationBuilder.AddForeignKey(
                name: "FK_TestResult_SolveRecord_SolveRecordId",
                table: "TestResult",
                column: "SolveRecordId",
                principalTable: "SolveRecord",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TestResult_SolveRecord_SolveRecordId",
                table: "TestResult");

            migrationBuilder.DropIndex(
                name: "IX_TestResult_SolveRecordId",
                table: "TestResult");

            migrationBuilder.DropColumn(
                name: "SolveRecordId",
                table: "TestResult");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "SolveRecord");
        }
    }
}
