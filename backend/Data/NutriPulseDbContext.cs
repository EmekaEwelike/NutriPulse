using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Data;

public class NutriPulseDbContext : DbContext
{
    public NutriPulseDbContext(DbContextOptions<NutriPulseDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<UserProfile> UserProfiles { get; set; } = null!;
    public DbSet<FoodItem> FoodItems { get; set; } = null!;
    public DbSet<LoggedFood> LoggedFoods { get; set; } = null!;
    public DbSet<WaterLog> WaterLogs { get; set; } = null!;
    public DbSet<WeightLog> WeightLogs { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasKey(u => u.Id);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<UserProfile>().HasKey(u => u.Id);
        modelBuilder.Entity<FoodItem>().HasKey(f => f.Id);
        modelBuilder.Entity<LoggedFood>().HasKey(l => l.Id);
        modelBuilder.Entity<WaterLog>().HasKey(w => w.Id);
        modelBuilder.Entity<WeightLog>().HasKey(w => w.Id);
    }
}
