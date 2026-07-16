using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedScheduledMessageTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ScheduledTeamMessageId",
                table: "team_message_keys",
                type: "character varying(50)",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "scheduled_team_messages",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iv",
                table: "scheduled_team_messages",
                type: "character varying(100)",
                maxLength: 100,
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.DropColumn(
                name: "iv",
                table: "scheduled_team_messages");

            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "scheduled_team_messages",
                type: "character varying(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(8000)",
                oldMaxLength: 8000,
                oldNullable: true);
        }
    }
}
