namespace NutriPulse.Api.Models;

public class UserProfile
{
    public int Id { get; set; } = 1;
    public string Name { get; set; } = "Alex Morgan";
    public int Age { get; set; } = 28;
    public string Gender { get; set; } = "male";
    public double HeightCm { get; set; } = 178.0;
    public double WeightKg { get; set; } = 75.5;
    public double TargetWeightKg { get; set; } = 72.0;
    public double ActivityLevel { get; set; } = 1.55;
    public string GoalType { get; set; } = "lose";
    public int CustomCalorieGoal { get; set; } = 2200;
    public int ProteinGoalG { get; set; } = 150;
    public int CarbsGoalG { get; set; } = 220;
    public int FatGoalG { get; set; } = 65;
    public int WaterGoalMl { get; set; } = 2500;
    public int StreakDays { get; set; } = 14;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
