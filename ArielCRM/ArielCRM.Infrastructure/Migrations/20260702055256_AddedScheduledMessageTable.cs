using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedScheduledMessageTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_scheduled",
                table: "team_messages",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "schedule_at",
                table: "team_messages",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "scheduled_team_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    conversation_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sender_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: true),
                    scheduled_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    job_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    failure_reason = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    sent_message_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    cancelled_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scheduled_team_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_scheduled_team_messages_team_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "team_conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_scheduled_team_messages_users_sender_id",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "scheduled_team_message_attachments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    scheduled_message_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    upload_id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    attachment_type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_scheduled_team_message_attachments", x => x.id);
                    table.ForeignKey(
                        name: "FK_scheduled_team_message_attachments_scheduled_team_messages_~",
                        column: x => x.scheduled_message_id,
                        principalTable: "scheduled_team_messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_team_message_attachments_scheduled_message_id",
                table: "scheduled_team_message_attachments",
                column: "scheduled_message_id");

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_team_messages_conversation_id",
                table: "scheduled_team_messages",
                column: "conversation_id");

            migrationBuilder.CreateIndex(
                name: "IX_scheduled_team_messages_sender_id",
                table: "scheduled_team_messages",
                column: "sender_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "scheduled_team_message_attachments");

            migrationBuilder.DropTable(
                name: "scheduled_team_messages");

            migrationBuilder.DropColumn(
                name: "is_scheduled",
                table: "team_messages");

            migrationBuilder.DropColumn(
                name: "schedule_at",
                table: "team_messages");
        }
    }
}
