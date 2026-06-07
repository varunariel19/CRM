using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDesignationTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "department_id",
                table: "designations",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_designations_department_id",
                table: "designations",
                column: "department_id");

            migrationBuilder.AddForeignKey(
                name: "FK_designations_departments_department_id",
                table: "designations",
                column: "department_id",
                principalTable: "departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_designations_departments_department_id",
                table: "designations");

            migrationBuilder.DropIndex(
                name: "IX_designations_department_id",
                table: "designations");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "designations");
        }
    }
}
