using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedTableHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "crm_history",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    entity_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
                    action_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    revert_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    modified_data = table.Column<string>(type: "text", nullable: true),
                    initiated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    initiated_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    previous_state = table.Column<string>(type: "text", nullable: true),
                    updated_state = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_crm_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_crm_history_users_initiated_by_id",
                        column: x => x.initiated_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_crm_history_initiated_by_id",
                table: "crm_history",
                column: "initiated_by_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "crm_history");
        }
    }
}
