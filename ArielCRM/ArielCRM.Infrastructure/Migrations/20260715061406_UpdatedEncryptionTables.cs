using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedEncryptionTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "team_messages",
                type: "character varying(8000)",
                maxLength: 8000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "iv",
                table: "team_messages",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "team_message_keys",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    recipient_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    encrypted_aes_key = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_message_keys", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_message_keys_team_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "team_messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_message_keys_users_recipient_id",
                        column: x => x.recipient_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_team_message_keys_message_id_recipient_id",
                table: "team_message_keys",
                columns: new[] { "message_id", "recipient_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_team_message_keys_recipient_id",
                table: "team_message_keys",
                column: "recipient_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "team_message_keys");

            migrationBuilder.DropColumn(
                name: "iv",
                table: "team_messages");

            migrationBuilder.AlterColumn<string>(
                name: "content",
                table: "team_messages",
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
