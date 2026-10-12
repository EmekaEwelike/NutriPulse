using Microsoft.EntityFrameworkCore;
using NutriPulse.Api.Models;

namespace NutriPulse.Api.Data;

public static class DbInitializer
{
    public static void Initialize(NutriPulseDbContext context)
    {
        context.Database.EnsureCreated();

        try
        {
            var isPg = context.Database.ProviderName?.Contains("PostgreSQL", StringComparison.OrdinalIgnoreCase) == true
                    || context.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true;

            if (isPg)
            {
                context.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS ""Users"" (
                        ""Id"" SERIAL PRIMARY KEY,
                        ""Email"" VARCHAR(255) NOT NULL UNIQUE,
                        ""Name"" VARCHAR(255) NOT NULL,
                        ""PasswordHash"" TEXT,
                        ""IsEmailConfirmed"" BOOLEAN NOT NULL DEFAULT FALSE,
                        ""EmailConfirmationCode"" VARCHAR(10),
                        ""EmailConfirmationCodeExpiry"" TIMESTAMPTZ,
                        ""PasswordResetCode"" VARCHAR(10),
                        ""PasswordResetCodeExpiry"" TIMESTAMPTZ,
                        ""GoogleId"" VARCHAR(255),
                        ""AuthProvider"" VARCHAR(50) NOT NULL DEFAULT 'local',
                        ""CreatedAt"" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        ""UpdatedAt"" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                ");
            }
            else
            {
                context.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS ""Users"" (
                        ""Id"" INTEGER PRIMARY KEY AUTOINCREMENT,
                        ""Email"" TEXT NOT NULL UNIQUE,
                        ""Name"" TEXT NOT NULL,
                        ""PasswordHash"" TEXT,
                        ""IsEmailConfirmed"" INTEGER NOT NULL DEFAULT 0,
                        ""EmailConfirmationCode"" TEXT,
                        ""EmailConfirmationCodeExpiry"" TEXT,
                        ""PasswordResetCode"" TEXT,
                        ""PasswordResetCodeExpiry"" TEXT,
                        ""GoogleId"" TEXT,
                        ""AuthProvider"" TEXT NOT NULL DEFAULT 'local',
                        ""CreatedAt"" TEXT NOT NULL,
                        ""UpdatedAt"" TEXT NOT NULL
                    );
                ");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"--> Note on Users table creation: {ex.Message}");
        }

        if (!context.Users.Any())
        {
            context.Users.Add(new User
            {
                Email = "alex.morgan@nutripulse.io",
                Name = "Alex Morgan",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
                IsEmailConfirmed = true,
                AuthProvider = "local",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
            context.SaveChanges();
        }

        if (!context.UserProfiles.Any())
        {
            context.UserProfiles.Add(new UserProfile
            {
                Id = 1,
                Name = "Alex Morgan",
                Age = 28,
                Gender = "male",
                HeightCm = 178.0,
                WeightKg = 75.5,
                TargetWeightKg = 72.0,
                ActivityLevel = 1.55,
                GoalType = "lose",
                CustomCalorieGoal = 2200,
                ProteinGoalG = 150,
                CarbsGoalG = 220,
                FatGoalG = 65,
                WaterGoalMl = 2500,
                StreakDays = 14
            });
        }

        if (!context.FoodItems.Any())
        {
            context.FoodItems.AddRange(
                new FoodItem { Id = "b1", Name = "Oatmeal with Berries & Honey", Category = "breakfast", Calories = 320, Protein = 12, Carbs = 58, Fat = 5, Fiber = 8, Serving = "1 bowl (250g)", Icon = "🥣" },
                new FoodItem { Id = "b2", Name = "Scrambled Eggs with Avocado", Category = "breakfast", Calories = 380, Protein = 18, Carbs = 6, Fat = 31, Fiber = 5, Serving = "2 eggs + 1/2 avocado", Icon = "🍳" },
                new FoodItem { Id = "b3", Name = "Greek Yogurt & Granola", Category = "breakfast", Calories = 290, Protein = 20, Carbs = 34, Fat = 8, Fiber = 3, Serving = "200g yogurt", Icon = "🥛" },
                new FoodItem { Id = "b4", Name = "Whole Wheat Toast with Peanut Butter", Category = "breakfast", Calories = 280, Protein = 10, Carbs = 30, Fat = 14, Fiber = 4, Serving = "2 slices", Icon = "🍞" },
                new FoodItem { Id = "b5", Name = "Protein Berry Smoothie", Category = "breakfast", Calories = 250, Protein = 24, Carbs = 32, Fat = 3, Fiber = 6, Serving = "400ml", Icon = "🥤" },
                
                new FoodItem { Id = "l1", Name = "Grilled Chicken Caesar Salad", Category = "lunch", Calories = 450, Protein = 42, Carbs = 12, Fat = 26, Fiber = 4, Serving = "1 large bowl", Icon = "🥗" },
                new FoodItem { Id = "l2", Name = "Salmon Quinoa Power Bowl", Category = "lunch", Calories = 540, Protein = 38, Carbs = 48, Fat = 22, Fiber = 7, Serving = "1 bowl", Icon = "🍲" },
                new FoodItem { Id = "l3", Name = "Turkey & Swiss Avocado Wrap", Category = "lunch", Calories = 420, Protein = 32, Carbs = 38, Fat = 16, Fiber = 5, Serving = "1 wrap", Icon = "🌯" },
                new FoodItem { Id = "l4", Name = "Brown Rice & Black Bean Bowl", Category = "lunch", Calories = 410, Protein = 16, Carbs = 72, Fat = 6, Fiber = 14, Serving = "350g", Icon = "🍚" },
                new FoodItem { Id = "l5", Name = "Tuna Salad Sandwich", Category = "lunch", Calories = 390, Protein = 29, Carbs = 34, Fat = 15, Fiber = 4, Serving = "1 sandwich", Icon = "🥪" },

                new FoodItem { Id = "d1", Name = "Ribeye Steak with Asparagus", Category = "dinner", Calories = 650, Protein = 52, Carbs = 8, Fat = 46, Fiber = 3, Serving = "250g steak", Icon = "🥩" },
                new FoodItem { Id = "d2", Name = "Baked Salmon with Sweet Potato", Category = "dinner", Calories = 510, Protein = 36, Carbs = 42, Fat = 20, Fiber = 6, Serving = "1 fillet + 1 potato", Icon = "🐟" },
                new FoodItem { Id = "d3", Name = "Chicken Breast & Roasted Vegetables", Category = "dinner", Calories = 430, Protein = 45, Carbs = 24, Fat = 14, Fiber = 6, Serving = "350g plate", Icon = "🍗" },
                new FoodItem { Id = "d4", Name = "Tofu Stir-fry with Brown Rice", Category = "dinner", Calories = 440, Protein = 22, Carbs = 56, Fat = 15, Fiber = 8, Serving = "1 plate", Icon = "🥘" },
                new FoodItem { Id = "d5", Name = "Lean Beef Pasta Bolognese", Category = "dinner", Calories = 580, Protein = 38, Carbs = 64, Fat = 18, Fiber = 5, Serving = "1 plate (300g)", Icon = "🍝" },

                new FoodItem { Id = "s1", Name = "Handful of Almonds & Walnuts", Category = "snack", Calories = 170, Protein = 6, Carbs = 6, Fat = 15, Fiber = 3, Serving = "30g", Icon = "🥜" },
                new FoodItem { Id = "s2", Name = "Whey Protein Shake", Category = "snack", Calories = 140, Protein = 26, Carbs = 3, Fat = 2, Fiber = 1, Serving = "1 scoop with water", Icon = "🥛" },
                new FoodItem { Id = "s3", Name = "Apple with Peanut Butter", Category = "snack", Calories = 210, Protein = 5, Carbs = 28, Fat = 10, Fiber = 5, Serving = "1 medium apple + 1 tbsp PB", Icon = "🍎" },
                new FoodItem { Id = "s4", Name = "Dark Chocolate (85%)", Category = "snack", Calories = 160, Protein = 2, Carbs = 12, Fat = 12, Fiber = 3, Serving = "30g", Icon = "🍫" },
                new FoodItem { Id = "s5", Name = "Cottage Cheese with Honey", Category = "snack", Calories = 180, Protein = 18, Carbs = 16, Fat = 4, Fiber = 0, Serving = "150g", Icon = "🍨" }
            );
        }

        if (!context.LoggedFoods.Any())
        {
            var today = DateTime.UtcNow.Date;
            context.LoggedFoods.AddRange(
                new LoggedFood { Id = "log-1", FoodId = "b1", Name = "Oatmeal with Berries & Honey", Category = "breakfast", Calories = 320, Protein = 12, Carbs = 58, Fat = 5, Fiber = 8, Serving = "1 bowl (250g)", Icon = "🥣", Quantity = 1, LoggedAt = "08:30 AM", Date = today },
                new LoggedFood { Id = "log-2", FoodId = "b2", Name = "Scrambled Eggs with Avocado", Category = "breakfast", Calories = 380, Protein = 18, Carbs = 6, Fat = 31, Fiber = 5, Serving = "2 eggs + 1/2 avocado", Icon = "🍳", Quantity = 1, LoggedAt = "08:35 AM", Date = today },
                new LoggedFood { Id = "log-3", FoodId = "l1", Name = "Grilled Chicken Caesar Salad", Category = "lunch", Calories = 450, Protein = 42, Carbs = 12, Fat = 26, Fiber = 4, Serving = "1 large bowl", Icon = "🥗", Quantity = 1, LoggedAt = "01:15 PM", Date = today },
                new LoggedFood { Id = "log-4", FoodId = "s1", Name = "Handful of Almonds & Walnuts", Category = "snack", Calories = 170, Protein = 6, Carbs = 6, Fat = 15, Fiber = 3, Serving = "30g", Icon = "🥜", Quantity = 1, LoggedAt = "04:45 PM", Date = today }
            );
        }

        if (!context.WaterLogs.Any())
        {
            context.WaterLogs.Add(new WaterLog { Date = DateTime.UtcNow.Date, AmountMl = 1750 });
        }

        if (!context.WeightLogs.Any())
        {
            context.WeightLogs.AddRange(
                new WeightLog { Date = "Mon", Weight = 76.5 },
                new WeightLog { Date = "Tue", Weight = 76.2 },
                new WeightLog { Date = "Wed", Weight = 76.0 },
                new WeightLog { Date = "Thu", Weight = 75.8 },
                new WeightLog { Date = "Fri", Weight = 75.7 },
                new WeightLog { Date = "Sat", Weight = 75.6 },
                new WeightLog { Date = "Sun", Weight = 75.5 }
            );
        }

        context.SaveChanges();
    }
}
