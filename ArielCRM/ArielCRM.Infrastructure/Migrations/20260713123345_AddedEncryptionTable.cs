using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedEncryptionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {


            migrationBuilder.AddColumn<string>(
                name: "encryption_id",
                table: "users",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "user_encryption_keys",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    public_key = table.Column<string>(type: "text", nullable: false),
                    encrypted_private_key = table.Column<string>(type: "text", nullable: false),
                    salt = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_encryption_keys", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_encryption_keys_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_user_encryption_keys_user_id",
                table: "user_encryption_keys",
                column: "user_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "user_encryption_keys");

            migrationBuilder.DropColumn(
                name: "encryption_id",
                table: "users");

            migrationBuilder.AddColumn<string>(
                name: "UserId",
                table: "ticket_history",
                type: "character varying(50)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ticket_history_UserId",
                table: "ticket_history",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ticket_history_users_UserId",
                table: "ticket_history",
                column: "UserId",
                principalTable: "users",
                principalColumn: "id");
        }
    }
}
