using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Services;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public const string DefaultSecretKey = "NutriPulse_SuperSecret_Jwt_SigningKey_2026_Minimum32Bytes!";

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateJwtToken(User user)
    {
        var secret = _configuration["Jwt:Secret"] ?? DefaultSecretKey;
        var issuer = _configuration["Jwt:Issuer"] ?? "NutriPulse";
        var audience = _configuration["Jwt:Audience"] ?? "NutriPulseApp";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("auth_provider", user.AuthProvider),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
