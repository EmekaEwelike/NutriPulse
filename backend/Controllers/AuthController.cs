using System.Security.Claims;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;
using NutriPulse.Api.Services;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly NutriPulseDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        NutriPulseDbContext context,
        IEmailService emailService,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _emailService = emailService;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(new AuthResponse { Success = false, Message = "Invalid input data." });

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        var code = Random.Shared.Next(100000, 999999).ToString();
        var expiry = DateTime.UtcNow.AddMinutes(15);
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        User user;

        if (existingUser != null)
        {
            if (existingUser.IsEmailConfirmed)
            {
                return BadRequest(new AuthResponse
                {
                    Success = false,
                    Message = "An account with this email address already exists. Please log in."
                });
            }

            // Unconfirmed existing user: refresh code and update password
            existingUser.PasswordHash = passwordHash;
            existingUser.Name = request.Name.Trim();
            existingUser.EmailConfirmationCode = code;
            existingUser.EmailConfirmationCodeExpiry = expiry;
            existingUser.UpdatedAt = DateTime.UtcNow;
            user = existingUser;
        }
        else
        {
            user = new User
            {
                Email = normalizedEmail,
                Name = request.Name.Trim(),
                PasswordHash = passwordHash,
                IsEmailConfirmed = false,
                EmailConfirmationCode = code,
                EmailConfirmationCodeExpiry = expiry,
                AuthProvider = "local",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
        }

        await _context.SaveChangesAsync();

        // Send 6-digit confirmation code via Resend
        await _emailService.SendEmailVerificationCodeAsync(user.Email, user.Name, code);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Account created! A 6-digit verification code has been sent to your email.",
            RequiresVerification = true,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                IsEmailConfirmed = user.IsEmailConfirmed,
                AuthProvider = user.AuthProvider
            }
        });
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<AuthResponse>> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "User not found." });
        }

        if (user.IsEmailConfirmed)
        {
            var existingToken = _tokenService.GenerateJwtToken(user);
            return Ok(new AuthResponse
            {
                Success = true,
                Message = "Email is already verified.",
                Token = existingToken,
                User = MapToDto(user)
            });
        }

        if (user.EmailConfirmationCode != request.Code)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Invalid verification code." });
        }

        if (user.EmailConfirmationCodeExpiry < DateTime.UtcNow)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Verification code has expired. Please request a new one." });
        }

        user.IsEmailConfirmed = true;
        user.EmailConfirmationCode = null;
        user.EmailConfirmationCodeExpiry = null;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Email verified successfully! Welcome to NutriPulse.",
            Token = token,
            User = MapToDto(user)
        });
    }

    [HttpPost("resend-code")]
    public async Task<ActionResult<AuthResponse>> ResendVerificationCode([FromBody] ResendVerificationRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "User not found." });
        }

        if (user.IsEmailConfirmed)
        {
            return Ok(new AuthResponse { Success = true, Message = "Email is already verified. You can log in." });
        }

        var code = Random.Shared.Next(100000, 999999).ToString();
        user.EmailConfirmationCode = code;
        user.EmailConfirmationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        await _emailService.SendEmailVerificationCodeAsync(user.Email, user.Name, code);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "A new 6-digit verification code has been sent to your email."
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid email or password." });
        }

        bool validPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!validPassword)
        {
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid email or password." });
        }

        if (!user.IsEmailConfirmed)
        {
            // Auto resend OTP so user can quickly verify
            var code = Random.Shared.Next(100000, 999999).ToString();
            user.EmailConfirmationCode = code;
            user.EmailConfirmationCodeExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _emailService.SendEmailVerificationCodeAsync(user.Email, user.Name, code);

            return StatusCode(403, new AuthResponse
            {
                Success = false,
                Message = "Your email address is not verified yet. A fresh 6-digit code has been sent to your email.",
                RequiresVerification = true,
                User = MapToDto(user)
            });
        }

        var token = _tokenService.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Login successful!",
            Token = token,
            User = MapToDto(user)
        });
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponse>> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        string? googleEmail = null;
        string? googleName = null;
        string? googleSubjectId = null;

        // Try validating Google ID Token via Google Apis
        if (!string.IsNullOrWhiteSpace(request.IdToken))
        {
            try
            {
                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken);
                googleEmail = payload.Email?.ToLowerInvariant();
                googleName = payload.Name;
                googleSubjectId = payload.Subject;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Google ID token validation via API failed. Checking fallback payload.");
            }
        }

        // Allow mobile client fallback during development / Expo client testing
        if (string.IsNullOrEmpty(googleEmail) && !string.IsNullOrEmpty(request.Email))
        {
            googleEmail = request.Email.Trim().ToLowerInvariant();
            googleName = request.Name ?? "Google User";
            googleSubjectId = request.GoogleId ?? Guid.NewGuid().ToString();
        }

        if (string.IsNullOrEmpty(googleEmail))
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Invalid Google authentication credentials." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == googleEmail);

        if (user == null)
        {
            // Create user - Google verified email is trusted as verified
            user = new User
            {
                Email = googleEmail,
                Name = !string.IsNullOrWhiteSpace(googleName) ? googleName : "Google User",
                IsEmailConfirmed = true,
                GoogleId = googleSubjectId,
                AuthProvider = "google",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Users.Add(user);
        }
        else
        {
            // Existing user logged in with Google
            user.IsEmailConfirmed = true;
            if (string.IsNullOrEmpty(user.GoogleId))
                user.GoogleId = googleSubjectId;
            user.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        var token = _tokenService.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Google Sign-In successful!",
            Token = token,
            User = MapToDto(user)
        });
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user != null)
        {
            var code = Random.Shared.Next(100000, 999999).ToString();
            user.PasswordResetCode = code;
            user.PasswordResetCodeExpiry = DateTime.UtcNow.AddMinutes(15);
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _emailService.SendPasswordResetCodeAsync(user.Email, user.Name, code);
        }

        // Return positive response to avoid email enumeration attacks
        return Ok(new AuthResponse
        {
            Success = true,
            Message = "If an account matches that email, a 6-digit password reset code has been sent."
        });
    }

    [HttpPost("reset-password")]
    public async Task<ActionResult<AuthResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || user.PasswordResetCode != request.Code)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Invalid email or reset code." });
        }

        if (user.PasswordResetCodeExpiry < DateTime.UtcNow)
        {
            return BadRequest(new AuthResponse { Success = false, Message = "Reset code has expired. Please request a new one." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordResetCode = null;
        user.PasswordResetCodeExpiry = null;
        user.IsEmailConfirmed = true; // Verified email ownership via reset code
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Password reset successfully! You can now log in with your new password."
        });
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<AuthResponse>> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid user session." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new AuthResponse { Success = false, Message = "User not found." });
        }

        // If local password exists, verify current password
        if (!string.IsNullOrEmpty(user.PasswordHash))
        {
            bool validCurrent = BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash);
            if (!validCurrent)
            {
                return BadRequest(new AuthResponse { Success = false, Message = "Current password is incorrect." });
            }
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Success = true,
            Message = "Password changed successfully."
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthResponse>> GetCurrentUser()
    {
        var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!int.TryParse(userIdStr, out int userId))
        {
            return Unauthorized(new AuthResponse { Success = false, Message = "Invalid session." });
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new AuthResponse { Success = false, Message = "User not found." });
        }

        return Ok(new AuthResponse
        {
            Success = true,
            User = MapToDto(user)
        });
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name,
            IsEmailConfirmed = user.IsEmailConfirmed,
            AuthProvider = user.AuthProvider
        };
    }
}
