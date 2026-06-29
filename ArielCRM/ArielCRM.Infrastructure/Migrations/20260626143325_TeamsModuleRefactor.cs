using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TeamsModuleRefactor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string[]>(
                name: "members",
                table: "team_conversations",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.Sql("""
                UPDATE team_conversations c
                SET members = m.user_ids
                FROM (
                    SELECT conversation_id, array_agg(user_id ORDER BY joined_at) AS user_ids
                    FROM team_conversation_members
                    GROUP BY conversation_id
                ) m
                WHERE c.id = m.conversation_id;
                """);

            migrationBuilder.DropTable(
                name: "team_conversation_members");

            migrationBuilder.RenameColumn(
                name: "sent_at",
                table: "team_messages",
                newName: "created_at");

            migrationBuilder.RenameColumn(
                name: "edited_at",
                table: "team_messages",
                newName: "updated_at");

            migrationBuilder.RenameColumn(
                name: "body",
                table: "team_messages",
                newName: "content");

            migrationBuilder.AddColumn<string[]>(
                name: "seen_by_ids",
                table: "team_messages",
                type: "text[]",
                nullable: false,
                defaultValue: new string[0]);

            migrationBuilder.Sql("""
                UPDATE team_messages
                SET seen_by_ids = ARRAY[sender_id]::text[];
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.Sql("""
                INSERT INTO team_conversation_members (conversation_id, user_id, joined_at)
                SELECT id, unnest(members), created_at
                FROM team_conversations;
                """);

            migrationBuilder.CreateIndex(
                name: "idx_team_conversation_members_user",
                table: "team_conversation_members",
                column: "user_id");

            migrationBuilder.DropColumn(
                name: "members",
                table: "team_conversations");

            migrationBuilder.DropColumn(
                name: "seen_by_ids",
                table: "team_messages");

            migrationBuilder.RenameColumn(
                name: "created_at",
                table: "team_messages",
                newName: "sent_at");

            migrationBuilder.RenameColumn(
                name: "updated_at",
                table: "team_messages",
                newName: "edited_at");

            migrationBuilder.RenameColumn(
                name: "content",
                table: "team_messages",
                newName: "body");
        }
    }
}
