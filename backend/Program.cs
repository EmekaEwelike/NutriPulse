using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using NutriPulse.Api.Data;
using NutriPulse.Api.Services;

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

// Register HTTP Client and Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IEmailService, ResendEmailService>();
builder.Services.AddScoped<ITokenService, TokenService>();

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? TokenService.DefaultSecretKey;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "NutriPulse",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "NutriPulseApp",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

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

app.UseAuthentication();
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
