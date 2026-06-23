using ArielCRM.DataLayer.Entities;
using Microsoft.EntityFrameworkCore;

namespace ArielCRM.Infrastructure.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        // ─────────────────────────────────────────────
        // DbSets
        // ─────────────────────────────────────────────

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Lead> Leads { get; set; } = null!;
        public DbSet<Contact> Contacts { get; set; } = null!;
        public DbSet<Deal> Deals { get; set; } = null!;
        public DbSet<CrmTask> Tasks { get; set; } = null!;
        public DbSet<Ticket> Tickets { get; set; } = null!;
        public DbSet<Meeting> Meetings { get; set; } = null!;
        public DbSet<Note> Notes { get; set; } = null!;
        public DbSet<ActivityLog> ActivityLogs { get; set; } = null!;
        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<TicketTask> TicketTasks { get; set; } = null!;
        public DbSet<AccessLevel> AccessLevels { get; set; } = null!;
        public DbSet<Permission> Permissions { get; set; } = null!;
        public DbSet<AccessLevelPermission> AccessLevelPermissions { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<Designation> Designations { get; set; } = null!;
        public DbSet<Documents> Documents { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;

        // Audit
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<AuditRevertHistory> AuditRevertHistories { get; set; } = null!;

        // ─────────────────────────────────────────────
        // Model Configuration
        // ─────────────────────────────────────────────

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Ignore<System.Threading.Tasks.Task>();

            // ── Table mappings ────────────────────────
            modelBuilder.Entity<CrmTask>().ToTable("tasks");
            modelBuilder.Entity<TicketTask>().ToTable("ticket_tasks");

            // ── Keys ──────────────────────────────────
            modelBuilder.Entity<CrmTask>().HasKey(t => t.Id);
            modelBuilder.Entity<TicketTask>().HasKey(t => t.TaskId);

            // ── Enum conversions ──────────────────────
            modelBuilder.Entity<Lead>()
                .Property(l => l.Source).HasConversion<string>().HasMaxLength(50);
            modelBuilder.Entity<Lead>()
                .Property(l => l.Status).HasConversion<string>().HasMaxLength(50);

            modelBuilder.Entity<Deal>()
                .Property(d => d.Stage).HasConversion<string>().HasMaxLength(50);
            modelBuilder.Entity<Deal>()
                .Property(d => d.Value).HasPrecision(12, 2);

            modelBuilder.Entity<CrmTask>()
                .Property(t => t.Type).HasConversion<string>().HasMaxLength(50);
            modelBuilder.Entity<CrmTask>()
                .Property(t => t.Status).HasConversion<string>().HasMaxLength(50);

            modelBuilder.Entity<Ticket>()
                .Property(t => t.Status).HasConversion<string>().HasMaxLength(50);
            modelBuilder.Entity<Ticket>()
                .Property(t => t.Priority).HasConversion<string>().HasMaxLength(50);

            modelBuilder.Entity<Note>()
                .Property(n => n.RelatedTo).HasConversion<string>().HasMaxLength(55);

            modelBuilder.Entity<ActivityLog>()
                .Property(a => a.RelatedTo).HasConversion<string>().HasMaxLength(55);

            // ── Relationships ─────────────────────────

            modelBuilder.Entity<Designation>()
                .HasOne(d => d.Department).WithMany()
                .HasForeignKey(d => d.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Lead>()
                .HasOne(l => l.AssignedTo).WithMany(u => u.AssignedLeads)
                .HasForeignKey(l => l.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Lead>()
                .HasOne(l => l.Contact).WithOne(c => c.Lead)
                .HasForeignKey<Lead>(l => l.ContactId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Deal>()
                .HasOne(d => d.AssignedTo).WithMany(u => u.AssignedDeals)
                .HasForeignKey(d => d.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CrmTask>()
                .HasOne(t => t.AssignedTo).WithMany(u => u.AssignedTasks)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<CrmTask>()
                .HasOne(t => t.Lead).WithMany(l => l.Tasks)
                .HasForeignKey(t => t.LeadId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<CrmTask>()
                .HasOne(t => t.Deal).WithMany(d => d.Tasks)
                .HasForeignKey(t => t.DealId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.AssignedTo).WithMany(u => u.AssignedTickets)
                .HasForeignKey(t => t.AssignedToId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<Ticket>()
                .HasOne(t => t.Client).WithMany(c => c.Tickets)
                .HasForeignKey(t => t.ClientId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Meeting>()
                .HasOne(m => m.Lead).WithMany(l => l.Meetings)
                .HasForeignKey(m => m.LeadId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<TicketTask>()
                .HasOne(t => t.AssignedUser).WithMany(u => u.AssignedProjTickets)
                .HasForeignKey(t => t.AssignToId)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<TicketTask>()
                .HasOne(t => t.ReportedUser).WithMany(u => u.ReportedProjTickets)
                .HasForeignKey(t => t.ReportedById)
                .OnDelete(DeleteBehavior.Restrict);
            modelBuilder.Entity<TicketTask>()
                .HasOne(t => t.Project).WithMany(p => p.Tasks)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.ProjectLead).WithMany(u => u.LedProjects)
                .HasForeignKey(p => p.ProjectLeadId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Contact).WithOne(d => d.Project)
                .HasForeignKey<Project>(p => p.ContactId)
                .OnDelete(DeleteBehavior.SetNull);
            modelBuilder.Entity<Project>()
                .HasMany(p => p.Members).WithMany(u => u.MemberProjects)
                .UsingEntity<Dictionary<string, object>>(
                    "project_members",
                    j => j.HasOne<User>().WithMany()
                          .HasForeignKey("user_id").OnDelete(DeleteBehavior.Cascade),
                    j => j.HasOne<Project>().WithMany()
                          .HasForeignKey("project_id").OnDelete(DeleteBehavior.Cascade),
                    j => { j.HasKey("project_id", "user_id"); j.ToTable("project_members"); });

            modelBuilder.Entity<Documents>()
                .HasOne(d => d.Project).WithMany(p => p.Documents)
                .HasForeignKey(d => d.ProjectId);

            modelBuilder.Entity<AccessLevelPermission>()
                .HasIndex(x => new { x.AccessLevelId, x.PermissionId }).IsUnique();
            modelBuilder.Entity<AccessLevelPermission>()
                .HasOne(x => x.AccessLevel).WithMany(x => x.Permissions)
                .HasForeignKey(x => x.AccessLevelId);
            modelBuilder.Entity<AccessLevelPermission>()
                .HasOne(x => x.Permission).WithMany(x => x.AccessLevels)
                .HasForeignKey(x => x.PermissionId);

            // ── AuditLog relationships ─────────────────

            modelBuilder.Entity<AuditLog>()
                .ToTable("audit_logs");

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.InitiatedBy).WithMany()
                .HasForeignKey(a => a.InitiatedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.RevertedBy).WithMany()
                .HasForeignKey(a => a.RevertedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.ParentAudit).WithMany()
                .HasForeignKey(a => a.ParentAuditId)
                .OnDelete(DeleteBehavior.Restrict);

            // ── AuditRevertHistory relationships ───────

            modelBuilder.Entity<AuditRevertHistory>()
                .ToTable("audit_revert_history");

            modelBuilder.Entity<AuditRevertHistory>()
                .HasOne(r => r.AuditLog).WithMany()
                .HasForeignKey(r => r.AuditLogId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AuditRevertHistory>()
                .HasOne(r => r.RevertedBy).WithMany()
                .HasForeignKey(r => r.RevertedById)
                .OnDelete(DeleteBehavior.Restrict);

            // ── Indexes ───────────────────────────────

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique()
                .HasDatabaseName("idx_users_email");

            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.Status).HasDatabaseName("idx_leads_status");
            modelBuilder.Entity<Lead>()
                .HasIndex(l => l.AssignedToId).HasDatabaseName("idx_leads_assigned");

            modelBuilder.Entity<Deal>()
                .HasIndex(d => d.Stage).HasDatabaseName("idx_deals_stage");
            modelBuilder.Entity<Deal>()
                .HasIndex(d => d.ContactId).HasDatabaseName("idx_deals_contact");

            modelBuilder.Entity<CrmTask>()
                .HasIndex(t => t.DueDate).HasDatabaseName("idx_tasks_due");
            modelBuilder.Entity<CrmTask>()
                .HasIndex(t => t.LeadId).HasDatabaseName("idx_tasks_lead");
            modelBuilder.Entity<CrmTask>()
                .HasIndex(t => t.DealId).HasDatabaseName("idx_tasks_deal");

            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.Status).HasDatabaseName("idx_tickets_status");
            modelBuilder.Entity<Ticket>()
                .HasIndex(t => t.AssignedToId).HasDatabaseName("idx_tickets_assigned");

            modelBuilder.Entity<Meeting>()
                .HasIndex(m => m.Date).HasDatabaseName("idx_meetings_date");

            modelBuilder.Entity<Note>()
                .HasIndex(n => new { n.RelatedTo, n.RelatedId })
                .HasDatabaseName("idx_notes_lookup");

            modelBuilder.Entity<ActivityLog>()
                .HasIndex(a => a.CreatedAt).IsDescending()
                .HasDatabaseName("idx_activity_dt");

            modelBuilder.Entity<Project>()
                .HasIndex(p => p.ProjectKey).IsUnique()
                .HasDatabaseName("idx_projects_key");
            modelBuilder.Entity<Project>()
                .HasIndex(p => p.ProjectLeadId).HasDatabaseName("idx_projects_lead");

            modelBuilder.Entity<TicketTask>()
                .HasIndex(t => t.ProjectId).HasDatabaseName("idx_tickettasks_project");
            modelBuilder.Entity<TicketTask>()
                .HasIndex(t => t.AssignToId).HasDatabaseName("idx_tickettasks_assigned");
            modelBuilder.Entity<TicketTask>()
                .HasIndex(t => t.ReportedById).HasDatabaseName("idx_tickettasks_reported");

            // ── AuditLog indexes ──────────────────────

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => new { a.EntityName, a.EntityId })
                .HasDatabaseName("idx_auditlog_entity");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.InitiatedById)
                .HasDatabaseName("idx_auditlog_initiator");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.InitiatedAt).IsDescending()
                .HasDatabaseName("idx_auditlog_date");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.ActionTypeRaw)
                .HasDatabaseName("idx_auditlog_action");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.BatchId)
                .HasDatabaseName("idx_auditlog_batch");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.ParentAuditId)
                .HasDatabaseName("idx_auditlog_parent");

            modelBuilder.Entity<AuditLog>()
                .HasIndex(a => a.IsReverted)
                .HasDatabaseName("idx_auditlog_reverted");

            modelBuilder.Entity<AuditRevertHistory>()
                .HasIndex(r => r.AuditLogId)
                .HasDatabaseName("idx_reverthistory_auditlog");

            modelBuilder.Entity<AuditRevertHistory>()
                .HasIndex(r => r.RevertedAt).IsDescending()
                .HasDatabaseName("idx_reverthistory_date");
        }
    }
}