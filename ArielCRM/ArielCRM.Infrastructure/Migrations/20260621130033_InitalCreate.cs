using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitalCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "access_levels",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    access_level = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_access_levels", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "contacts",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    company = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    designation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    address = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contacts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    department_key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_departments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notes",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    related_to = table.Column<string>(type: "character varying(55)", maxLength: 55, nullable: false),
                    related_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_by_id = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_by_name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    is_edited = table.Column<bool>(type: "boolean", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "permissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_permissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "designations",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    department_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_designations", x => x.id);
                    table.ForeignKey(
                        name: "FK_designations_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "access_level_permissions",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    access_level_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    permission_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_access_level_permissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_access_level_permissions_access_levels_access_level_id",
                        column: x => x.access_level_id,
                        principalTable: "access_levels",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_access_level_permissions_permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "permissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    profile_image = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    department_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    designation_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    access_level_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                    table.ForeignKey(
                        name: "FK_users_access_levels_access_level_id",
                        column: x => x.access_level_id,
                        principalTable: "access_levels",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_users_departments_department_id",
                        column: x => x.department_id,
                        principalTable: "departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_users_designations_designation_id",
                        column: x => x.designation_id,
                        principalTable: "designations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entity_display_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    entity_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    title = table.Column<string>(type: "text", nullable: false),
                    action_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    action_description = table.Column<string>(type: "text", nullable: true),
                    revert_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_reverted = table.Column<bool>(type: "boolean", nullable: false),
                    reverted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    reverted_by_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    previous_state = table.Column<string>(type: "text", nullable: true),
                    updated_state = table.Column<string>(type: "text", nullable: true),
                    diff_data = table.Column<string>(type: "text", nullable: true),
                    affected_fields = table.Column<string>(type: "text", nullable: true),
                    batch_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    parent_audit_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    failure_reason = table.Column<string>(type: "text", nullable: true),
                    source = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ip_address = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "text", nullable: true),
                    correlation_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    session_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    extra_metadata = table.Column<string>(type: "text", nullable: true),
                    initiated_by_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    initiated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                name: "leads",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    company = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contact_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    project_title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    project_type = table.Column<int>(type: "integer", nullable: false),
                    budget = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    deal_start_date = table.Column<DateOnly>(type: "date", nullable: false),
                    deal_close_date = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_leads", x => x.id);
                    table.ForeignKey(
                        name: "FK_leads_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_leads_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "projects",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    project_key = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    project_lead_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    start_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    end_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    contact_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_projects", x => x.id);
                    table.ForeignKey(
                        name: "FK_projects_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_projects_users_project_lead_id",
                        column: x => x.project_lead_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ticket_code = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    client_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tickets", x => x.id);
                    table.ForeignKey(
                        name: "FK_tickets_contacts_client_id",
                        column: x => x.client_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tickets_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "audit_revert_history",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    audit_log_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    snapshot_before_revert = table.Column<string>(type: "text", nullable: true),
                    snapshot_after_revert = table.Column<string>(type: "text", nullable: true),
                    revert_note = table.Column<string>(type: "text", nullable: true),
                    reverted_by_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    reverted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "meetings",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    location = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    lead_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_meetings", x => x.id);
                    table.ForeignKey(
                        name: "FK_meetings_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "deals",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    value = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    stage = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    close_date = table.Column<DateOnly>(type: "date", nullable: false),
                    assigned_to = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    contact_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ProjectId = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_deals", x => x.id);
                    table.ForeignKey(
                        name: "FK_deals_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_deals_projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "projects",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "FK_deals_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "documents",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    project_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    upload_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    file_url = table.Column<string>(type: "text", nullable: false),
                    uploaded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_documents", x => x.id);
                    table.ForeignKey(
                        name: "FK_documents_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "project_members",
                columns: table => new
                {
                    project_id = table.Column<string>(type: "character varying(50)", nullable: false),
                    user_id = table.Column<string>(type: "character varying(50)", nullable: false)
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
                    task_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ticket_id = table.Column<int>(type: "integer", nullable: true),
                    priority = table.Column<int>(type: "integer", nullable: false),
                    title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    status = table.Column<string>(type: "text", nullable: false),
                    assign_to_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    reported_by_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    project_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
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
                name: "tasks",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    lead_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    deal_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_tasks", x => x.id);
                    table.ForeignKey(
                        name: "FK_tasks_deals_deal_id",
                        column: x => x.deal_id,
                        principalTable: "deals",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tasks_leads_lead_id",
                        column: x => x.lead_id,
                        principalTable: "leads",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_tasks_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "activity_log",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    action = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    performed_by = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    related_to = table.Column<string>(type: "character varying(55)", maxLength: 55, nullable: true),
                    related_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TicketTaskTaskId = table.Column<string>(type: "character varying(50)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_log", x => x.id);
                    table.ForeignKey(
                        name: "FK_activity_log_ticket_tasks_TicketTaskTaskId",
                        column: x => x.TicketTaskTaskId,
                        principalTable: "ticket_tasks",
                        principalColumn: "task_id");
                });

            migrationBuilder.CreateTable(
                name: "comments",
                columns: table => new
                {
                    id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "text", nullable: false),
                    edited = table.Column<bool>(type: "boolean", nullable: false),
                    user_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ticket_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    activity_log_id = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TicketTaskTaskId = table.Column<string>(type: "character varying(50)", nullable: true)
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
                name: "IX_access_level_permissions_access_level_id_permission_id",
                table: "access_level_permissions",
                columns: new[] { "access_level_id", "permission_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_access_level_permissions_permission_id",
                table: "access_level_permissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "idx_activity_dt",
                table: "activity_log",
                column: "created_at",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_activity_log_TicketTaskTaskId",
                table: "activity_log",
                column: "TicketTaskTaskId");

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
                name: "idx_deals_contact",
                table: "deals",
                column: "contact_id");

            migrationBuilder.CreateIndex(
                name: "idx_deals_stage",
                table: "deals",
                column: "stage");

            migrationBuilder.CreateIndex(
                name: "IX_deals_assigned_to",
                table: "deals",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "IX_deals_ProjectId",
                table: "deals",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_designations_department_id",
                table: "designations",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_documents_project_id",
                table: "documents",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "idx_leads_assigned",
                table: "leads",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "idx_leads_status",
                table: "leads",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_leads_contact_id",
                table: "leads",
                column: "contact_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_meetings_date",
                table: "meetings",
                column: "date");

            migrationBuilder.CreateIndex(
                name: "IX_meetings_lead_id",
                table: "meetings",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "idx_notes_lookup",
                table: "notes",
                columns: new[] { "related_to", "related_id" });

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
                name: "IX_projects_contact_id",
                table: "projects",
                column: "contact_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_tasks_deal",
                table: "tasks",
                column: "deal_id");

            migrationBuilder.CreateIndex(
                name: "idx_tasks_due",
                table: "tasks",
                column: "due_date");

            migrationBuilder.CreateIndex(
                name: "idx_tasks_lead",
                table: "tasks",
                column: "lead_id");

            migrationBuilder.CreateIndex(
                name: "IX_tasks_assigned_to",
                table: "tasks",
                column: "assigned_to");

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

            migrationBuilder.CreateIndex(
                name: "idx_tickets_assigned",
                table: "tickets",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "idx_tickets_status",
                table: "tickets",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_tickets_client_id",
                table: "tickets",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_access_level_id",
                table: "users",
                column: "access_level_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_department_id",
                table: "users",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_designation_id",
                table: "users",
                column: "designation_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "access_level_permissions");

            migrationBuilder.DropTable(
                name: "audit_revert_history");

            migrationBuilder.DropTable(
                name: "comments");

            migrationBuilder.DropTable(
                name: "documents");

            migrationBuilder.DropTable(
                name: "meetings");

            migrationBuilder.DropTable(
                name: "notes");

            migrationBuilder.DropTable(
                name: "project_members");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "tickets");

            migrationBuilder.DropTable(
                name: "permissions");

            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "activity_log");

            migrationBuilder.DropTable(
                name: "deals");

            migrationBuilder.DropTable(
                name: "leads");

            migrationBuilder.DropTable(
                name: "ticket_tasks");

            migrationBuilder.DropTable(
                name: "projects");

            migrationBuilder.DropTable(
                name: "contacts");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "access_levels");

            migrationBuilder.DropTable(
                name: "designations");

            migrationBuilder.DropTable(
                name: "departments");
        }
    }
}
