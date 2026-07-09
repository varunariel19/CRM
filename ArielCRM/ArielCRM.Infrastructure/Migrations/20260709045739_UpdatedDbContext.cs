using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedDbContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
