using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedContactAndProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_contact_id",
                table: "projects");

            migrationBuilder.AddColumn<string>(
                name: "ContactId1",
                table: "projects",
                type: "character varying(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_contact_id",
                table: "projects",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "IX_projects_ContactId1",
                table: "projects",
                column: "ContactId1",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_projects_contacts_ContactId1",
                table: "projects",
                column: "ContactId1",
                principalTable: "contacts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_ContactId1",
                table: "projects");

            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_contact_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_ContactId1",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "ContactId1",
                table: "projects");

            migrationBuilder.CreateIndex(
                name: "IX_projects_contact_id",
                table: "projects",
                column: "contact_id",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id");
        }
    }
}
