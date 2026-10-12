using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace NutriPulse.Api.Services;

public class ResendEmailService : IEmailService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ResendEmailService> _logger;

    public ResendEmailService(HttpClient httpClient, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailVerificationCodeAsync(string toEmail, string userName, string code)
    {
        var subject = "NutriPulse - Confirm your email address";
        var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; }}
    .card {{ max-width: 480px; margin: 0 auto; background: #161e2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .logo {{ color: #10b981; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; margin-bottom: 20px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }}
    .text {{ font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }}
    .code-box {{ background: linear-gradient(135deg, #059669 0%, #10b981 100%); border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
    .code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; }}
    .footer {{ font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; }}
  </style>
</head>
<body>
  <div class='card'>
    <div class='logo'>🥗 NutriPulse</div>
    <div class='title'>Welcome, {userName}!</div>
    <p class='text'>Thank you for signing up with NutriPulse. Please use the following 6-digit confirmation code to verify your email address:</p>
    <div class='code-box'>
      <span class='code'>{code}</span>
    </div>
    <p class='text'>This verification code will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
    <div class='footer'>© {DateTime.UtcNow.Year} NutriPulse Calorie Tracker. All rights reserved.</div>
  </div>
</body>
</html>";

        return await SendViaResendAsync(toEmail, subject, htmlContent, code, "EMAIL VERIFICATION");
    }

    public async Task<bool> SendPasswordResetCodeAsync(string toEmail, string userName, string code)
    {
        var subject = "NutriPulse - Password Reset Request";
        var htmlContent = $@"
<!DOCTYPE html>
<html>
<head>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; }}
    .card {{ max-width: 480px; margin: 0 auto; background: #161e2e; border: 1px solid #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .logo {{ color: #10b981; font-size: 24px; font-weight: bold; margin-bottom: 20px; }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }}
    .text {{ font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }}
    .code-box {{ background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }}
    .code {{ font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #ffffff; }}
    .footer {{ font-size: 12px; color: #64748b; text-align: center; margin-top: 24px; }}
  </style>
</head>
<body>
  <div class='card'>
    <div class='logo'>🥗 NutriPulse</div>
    <div class='title'>Password Reset Request</div>
    <p class='text'>Hi {userName}, we received a request to reset your password. Use the code below to complete the reset:</p>
    <div class='code-box'>
      <span class='code'>{code}</span>
    </div>
    <p class='text'>This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please change your password or contact support immediately.</p>
    <div class='footer'>© {DateTime.UtcNow.Year} NutriPulse Calorie Tracker. All rights reserved.</div>
  </div>
</body>
</html>";

        return await SendViaResendAsync(toEmail, subject, htmlContent, code, "PASSWORD RESET");
    }

    private async Task<bool> SendViaResendAsync(string toEmail, string subject, string htmlContent, string code, string actionType)
    {
        var apiKey = _configuration["Resend:ApiKey"];
        var fromEmail = _configuration["Resend:FromEmail"] ?? "NutriPulse <onboarding@resend.dev>";

        // Always print clear OTP banner in the console for instant testing & development
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine("\n=======================================================");
        Console.WriteLine($"[NUTRIPULSE AUTH SERVICE - {actionType}]");
        Console.WriteLine($"Recipient: {toEmail}");
        Console.WriteLine($"6-DIGIT OTP CODE: {code}");
        Console.WriteLine($"Expires in: 15 minutes");
        Console.WriteLine("=======================================================\n");
        Console.ResetColor();

        // If no API key configured or placeholder key, return true in local dev mode
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("your_resend_api_key"))
        {
            _logger.LogInformation("Resend API key not set or is placeholder. Dev mode OTP logged to console.");
            return true;
        }

        try
        {
            var requestPayload = new
            {
                from = fromEmail,
                to = new[] { toEmail },
                subject = subject,
                html = htmlContent
            };

            var json = JsonSerializer.Serialize(requestPayload);
            using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
            {
                Content = new StringContent(json, Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var response = await _httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully via Resend to {Recipient}", toEmail);
                return true;
            }

            var errBody = await response.Content.ReadAsStringAsync();
            _logger.LogWarning("Resend API responded with {StatusCode}: {Error}. Fallback OTP in console is active.", response.StatusCode, errBody);
            return true; // Still return true so user can complete registration using console OTP during dev
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email via Resend to {Recipient}", toEmail);
            return true; // Dev fallback
        }
    }
}
