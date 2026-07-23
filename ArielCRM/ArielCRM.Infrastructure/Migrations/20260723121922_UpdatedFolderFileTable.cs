using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedFolderFileTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IAccessibleByEveryone",
                table: "Folders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsHidden",
                table: "Folders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "Folders",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IAccessibleByEveryone",
                table: "DocumentFiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "DocumentFiles",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IAccessibleByEveryone",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "IsHidden",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "IAccessibleByEveryone",
                table: "DocumentFiles");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "DocumentFiles");
        }
    }
}
