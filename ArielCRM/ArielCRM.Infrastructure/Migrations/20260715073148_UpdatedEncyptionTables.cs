using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedEncyptionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_team_message_keys_scheduled_team_messages_ScheduledTeamMess~",
                table: "team_message_keys");

            migrationBuilder.DropIndex(
                name: "IX_team_message_keys_ScheduledTeamMessageId",
                table: "team_message_keys");

            migrationBuilder.DropColumn(
                name: "ScheduledTeamMessageId",
                table: "team_message_keys");

            migrationBuilder.CreateTable(
                name: "scheduled_team_message_keys",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scheduled_message_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    recipient_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    encrypted_aes_key = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scheduled_team_message_keys", x => x.id);
                    table.ForeignKey(
                        name: "FK_scheduled_team_message_keys_scheduled_team_messages_schedul~",
                        column: x => x.scheduled_message_id,
                        principalTable: "scheduled_team_messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_scheduled_team_message_keys_users_recipient_id",
                        column: x => x.recipient_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_team_message_keys_recipient_id",
                table: "scheduled_team_message_keys",
                column: "recipient_id");

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_team_message_keys_scheduled_message_id",
                table: "scheduled_team_message_keys",
                column: "scheduled_message_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "scheduled_team_message_keys");

            migrationBuilder.AddColumn<string>(
                name: "ScheduledTeamMessageId",
                table: "team_message_keys",
                type: "character varying(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_team_message_keys_ScheduledTeamMessageId",
                table: "team_message_keys",
                column: "ScheduledTeamMessageId");

            migrationBuilder.AddForeignKey(
                name: "FK_team_message_keys_scheduled_team_messages_ScheduledTeamMess~",
                table: "team_message_keys",
                column: "ScheduledTeamMessageId",
                principalTable: "scheduled_team_messages",
                principalColumn: "id");
        }
    }
}
