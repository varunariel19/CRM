using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updatedLead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "contact_id",
                table: "leads",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_leads_contact_id",
                table: "leads",
                column: "contact_id");

            migrationBuilder.AddForeignKey(
                name: "FK_leads_contacts_contact_id",
                table: "leads",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_leads_contacts_contact_id",
                table: "leads");

            migrationBuilder.DropIndex(
                name: "IX_leads_contact_id",
                table: "leads");

            migrationBuilder.DropColumn(
                name: "contact_id",
                table: "leads");
        }
    }
}
