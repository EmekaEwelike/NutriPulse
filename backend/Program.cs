using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Database Connection
var postgresConn = builder.Configuration.GetConnectionString("PostgreSQL");
bool usePostgres = false;

if (!string.IsNullOrEmpty(postgresConn))
{
    try
    {
        using var conn = new NpgsqlConnection(postgresConn);
        conn.Open();
        usePostgres = true;
        Console.WriteLine("--> Connected to PostgreSQL Database successfully!");
    }
    catch
    {
        Console.WriteLine("--> PostgreSQL not reachable. Falling back to SQLite local database.");
    }
}

builder.Services.AddDbContext<NutriPulseDbContext>(options =>
{
    if (usePostgres)
    {
        options.UseNpgsql(postgresConn);
    }
    else
    {
        options.UseSqlite("Data Source=nutripulse.db");
    }
});

var app = builder.Build();

// Enable Swagger UI
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "NutriPulse API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Ensure Database Created & Seeded
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<NutriPulseDbContext>();
        DbInitializer.Initialize(context);
        Console.WriteLine("--> NutriPulse Database Initialized & Seeded Successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"--> Error initializing database: {ex.Message}");
    }
}

app.Run();
