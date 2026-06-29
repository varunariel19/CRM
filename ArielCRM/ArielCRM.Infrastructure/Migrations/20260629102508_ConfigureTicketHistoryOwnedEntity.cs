using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureTicketHistoryOwnedEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TicketHistories_UserSummaryDto1_CommitedById",
                table: "TicketHistories");

            migrationBuilder.DropTable(
                name: "UserSummaryDto1");

            migrationBuilder.DropIndex(
                name: "IX_TicketHistories_CommitedById",
                table: "TicketHistories");

            migrationBuilder.AddColumn<string>(
                name: "CommitedByName",
                table: "TicketHistories",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CommitedByProfileImage",
                table: "TicketHistories",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CommitedByName",
                table: "TicketHistories");

            migrationBuilder.DropColumn(
                name: "CommitedByProfileImage",
                table: "TicketHistories");

            migrationBuilder.CreateTable(
                name: "UserSummaryDto1",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    ProfileImage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserSummaryDto1", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TicketHistories_CommitedById",
                table: "TicketHistories",
                column: "CommitedById");

            migrationBuilder.AddForeignKey(
                name: "FK_TicketHistories_UserSummaryDto1_CommitedById",
                table: "TicketHistories",
                column: "CommitedById",
                principalTable: "UserSummaryDto1",
                principalColumn: "Id");
        }
    }
}
