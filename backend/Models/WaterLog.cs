namespace NutriPulse.Api.Models;

public class WaterLog
{
    public int Id { get; set; }
    public DateTime Date { get; set; } = DateTime.UtcNow.Date;
    public int AmountMl { get; set; } = 0;
}
