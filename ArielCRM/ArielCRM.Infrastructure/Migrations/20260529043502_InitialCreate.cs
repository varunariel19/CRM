using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "activity_log",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    action = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    performed_by = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    related_to = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: true),
                    related_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_activity_log", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "contacts",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    company = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    designation = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    address = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_contacts", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "notes",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    related_to = table.Column<string>(type: "nvarchar(55)", maxLength: 55, nullable: false),
                    related_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_by = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    password_hash = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "deals",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    value = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    stage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    close_date = table.Column<DateOnly>(type: "date", nullable: false),
                    assigned_to = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    contact_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_deals", x => x.id);
                    table.ForeignKey(
                        name: "FK_deals_contacts_contact_id",
                        column: x => x.contact_id,
                        principalTable: "contacts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_deals_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "leads",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    company = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_leads", x => x.id);
                    table.ForeignKey(
                        name: "FK_leads_users_assigned_to",
                        column: x => x.assigned_to,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "tickets",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    client_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "meetings",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    client = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    time = table.Column<TimeOnly>(type: "time", nullable: false),
                    location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    lead_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "tasks",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    title = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    due_date = table.Column<DateOnly>(type: "date", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    assigned_to = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    lead_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    deal_id = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
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

            migrationBuilder.CreateIndex(
                name: "idx_activity_dt",
                table: "activity_log",
                column: "created_at",
                descending: new bool[0]);

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
                name: "idx_leads_assigned",
                table: "leads",
                column: "assigned_to");

            migrationBuilder.CreateIndex(
                name: "idx_leads_status",
                table: "leads",
                column: "status");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "activity_log");

            migrationBuilder.DropTable(
                name: "meetings");

            migrationBuilder.DropTable(
                name: "notes");

            migrationBuilder.DropTable(
                name: "tasks");

            migrationBuilder.DropTable(
                name: "tickets");

            migrationBuilder.DropTable(
                name: "deals");

            migrationBuilder.DropTable(
                name: "leads");

            migrationBuilder.DropTable(
                name: "contacts");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
