using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedLeadAndProject : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "budget",
                table: "leads");

            migrationBuilder.DropColumn(
                name: "deal_close_date",
                table: "leads");

            migrationBuilder.DropColumn(
                name: "deal_start_date",
                table: "leads");

            migrationBuilder.DropColumn(
                name: "project_title",
                table: "leads");

            migrationBuilder.DropColumn(
                name: "project_type",
                table: "leads");

            migrationBuilder.AddColumn<decimal>(
                name: "budget",
                table: "projects",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "lead_id",
                table: "projects",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "project_type",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_lead_id",
                table: "projects",
                column: "lead_id");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_leads_lead_id",
                table: "projects",
                column: "lead_id",
                principalTable: "leads",
                principalColumn: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_leads_lead_id",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_lead_id",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "budget",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "lead_id",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "project_type",
                table: "projects");

            migrationBuilder.AddColumn<decimal>(
                name: "budget",
                table: "leads",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateOnly>(
                name: "deal_close_date",
                table: "leads",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "deal_start_date",
                table: "leads",
                type: "date",
                nullable: false,
                defaultValue: new DateOnly(1, 1, 1));

            migrationBuilder.AddColumn<string>(
                name: "project_title",
                table: "leads",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "project_type",
                table: "leads",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
