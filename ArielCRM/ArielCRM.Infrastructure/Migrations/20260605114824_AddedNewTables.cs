using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedNewTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TicketTaskTaskId",
                table: "activity_log",
                type: "nvarchar(50)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    project_key = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    project_lead_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_projects", x => x.id);
                    table.ForeignKey(
                        name: "FK_projects_users_project_lead_id",
                        column: x => x.project_lead_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "project_members",
                columns: table => new
                {
                    project_id = table.Column<string>(type: "nvarchar(50)", nullable: false),
                    user_id = table.Column<string>(type: "nvarchar(50)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_project_members", x => new { x.project_id, x.user_id });
                    table.ForeignKey(
                        name: "FK_project_members_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_project_members_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ticket_tasks",
                columns: table => new
                {
                    task_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ticket_id = table.Column<int>(type: "int", nullable: true),
                    priority = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    assign_to_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    reported_by_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    project_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ticket_tasks", x => x.task_id);
                    table.ForeignKey(
                        name: "FK_ticket_tasks_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ticket_tasks_users_assign_to_id",
                        column: x => x.assign_to_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ticket_tasks_users_reported_by_id",
                        column: x => x.reported_by_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "comments",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    edited = table.Column<bool>(type: "bit", nullable: false),
                    user_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ticket_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    activity_log_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TicketTaskTaskId = table.Column<string>(type: "nvarchar(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comments", x => x.id);
                    table.ForeignKey(
                        name: "FK_comments_activity_log_activity_log_id",
                        column: x => x.activity_log_id,
                        principalTable: "activity_log",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_comments_ticket_tasks_TicketTaskTaskId",
                        column: x => x.TicketTaskTaskId,
                        principalTable: "ticket_tasks",
                        principalColumn: "task_id");
                    table.ForeignKey(
                        name: "FK_comments_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_activity_log_TicketTaskTaskId",
                table: "activity_log",
                column: "TicketTaskTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_comments_activity_log_id",
                table: "comments",
                column: "activity_log_id");

            migrationBuilder.CreateIndex(
                name: "IX_comments_TicketTaskTaskId",
                table: "comments",
                column: "TicketTaskTaskId");

            migrationBuilder.CreateIndex(
                name: "IX_comments_user_id",
                table: "comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_project_members_user_id",
                table: "project_members",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "idx_projects_key",
                table: "projects",
                column: "project_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_projects_lead",
                table: "projects",
                column: "project_lead_id");

            migrationBuilder.CreateIndex(
                name: "idx_tickettasks_assigned",
                table: "ticket_tasks",
                column: "assign_to_id");

            migrationBuilder.CreateIndex(
                name: "idx_tickettasks_project",
                table: "ticket_tasks",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_tickettasks_reported",
                table: "ticket_tasks",
                column: "reported_by_id");

            migrationBuilder.AddForeignKey(
                name: "FK_activity_log_ticket_tasks_TicketTaskTaskId",
                table: "activity_log",
                column: "TicketTaskTaskId",
                principalTable: "ticket_tasks",
                principalColumn: "task_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_activity_log_ticket_tasks_TicketTaskTaskId",
                table: "activity_log");

            migrationBuilder.DropTable(
                name: "comments");

            migrationBuilder.DropTable(
                name: "project_members");

            migrationBuilder.DropTable(
                name: "ticket_tasks");

            migrationBuilder.DropTable(
                name: "projects");

            migrationBuilder.DropIndex(
                name: "IX_activity_log_TicketTaskTaskId",
                table: "activity_log");

            migrationBuilder.DropColumn(
                name: "TicketTaskTaskId",
                table: "activity_log");
        }
    }
}
