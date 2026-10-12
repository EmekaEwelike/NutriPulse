using NutriPulse.Api.Models;

namespace NutriPulse.Api.Services;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}
