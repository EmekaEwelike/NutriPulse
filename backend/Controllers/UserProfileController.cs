using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfileController : ControllerBase
{
    private readonly NutriPulseDbContext _context;

    public UserProfileController(NutriPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<UserProfile>> GetProfile()
    {
        var profile = await _context.UserProfiles.FirstOrDefaultAsync();
        if (profile == null)
        {
            profile = new UserProfile();
            _context.UserProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }
        return Ok(profile);
    }

    [HttpPut]
    public async Task<ActionResult<UserProfile>> UpdateProfile([FromBody] UserProfile updatedProfile)
    {
        var profile = await _context.UserProfiles.FirstOrDefaultAsync();
        if (profile == null)
        {
            _context.UserProfiles.Add(updatedProfile);
        }
        else
        {
            profile.Name = updatedProfile.Name;
            profile.Age = updatedProfile.Age;
            profile.Gender = updatedProfile.Gender;
            profile.HeightCm = updatedProfile.HeightCm;
            profile.WeightKg = updatedProfile.WeightKg;
            profile.TargetWeightKg = updatedProfile.TargetWeightKg;
            profile.ActivityLevel = updatedProfile.ActivityLevel;
            profile.GoalType = updatedProfile.GoalType;
            profile.CustomCalorieGoal = updatedProfile.CustomCalorieGoal;
            profile.ProteinGoalG = updatedProfile.ProteinGoalG;
            profile.CarbsGoalG = updatedProfile.CarbsGoalG;
            profile.FatGoalG = updatedProfile.FatGoalG;
            profile.WaterGoalMl = updatedProfile.WaterGoalMl;
            profile.StreakDays = updatedProfile.StreakDays;
            profile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(profile ?? updatedProfile);
    }
}
