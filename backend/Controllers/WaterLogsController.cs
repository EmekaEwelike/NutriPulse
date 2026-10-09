using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WaterLogsController : ControllerBase
{
    private readonly NutriPulseDbContext _context;

    public WaterLogsController(NutriPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<WaterLog>> GetTodayWater()
    {
        var today = DateTime.UtcNow.Date;
        var waterLog = await _context.WaterLogs.FirstOrDefaultAsync(w => w.Date == today);
        if (waterLog == null)
        {
            waterLog = new WaterLog { Date = today, AmountMl = 1750 };
            _context.WaterLogs.Add(waterLog);
            await _context.SaveChangesAsync();
        }
        return Ok(waterLog);
    }

    [HttpPost]
    public async Task<ActionResult<WaterLog>> LogWater([FromBody] WaterLog request)
    {
        var today = DateTime.UtcNow.Date;
        var waterLog = await _context.WaterLogs.FirstOrDefaultAsync(w => w.Date == today);
        if (waterLog == null)
        {
            waterLog = new WaterLog { Date = today, AmountMl = request.AmountMl };
            _context.WaterLogs.Add(waterLog);
        }
        else
        {
            waterLog.AmountMl = request.AmountMl;
        }

        await _context.SaveChangesAsync();
        return Ok(waterLog);
    }
}
