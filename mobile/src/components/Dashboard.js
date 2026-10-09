import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { calculateMacrosSummary } from '../foodDatabase';

export default function Dashboard({ loggedFoods, profile, waterMl, onAddWater, onAddFoodClick }) {
  const summary = calculateMacrosSummary(loggedFoods);
  const targetCalories = profile.customCalorieGoal || 2200;
  const burnedCalories = 320; // Default active burned calories demo
  const netCalories = summary.calories - burnedCalories;
  const remainingCalories = targetCalories - netCalories;
  
  const progressPercent = Math.min(Math.round((summary.calories / targetCalories) * 100), 100);

  // Group foods by meal category
  const meals = {
    breakfast: loggedFoods.filter(f => f.category === 'breakfast'),
    lunch: loggedFoods.filter(f => f.category === 'lunch'),
    dinner: loggedFoods.filter(f => f.category === 'dinner'),
    snack: loggedFoods.filter(f => f.category === 'snack')
  };

  const getMealTotalCals = (items) => items.reduce((sum, item) => sum + (item.calories * (item.quantity || 1)), 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Primary Calorie Goal Glass Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroTitle}>Daily Energy Summary</Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeText}>Goal: {targetCalories} kcal</Text>
          </View>
        </View>

        <View style={styles.ringContainer}>
          <View style={styles.circularGauge}>
            <Text style={styles.ringNumber}>{summary.calories}</Text>
            <Text style={styles.ringUnit}>kcal eaten</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressPercentText}>{progressPercent}% of target</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Consumed</Text>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{summary.calories}</Text>
            <Text style={styles.statSub}>kcal</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Burned 🔥</Text>
            <Text style={[styles.statValue, { color: COLORS.accent }]}>{burnedCalories}</Text>
            <Text style={styles.statSub}>kcal</Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text style={[styles.statValue, { color: remainingCalories >= 0 ? COLORS.textPrimary : COLORS.danger }]}>
              {remainingCalories >= 0 ? remainingCalories : 0}
            </Text>
            <Text style={styles.statSub}>kcal left</Text>
          </View>
        </View>
      </View>

      {/* Macronutrients Breakdown Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Macronutrient Breakdown</Text>
        
        {/* Protein */}
        <View style={styles.macroRow}>
          <View style={styles.macroMeta}>
            <Text style={[styles.macroName, { color: COLORS.protein }]}>Protein</Text>
            <Text style={styles.macroValue}>{Math.round(summary.protein)}g / {profile.proteinGoalG || 150}g</Text>
          </View>
          <View style={styles.macroBarBg}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  backgroundColor: COLORS.protein, 
                  width: `${Math.min((summary.protein / (profile.proteinGoalG || 150)) * 100, 100)}%` 
                }
              ]} 
            />
          </View>
        </View>

        {/* Carbs */}
        <View style={styles.macroRow}>
          <View style={styles.macroMeta}>
            <Text style={[styles.macroName, { color: COLORS.carbs }]}>Carbohydrates</Text>
            <Text style={styles.macroValue}>{Math.round(summary.carbs)}g / {profile.carbsGoalG || 220}g</Text>
          </View>
          <View style={styles.macroBarBg}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  backgroundColor: COLORS.carbs, 
                  width: `${Math.min((summary.carbs / (profile.carbsGoalG || 220)) * 100, 100)}%` 
                }
              ]} 
            />
          </View>
        </View>

        {/* Fat */}
        <View style={styles.macroRow}>
          <View style={styles.macroMeta}>
            <Text style={[styles.macroName, { color: COLORS.fat }]}>Fats</Text>
            <Text style={styles.macroValue}>{Math.round(summary.fat)}g / {profile.fatGoalG || 65}g</Text>
          </View>
          <View style={styles.macroBarBg}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  backgroundColor: COLORS.fat, 
                  width: `${Math.min((summary.fat / (profile.fatGoalG || 65)) * 100, 100)}%` 
                }
              ]} 
            />
          </View>
        </View>
      </View>

      {/* Water Hydration Card */}
      <View style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterTitleGroup}>
            <Text style={styles.waterIcon}>💧</Text>
            <View>
              <Text style={styles.waterTitle}>Hydration Tracker</Text>
              <Text style={styles.waterSubtitle}>{waterMl} ml of {profile.waterGoalMl || 2500} ml daily goal</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.waterAddBtn} onPress={() => onAddWater(250)}>
            <Text style={styles.waterAddBtnText}>+ 250ml</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.waterProgressBg}>
          <View style={[styles.waterProgressFill, { width: `${Math.min((waterMl / (profile.waterGoalMl || 2500)) * 100, 100)}%` }]} />
        </View>
      </View>

      {/* Meal Categories Overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Meals</Text>
        <TouchableOpacity onPress={() => onAddFoodClick('all')}>
          <Text style={styles.sectionLink}>+ Add Food</Text>
        </TouchableOpacity>
      </View>

      {/* Breakfast Card */}
      <MealCategoryCard 
        title="Breakfast" 
        icon="🍳" 
        items={meals.breakfast} 
        totalCals={getMealTotalCals(meals.breakfast)} 
        color={COLORS.breakfast}
        onAdd={() => onAddFoodClick('breakfast')}
      />

      {/* Lunch Card */}
      <MealCategoryCard 
        title="Lunch" 
        icon="🥗" 
        items={meals.lunch} 
        totalCals={getMealTotalCals(meals.lunch)} 
        color={COLORS.lunch}
        onAdd={() => onAddFoodClick('lunch')}
      />

      {/* Dinner Card */}
      <MealCategoryCard 
        title="Dinner" 
        icon="🥩" 
        items={meals.dinner} 
        totalCals={getMealTotalCals(meals.dinner)} 
        color={COLORS.dinner}
        onAdd={() => onAddFoodClick('dinner')}
      />

      {/* Snack Card */}
      <MealCategoryCard 
        title="Snacks" 
        icon="🍎" 
        items={meals.snack} 
        totalCals={getMealTotalCals(meals.snack)} 
        color={COLORS.snack}
        onAdd={() => onAddFoodClick('snack')}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MealCategoryCard({ title, icon, items, totalCals, color, onAdd }) {
  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealTitleBox}>
          <Text style={styles.mealIcon}>{icon}</Text>
          <View>
            <Text style={styles.mealTitle}>{title}</Text>
            <Text style={styles.mealSub}>{items.length} {items.length === 1 ? 'item' : 'items'} logged</Text>
          </View>
        </View>

        <View style={styles.mealRightBox}>
          <Text style={[styles.mealCalText, { color }]}>{totalCals} kcal</Text>
          <TouchableOpacity style={styles.quickAddIconBtn} onPress={onAdd}>
            <Text style={styles.quickAddIconText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {items.length > 0 && (
        <View style={styles.itemList}>
          {items.map((item, idx) => (
            <View key={item.id || idx} style={styles.foodItemRow}>
              <Text style={styles.foodItemName}>{item.icon || '📌'} {item.name}</Text>
              <Text style={styles.foodItemCals}>{item.calories * (item.quantity || 1)} kcal</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.background
  },
  heroCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  targetBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  targetBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600'
  },
  ringContainer: {
    alignItems: 'center',
    marginVertical: 12
  },
  circularGauge: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  ringNumber: {
    color: COLORS.textPrimary,
    fontSize: 40,
    fontWeight: '800'
  },
  ringUnit: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 12
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#1E293B',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5
  },
  progressPercentText: {
    color: COLORS.primaryLight,
    fontSize: 13,
    fontWeight: '600'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder
  },
  statBox: {
    alignItems: 'center'
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700'
  },
  statSub: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  dividerVertical: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.cardBorder
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16
  },
  macroRow: {
    marginBottom: 12
  },
  macroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  macroName: {
    fontSize: 14,
    fontWeight: '600'
  },
  macroValue: {
    color: COLORS.textSecondary,
    fontSize: 13
  },
  macroBarBg: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden'
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 4
  },
  waterCard: {
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    marginBottom: 20
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  waterTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  waterIcon: {
    fontSize: 24,
    marginRight: 10
  },
  waterTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  waterSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  waterAddBtn: {
    backgroundColor: COLORS.cyan,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  waterAddBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 12
  },
  waterProgressBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  waterProgressFill: {
    height: '100%',
    backgroundColor: COLORS.cyan,
    borderRadius: 4
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700'
  },
  sectionLink: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 14
  },
  mealCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  mealTitleBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mealIcon: {
    fontSize: 24,
    marginRight: 12
  },
  mealTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  mealSub: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  mealRightBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mealCalText: {
    fontSize: 15,
    fontWeight: '700',
    marginRight: 12
  },
  quickAddIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickAddIconText: {
    color: COLORS.textPrimary,
    fontSize: 18,
    lineHeight: 20
  },
  itemList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder
  },
  foodItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  foodItemName: {
    color: COLORS.textSecondary,
    fontSize: 13
  },
  foodItemCals: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  }
});
