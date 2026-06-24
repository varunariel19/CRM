using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTeamsMessaging : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "team_conversations",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    is_group = table.Column<bool>(type: "boolean", nullable: false),
                    created_by_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    last_message_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_conversations", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_conversations_users_created_by_id",
                        column: x => x.created_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateTable(
                name: "team_conversation_members",
                columns: table => new
                {
                    conversation_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    joined_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    last_read_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_conversation_members", x => new { x.conversation_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_team_conversation_members_team_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "team_conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_conversation_members_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "team_messages",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    conversation_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    sender_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    body = table.Column<string>(type: "character varying(4000)", maxLength: 4000, nullable: false),
                    sent_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    edited_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_messages_team_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "team_conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_team_messages_users_sender_id",
                        column: x => x.sender_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "team_message_attachments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    message_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    upload_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    content_type = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    attachment_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_team_message_attachments", x => x.id);
                    table.ForeignKey(
                        name: "FK_team_message_attachments_team_messages_message_id",
                        column: x => x.message_id,
                        principalTable: "team_messages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TicketHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketId = table.Column<string>(type: "character varying(50)", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: true),
                    CommitedById = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TicketHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TicketHistories_UserSummaryDto1_CommitedById",
                        column: x => x.CommitedById,
                        principalTable: "UserSummaryDto1",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_TicketHistories_ticket_tasks_TicketId",
                        column: x => x.TicketId,
                        principalTable: "ticket_tasks",
                        principalColumn: "task_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_team_conversation_members_user",
                table: "team_conversation_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_team_conversations_last_message",
                table: "team_conversations",
                column: "last_message_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_team_conversations_created_by_id",
                table: "team_conversations",
                column: "created_by_id");

            migrationBuilder.CreateIndex(
                name: "idx_team_messages_lookup",
                table: "team_messages",
                columns: new[] { "conversation_id", "sent_at" });

            migrationBuilder.CreateIndex(
                name: "idx_team_message_attachments_message",
                table: "team_message_attachments",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "IX_team_messages_sender_id",
                table: "team_messages",
                column: "sender_id");

            migrationBuilder.CreateIndex(
                name: "IX_TicketHistories_CommitedById",
                table: "TicketHistories",
                column: "CommitedById");

            migrationBuilder.CreateIndex(
                name: "IX_TicketHistories_TicketId",
                table: "TicketHistories",
                column: "TicketId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "team_conversation_members");

            migrationBuilder.DropTable(
                name: "team_message_attachments");

            migrationBuilder.DropTable(
                name: "team_messages");

            migrationBuilder.DropTable(
                name: "TicketHistories");

            migrationBuilder.DropTable(
                name: "team_conversations");

            migrationBuilder.DropTable(
                name: "UserSummaryDto1");
        }
    }
}
