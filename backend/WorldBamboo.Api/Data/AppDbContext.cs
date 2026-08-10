using Microsoft.EntityFrameworkCore;
using WorldBamboo.Api.Models;

namespace WorldBamboo.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Registration> Registrations => Set<Registration>();
    public DbSet<PaymentSubmission> PaymentSubmissions => Set<PaymentSubmission>();
    public DbSet<CheckIn> CheckIns => Set<CheckIn>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Registration>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Reference).IsUnique();
            entity.HasIndex(x => x.LookupToken).IsUnique();
            entity.HasIndex(x => x.EventQrToken).IsUnique();
            entity.Property(x => x.Reference).HasMaxLength(40);
            entity.Property(x => x.LookupToken).HasMaxLength(96);
            entity.Property(x => x.EventQrToken).HasMaxLength(96);
            entity.Property(x => x.FullName).HasMaxLength(180);
            entity.Property(x => x.Email).HasMaxLength(254);
            entity.Property(x => x.Mobile).HasMaxLength(40);
            entity.Property(x => x.Municipality).HasMaxLength(120);
            entity.Property(x => x.Organization).HasMaxLength(180);
            entity.Property(x => x.Category).HasMaxLength(80);
            entity.Property(x => x.Participation).HasMaxLength(120);
            entity.Property(x => x.RegistrationStatus).HasMaxLength(48);
            entity.Property(x => x.PaymentStatus).HasMaxLength(48);
        });

        modelBuilder.Entity<PaymentSubmission>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.PayerReference);
            entity.Property(x => x.Method).HasMaxLength(40);
            entity.Property(x => x.PayerReference).HasMaxLength(160);
            entity.Property(x => x.Status).HasMaxLength(48);
            entity.Property(x => x.ReviewedBy).HasMaxLength(120);
            entity.HasOne(x => x.Registration)
                .WithMany(x => x.PaymentSubmissions)
                .HasForeignKey(x => x.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CheckIn>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.RegistrationId).IsUnique();
            entity.Property(x => x.Operator).HasMaxLength(120);
            entity.HasOne(x => x.Registration)
                .WithOne(x => x.CheckIn)
                .HasForeignKey<CheckIn>(x => x.RegistrationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AuditEntry>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.CreatedAtUtc);
            entity.Property(x => x.Action).HasMaxLength(80);
            entity.Property(x => x.EntityType).HasMaxLength(80);
            entity.Property(x => x.EntityReference).HasMaxLength(120);
            entity.Property(x => x.Actor).HasMaxLength(120);
        });
    }
}
