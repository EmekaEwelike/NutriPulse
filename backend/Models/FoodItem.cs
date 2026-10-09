namespace NutriPulse.Api.Models;

public class FoodItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "snack"; // breakfast, lunch, dinner, snack
    public int Calories { get; set; }
    public int Protein { get; set; }
    public int Carbs { get; set; }
    public int Fat { get; set; }
    public int Fiber { get; set; }
    public string Serving { get; set; } = "1 serving";
    public string Icon { get; set; } = "🥗";
    public bool IsCustom { get; set; } = false;
}
