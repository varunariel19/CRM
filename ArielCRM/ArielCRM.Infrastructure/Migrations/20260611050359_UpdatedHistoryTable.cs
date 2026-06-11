using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedHistoryTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "crm_history");

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    entity_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    entity_display_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    entity_url = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    action_type = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    action_description = table.Column<string>(type: "text", nullable: true),
                    revert_type = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    is_reverted = table.Column<bool>(type: "bit", nullable: false),
                    reverted_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    reverted_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    previous_state = table.Column<string>(type: "text", nullable: true),
                    updated_state = table.Column<string>(type: "text", nullable: true),
                    diff_data = table.Column<string>(type: "text", nullable: true),
                    affected_fields = table.Column<string>(type: "text", nullable: true),
                    batch_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    parent_audit_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    failure_reason = table.Column<string>(type: "text", nullable: true),
                    source = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    ip_address = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    correlation_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    session_id = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    extra_metadata = table.Column<string>(type: "text", nullable: true),
                    initiated_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    initiated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_audit_logs_audit_logs_parent_audit_id",
                        column: x => x.parent_audit_id,
                        principalTable: "audit_logs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_initiated_by_id",
                        column: x => x.initiated_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_audit_logs_users_reverted_by_id",
                        column: x => x.reverted_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_revert_history",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    audit_log_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    snapshot_before_revert = table.Column<string>(type: "text", nullable: true),
                    snapshot_after_revert = table.Column<string>(type: "text", nullable: true),
                    revert_note = table.Column<string>(type: "text", nullable: true),
                    reverted_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    reverted_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_revert_history", x => x.id);
                    table.ForeignKey(
                        name: "FK_audit_revert_history_audit_logs_audit_log_id",
                        column: x => x.audit_log_id,
                        principalTable: "audit_logs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_audit_revert_history_users_reverted_by_id",
                        column: x => x.reverted_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_action",
                table: "audit_logs",
                column: "action_type");

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_batch",
                table: "audit_logs",
                column: "batch_id");

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_date",
                table: "audit_logs",
                column: "initiated_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_entity",
                table: "audit_logs",
                columns: new[] { "entity_name", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_initiator",
                table: "audit_logs",
                column: "initiated_by_id");

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_parent",
                table: "audit_logs",
                column: "parent_audit_id");

            migrationBuilder.CreateIndex(
                name: "idx_auditlog_reverted",
                table: "audit_logs",
                column: "is_reverted");

            migrationBuilder.CreateIndex(
                name: "IX_audit_logs_reverted_by_id",
                table: "audit_logs",
                column: "reverted_by_id");

            migrationBuilder.CreateIndex(
                name: "idx_reverthistory_auditlog",
                table: "audit_revert_history",
                column: "audit_log_id");

            migrationBuilder.CreateIndex(
                name: "idx_reverthistory_date",
                table: "audit_revert_history",
                column: "reverted_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_audit_revert_history_reverted_by_id",
                table: "audit_revert_history",
                column: "reverted_by_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_revert_history");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.CreateTable(
                name: "crm_history",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    initiated_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    action_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    entity_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    entity_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    initiated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    modified_data = table.Column<string>(type: "text", nullable: true),
                    previous_state = table.Column<string>(type: "text", nullable: true),
                    revert_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    title = table.Column<string>(type: "text", nullable: false),
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
    }
}
