using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpatedNoteTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "created_by",
                table: "notes",
                newName: "created_by_name");

            migrationBuilder.AddColumn<string>(
                name: "created_by_id",
                table: "notes",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_by_id",
                table: "notes");

            migrationBuilder.RenameColumn(
                name: "created_by_name",
                table: "notes",
                newName: "created_by");
        }
    }
}
