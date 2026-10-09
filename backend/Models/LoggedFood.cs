namespace NutriPulse.Api.Models;

public class LoggedFood
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string FoodId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "breakfast";
    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    public int Fiber { get; set; }
    public string Serving { get; set; } = "1 serving";
    public string Icon { get; set; } = "🥣";
    public double Quantity { get; set; } = 1.0;
    public string LoggedAt { get; set; } = DateTime.Now.ToString("hh:mm tt");
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
}
