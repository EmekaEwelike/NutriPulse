namespace NutriPulse.Api.Services;

public interface IEmailService
{
    Task<bool> SendEmailVerificationCodeAsync(string toEmail, string userName, string code);
    Task<bool> SendPasswordResetCodeAsync(string toEmail, string userName, string code);
}
