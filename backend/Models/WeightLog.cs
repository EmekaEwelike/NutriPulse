namespace NutriPulse.Api.Models;

public class WeightLog
{
    public int Id { get; set; }
    public string Date { get; set; } = string.Empty;
    public double Weight { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
