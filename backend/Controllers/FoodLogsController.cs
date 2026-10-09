using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodLogsController : ControllerBase
{
    private readonly NutriPulseDbContext _context;

    public FoodLogsController(NutriPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoggedFood>>> GetLoggedFoods()
    {
        var logs = await _context.LoggedFoods
            .OrderByDescending(l => l.Date)
            .ThenByDescending(l => l.Id)
            .ToListAsync();
        return Ok(logs);
    }

    [HttpPost]
    public async Task<ActionResult<LoggedFood>> LogFood([FromBody] LoggedFood logEntry)
    {
        if (string.IsNullOrEmpty(logEntry.Id))
        {
            logEntry.Id = $"log-{Guid.NewGuid()}";
        }
        if (string.IsNullOrEmpty(logEntry.LoggedAt))
        {
            logEntry.LoggedAt = DateTime.Now.ToString("hh:mm tt");
        }
        logEntry.Date = DateTime.UtcNow.Date;

        _context.LoggedFoods.Add(logEntry);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLoggedFoods), new { id = logEntry.Id }, logEntry);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteLog(string id)
    {
        var item = await _context.LoggedFoods.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.LoggedFoods.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
