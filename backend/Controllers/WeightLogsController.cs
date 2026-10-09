using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeightLogsController : ControllerBase
{
    private readonly NutriPulseDbContext _context;

    public WeightLogsController(NutriPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WeightLog>>> GetWeightHistory()
    {
        var history = await _context.WeightLogs.OrderBy(w => w.Id).ToListAsync();
        return Ok(history);
    }

    [HttpPost]
    public async Task<ActionResult<WeightLog>> AddWeightLog([FromBody] WeightLog log)
    {
        if (string.IsNullOrEmpty(log.Date))
        {
            log.Date = DateTime.Now.ToString("ddd");
        }
        log.CreatedAt = DateTime.UtcNow;

        _context.WeightLogs.Add(log);

        // Update profile weight as well
        var profile = await _context.UserProfiles.FirstOrDefaultAsync();
        if (profile != null)
        {
            profile.WeightKg = log.Weight;
        }

        await _context.SaveChangesAsync();
        return Ok(log);
    }
}
