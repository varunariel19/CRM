using ArielCRM.DataLayer.Entities;
using ArielCRM.DataLayer.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;


namespace ArielCRM.Infrastructure.Data
{
 
        public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
        {


            public DbSet<User> Users { get; set; } = null!;
            public DbSet<Lead> Leads { get; set; } = null!;
            public DbSet<Contact> Contacts { get; set; } = null!;
            public DbSet<Deal> Deals { get; set; } = null!;
            public DbSet<CrmTask> Tasks { get; set; } = null!;
            public DbSet<Ticket> Tickets { get; set; } = null!;
            public DbSet<Meeting> Meetings { get; set; } = null!;
            public DbSet<Note> Notes { get; set; } = null!;
            public DbSet<ActivityLog> ActivityLogs { get; set; } = null!;

            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<Deal>()
                    .Property(d => d.Value)
                    .HasPrecision(12, 2);

        

                modelBuilder.Entity<User>()
                    .Property(u => u.Role)
                    .HasConversion(new EnumToStringConverter<UserRole>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Lead>()
                    .Property(l => l.Source)
                    .HasConversion(new EnumToStringConverter<LeadSource>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Lead>()
                    .Property(l => l.Status)
                    .HasConversion(new EnumToStringConverter<LeadStatus>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Deal>()
                    .Property(d => d.Stage)
                    .HasConversion(new EnumToStringConverter<DealStage>())
                    .HasMaxLength(50);

                modelBuilder.Entity<CrmTask>()
                    .Property(t => t.Type)
                    .HasConversion(new EnumToStringConverter<TaskType>())
                    .HasMaxLength(50);

                modelBuilder.Entity<CrmTask>()
                    .Property(t => t.Status)
                    .HasConversion(new EnumToStringConverter<CrmTaskStatus>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Ticket>()
                    .Property(t => t.Status)
                    .HasConversion(new EnumToStringConverter<TicketStatus>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Ticket>()
                    .Property(t => t.Priority)
                    .HasConversion(new EnumToStringConverter<TicketPriority>())
                    .HasMaxLength(50);

                modelBuilder.Entity<Note>()
                    .Property(n => n.RelatedTo)
                    .HasConversion(new EnumToStringConverter<RelatedEntityType>())
                    .HasMaxLength(55);

                modelBuilder.Entity<ActivityLog>()
                    .Property(a => a.RelatedTo)
                    .HasConversion(new EnumToStringConverter<RelatedEntityType>())
                    .HasMaxLength(55);

              
                modelBuilder.Entity<Lead>()
                    .HasOne(l => l.AssignedTo)
                    .WithMany(u => u.AssignedLeads)
                    .HasForeignKey(l => l.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<Deal>()
                    .HasOne(d => d.AssignedTo)
                    .WithMany(u => u.AssignedDeals)
                    .HasForeignKey(d => d.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<Deal>()
                    .HasOne(d => d.Contact)
                    .WithMany(c => c.Deals)
                    .HasForeignKey(d => d.ContactId)
                    .OnDelete(DeleteBehavior.SetNull);

                modelBuilder.Entity<CrmTask>()
                    .HasOne(t => t.AssignedTo)
                    .WithMany(u => u.AssignedTasks)
                    .HasForeignKey(t => t.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<CrmTask>()
                    .HasOne(t => t.Lead)
                    .WithMany(l => l.Tasks)
                    .HasForeignKey(t => t.LeadId)
                    .OnDelete(DeleteBehavior.SetNull);

                modelBuilder.Entity<CrmTask>()
                    .HasOne(t => t.Deal)
                    .WithMany(d => d.Tasks)
                    .HasForeignKey(t => t.DealId)
                    .OnDelete(DeleteBehavior.SetNull);

                modelBuilder.Entity<Ticket>()
                    .HasOne(t => t.AssignedTo)
                    .WithMany(u => u.AssignedTickets)
                    .HasForeignKey(t => t.AssignedToId)
                    .OnDelete(DeleteBehavior.Restrict);

                modelBuilder.Entity<Ticket>()
                    .HasOne(t => t.Client)
                    .WithMany(c => c.Tickets)
                    .HasForeignKey(t => t.ClientId)
                    .OnDelete(DeleteBehavior.SetNull);

                modelBuilder.Entity<Meeting>()
                    .HasOne(m => m.Lead)
                    .WithMany(l => l.Meetings)
                    .HasForeignKey(m => m.LeadId)
                    .OnDelete(DeleteBehavior.SetNull);


                modelBuilder.Entity<User>()
                    .HasIndex(u => u.Email)
                    .IsUnique()
                    .HasDatabaseName("idx_users_email");

                modelBuilder.Entity<Lead>()
                    .HasIndex(l => l.Status)
                    .HasDatabaseName("idx_leads_status");

                modelBuilder.Entity<Lead>()
                    .HasIndex(l => l.AssignedToId)
                    .HasDatabaseName("idx_leads_assigned");

                modelBuilder.Entity<Deal>()
                    .HasIndex(d => d.Stage)
                    .HasDatabaseName("idx_deals_stage");

                modelBuilder.Entity<Deal>()
                    .HasIndex(d => d.ContactId)
                    .HasDatabaseName("idx_deals_contact");

                modelBuilder.Entity<CrmTask>()
                    .HasIndex(t => t.DueDate)
                    .HasDatabaseName("idx_tasks_due");

                modelBuilder.Entity<CrmTask>()
                    .HasIndex(t => t.LeadId)
                    .HasDatabaseName("idx_tasks_lead");

                modelBuilder.Entity<CrmTask>()
                    .HasIndex(t => t.DealId)
                    .HasDatabaseName("idx_tasks_deal");

                modelBuilder.Entity<Ticket>()
                    .HasIndex(t => t.Status)
                    .HasDatabaseName("idx_tickets_status");

                modelBuilder.Entity<Ticket>()
                    .HasIndex(t => t.AssignedToId)
                    .HasDatabaseName("idx_tickets_assigned");

                modelBuilder.Entity<Meeting>()
                    .HasIndex(m => m.Date)
                    .HasDatabaseName("idx_meetings_date");

                modelBuilder.Entity<Note>()
                    .HasIndex(n => new { n.RelatedTo, n.RelatedId })
                    .HasDatabaseName("idx_notes_lookup");

                modelBuilder.Entity<ActivityLog>()
                    .HasIndex(a => a.CreatedAt)
                    .HasDatabaseName("idx_activity_dt")
                    .IsDescending();   

            }
        }

}
