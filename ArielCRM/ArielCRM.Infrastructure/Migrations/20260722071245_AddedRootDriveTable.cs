using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArielCRM.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddedRootDriveTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RootDriveId",
                table: "Folders",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "RootDrives",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DriveName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DriveKey = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    DiskSize = table.Column<long>(type: "bigint", nullable: false),
                    CanCreate = table.Column<bool>(type: "boolean", nullable: false),
                    OccupiedSpace = table.Column<long>(type: "bigint", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "bytea", rowVersion: true, nullable: true),
                    AllowedUsersId = table.Column<List<string>>(type: "text[]", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RootDrives", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Folders_RootDriveId",
                table: "Folders",
                column: "RootDriveId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_Folder_ParentOrDrive",
                table: "Folders",
                sql: "(\"ParentFolderId\" IS NOT NULL AND \"RootDriveId\" IS NULL) OR (\"ParentFolderId\" IS NULL AND \"RootDriveId\" IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_RootDrives_DriveKey",
                table: "RootDrives",
                column: "DriveKey",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Folders_RootDrives_RootDriveId",
                table: "Folders",
                column: "RootDriveId",
                principalTable: "RootDrives",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Folders_RootDrives_RootDriveId",
                table: "Folders");

            migrationBuilder.DropTable(
                name: "RootDrives");

            migrationBuilder.DropIndex(
                name: "IX_Folders_RootDriveId",
                table: "Folders");

            migrationBuilder.DropCheckConstraint(
                name: "CK_Folder_ParentOrDrive",
                table: "Folders");

            migrationBuilder.DropColumn(
                name: "RootDriveId",
                table: "Folders");
        }
    }
}
