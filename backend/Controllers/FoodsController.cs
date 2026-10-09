using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Data;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodsController : ControllerBase
{
    private readonly NutriPulseDbContext _context;

    public FoodsController(NutriPulseDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FoodItem>>> GetFoods()
    {
        var foods = await _context.FoodItems.ToListAsync();
        return Ok(foods);
    }

    [HttpPost]
    public async Task<ActionResult<FoodItem>> CreateFood([FromBody] FoodItem foodItem)
    {
        if (string.IsNullOrEmpty(foodItem.Id))
        {
            foodItem.Id = Guid.NewGuid().ToString();
        }
        foodItem.IsCustom = true;

        _context.FoodItems.Add(foodItem);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFoods), new { id = foodItem.Id }, foodItem);
    }
}
