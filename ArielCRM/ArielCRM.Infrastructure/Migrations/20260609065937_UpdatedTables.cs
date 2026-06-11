using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_deals_contacts_contact_id",
                table: "deals");

            migrationBuilder.DropForeignKey(
                name: "FK_projects_deals_deal_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_deal_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_leads_contact_id",
                table: "leads");

            migrationBuilder.RenameColumn(
                name: "deal_id",
                table: "projects",
                newName: "contact_id");

            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "deals",
                type: "nvarchar(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_contact_id",
                table: "projects",
                column: "contact_id",
                unique: true,
                filter: "[contact_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_leads_contact_id",
                table: "leads",
                column: "contact_id",
                unique: true,
                filter: "[contact_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_deals_ProjectId",
                table: "deals",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_deals_contacts_contact_id",
                table: "deals",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "FK_deals_projects_ProjectId",
                table: "deals",
                column: "ProjectId",
                principalTable: "projects",
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
                name: "FK_deals_contacts_contact_id",
                table: "deals");

            migrationBuilder.DropForeignKey(
                name: "FK_deals_projects_ProjectId",
                table: "deals");

            migrationBuilder.DropForeignKey(
                name: "FK_projects_contacts_contact_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_contact_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_leads_contact_id",
                table: "leads");

            migrationBuilder.DropIndex(
                name: "IX_deals_ProjectId",
                table: "deals");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "deals");

            migrationBuilder.RenameColumn(
                name: "contact_id",
                table: "projects",
                newName: "deal_id");

            migrationBuilder.CreateIndex(
                name: "IX_projects_deal_id",
                table: "projects",
                column: "deal_id",
                unique: true,
                filter: "[deal_id] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_leads_contact_id",
                table: "leads",
                column: "contact_id");

            migrationBuilder.AddForeignKey(
                name: "FK_deals_contacts_contact_id",
                table: "deals",
                column: "contact_id",
                principalTable: "contacts",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_projects_deals_deal_id",
                table: "projects",
                column: "deal_id",
                principalTable: "deals",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
