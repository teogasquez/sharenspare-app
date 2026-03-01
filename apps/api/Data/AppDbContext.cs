using Microsoft.EntityFrameworkCore;
using ShareNSpare.Api.Models;

namespace ShareNSpare.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Organisation> Organisations => Set<Organisation>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Equipment> Equipments => Set<Equipment>();
    public DbSet<EquipmentPhoto> EquipmentPhotos => Set<EquipmentPhoto>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<EquipmentBlackout> EquipmentBlackouts => Set<EquipmentBlackout>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User ──
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.Phone).HasMaxLength(20);
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            entity.Property(u => u.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(u => u.Organisation)
                  .WithMany(o => o.Users)
                  .HasForeignKey(u => u.OrganisationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Organisation ──
        modelBuilder.Entity<Organisation>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Name).IsRequired().HasMaxLength(255);
            entity.Property(o => o.Type).HasConversion<string>().HasMaxLength(20);
            entity.Property(o => o.Description).HasMaxLength(2000);
            entity.Property(o => o.Phone).HasMaxLength(20);
            entity.Property(o => o.Website).HasMaxLength(500);
            entity.Property(o => o.Address).HasMaxLength(500);
            entity.Property(o => o.City).HasMaxLength(100);
            entity.Property(o => o.Canton).HasMaxLength(2);
            entity.Property(o => o.CreatedAt).HasDefaultValueSql("NOW()");
        });

        // ── Category ──
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
            entity.Property(c => c.Slug).IsRequired().HasMaxLength(100);
            entity.HasIndex(c => c.Slug).IsUnique();
            entity.Property(c => c.Description).HasMaxLength(500);
            entity.Property(c => c.Icon).HasMaxLength(50);
        });

        // ── Equipment ──
        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Description).HasMaxLength(2000);
            entity.Property(e => e.DailyPrice).HasPrecision(10, 2);
            entity.Property(e => e.Condition).HasConversion<string>().HasMaxLength(20);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(e => e.Organisation)
                  .WithMany(o => o.Equipments)
                  .HasForeignKey(e => e.OrganisationId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Category)
                  .WithMany(c => c.Equipments)
                  .HasForeignKey(e => e.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── EquipmentPhoto ──
        modelBuilder.Entity<EquipmentPhoto>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Url).IsRequired().HasMaxLength(1000);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(p => p.Equipment)
                  .WithMany(e => e.Photos)
                  .HasForeignKey(p => p.EquipmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Reservation ──
        modelBuilder.Entity<Reservation>(entity =>
        {
            entity.HasKey(r => r.Id);
            entity.Property(r => r.UnitPrice).HasPrecision(10, 2);
            entity.Property(r => r.TotalPrice).HasPrecision(10, 2);
            entity.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(r => r.Message).HasMaxLength(2000);
            entity.Property(r => r.OwnerNote).HasMaxLength(2000);
            entity.Property(r => r.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(r => r.Equipment)
                  .WithMany(e => e.Reservations)
                  .HasForeignKey(r => r.EquipmentId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.RequesterOrganisation)
                  .WithMany()
                  .HasForeignKey(r => r.RequesterOrganisationId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.OwnerOrganisation)
                  .WithMany()
                  .HasForeignKey(r => r.OwnerOrganisationId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Payment ──
        modelBuilder.Entity<Payment>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Amount).HasPrecision(10, 2);
            entity.Property(p => p.PlatformFeeAmount).HasPrecision(10, 2);
            entity.Property(p => p.PlatformFeePercent).HasPrecision(5, 2);
            entity.Property(p => p.Currency).IsRequired().HasMaxLength(3);
            entity.Property(p => p.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(p => p.Method).HasConversion<string>().HasMaxLength(20);
            entity.Property(p => p.StripePaymentIntentId).HasMaxLength(255);
            entity.Property(p => p.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(p => p.Reservation)
                  .WithOne(r => r.Payment)
                  .HasForeignKey<Payment>(p => p.ReservationId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Invitation ──
        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.HasKey(i => i.Id);
            entity.Property(i => i.Email).IsRequired().HasMaxLength(255);
            entity.Property(i => i.OrganisationName).IsRequired().HasMaxLength(255);
            entity.Property(i => i.Role).HasConversion<string>().HasMaxLength(20);
            entity.Property(i => i.Token).IsRequired().HasMaxLength(255);
            entity.HasIndex(i => i.Token).IsUnique();
            entity.Property(i => i.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(i => i.CreatedByUser)
                  .WithMany()
                  .HasForeignKey(i => i.CreatedByUserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ── EquipmentBlackout ──
        modelBuilder.Entity<EquipmentBlackout>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Reason).HasMaxLength(500);
            entity.Property(b => b.CreatedAt).HasDefaultValueSql("NOW()");

            entity.HasOne(b => b.Equipment)
                  .WithMany(e => e.Blackouts)
                  .HasForeignKey(b => b.EquipmentId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
