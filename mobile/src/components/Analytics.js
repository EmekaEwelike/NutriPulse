import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { COLORS } from '../theme';

export default function Analytics({ weightHistory, onAddWeight, profile }) {
  const [newWeightInput, setNewWeightInput] = useState('');

  // Sample 7-day intake data
  const weeklyData = [
    { day: 'Mon', calories: 2150, target: 2200 },
    { day: 'Tue', calories: 2280, target: 2200 },
    { day: 'Wed', calories: 1980, target: 2200 },
    { day: 'Thu', calories: 2310, target: 2200 },
    { day: 'Fri', calories: 2050, target: 2200 },
    { day: 'Sat', calories: 2420, target: 2200 },
    { day: 'Sun', calories: 1890, target: 2200 }
  ];

  const maxCal = Math.max(...weeklyData.map(d => d.calories), 2500);

  const handleLogNewWeight = () => {
    const val = parseFloat(newWeightInput);
    if (!val || isNaN(val)) return;
    onAddWeight(val);
    setNewWeightInput('');
  };

  const currentWeight = weightHistory.length > 0 ? weightHistory[weightHistory.length - 1].weight : profile.weightKg;
  const targetWeight = profile.targetWeightKg || 72.0;
  const weightDiff = (currentWeight - targetWeight).toFixed(1);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Analytics Title */}
      <Text style={styles.screenTitle}>Nutrition & Weight Analytics</Text>

      {/* Weekly Calorie Trends Bar Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Weekly Calorie Trend</Text>
          <Text style={styles.cardSubtitle}>Avg: 2,154 kcal/day</Text>
        </View>

        <View style={styles.chartContainer}>
          {weeklyData.map(item => {
            const heightPercent = Math.min(Math.round((item.calories / maxCal) * 100), 100);
            const isOver = item.calories > item.target;

            return (
              <View key={item.day} style={styles.barColumn}>
                <Text style={styles.barValText}>{item.calories}</Text>
                <View style={styles.barTrack}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${heightPercent}%`, 
                        backgroundColor: isOver ? COLORS.accent : COLORS.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barDayLabel}>{item.day}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.targetLineLegend}>
          <View style={styles.legendDot} />
          <Text style={styles.legendText}>Target Goal: {profile.customCalorieGoal || 2200} kcal</Text>
        </View>
      </View>

      {/* Macronutrient Balance Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Average Macro Distribution</Text>
        <Text style={styles.cardSubtitle}>Recommended Ratio: 30% P / 45% C / 25% F</Text>

        <View style={styles.macroRatioBar}>
          <View style={[styles.macroSegment, { width: '32%', backgroundColor: COLORS.protein }]} />
          <View style={[styles.macroSegment, { width: '44%', backgroundColor: COLORS.carbs }]} />
          <View style={[styles.macroSegment, { width: '24%', backgroundColor: COLORS.fat }]} />
        </View>

        <View style={styles.macroRatioDetails}>
          <View style={styles.ratioItem}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.protein }]} />
            <Text style={styles.ratioLabel}>Protein (32%)</Text>
          </View>
          <View style={styles.ratioItem}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.carbs }]} />
            <Text style={styles.ratioLabel}>Carbs (44%)</Text>
          </View>
          <View style={styles.ratioItem}>
            <View style={[styles.colorDot, { backgroundColor: COLORS.fat }]} />
            <Text style={styles.ratioLabel}>Fats (24%)</Text>
          </View>
        </View>
      </View>

      {/* Weight Progress Tracker */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Weight Tracker</Text>
          <View style={styles.weightBadge}>
            <Text style={styles.weightBadgeText}>{weightDiff > 0 ? `${weightDiff} kg to goal` : 'Goal Achieved! 🎉'}</Text>
          </View>
        </View>

        <View style={styles.weightMetricsRow}>
          <View style={styles.weightMetric}>
            <Text style={styles.weightLabel}>Current</Text>
            <Text style={styles.weightValue}>{currentWeight} kg</Text>
          </View>
          <View style={styles.weightMetric}>
            <Text style={styles.weightLabel}>Target</Text>
            <Text style={[styles.weightValue, { color: COLORS.primaryLight }]}>{targetWeight} kg</Text>
          </View>
        </View>

        {/* Weight Log Form */}
        <View style={styles.logWeightRow}>
          <TextInput
            style={styles.weightInput}
            placeholder="Log new weight (kg)"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="numeric"
            value={newWeightInput}
            onChangeText={setNewWeightInput}
          />
          <TouchableOpacity style={styles.logWeightBtn} onPress={handleLogNewWeight}>
            <Text style={styles.logWeightBtnText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  screenTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700'
  },
  cardSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    marginVertical: 16,
    paddingHorizontal: 8
  },
  barColumn: {
    alignItems: 'center',
    flex: 1
  },
  barValText: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 4
  },
  barTrack: {
    width: 16,
    height: 100,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    borderRadius: 8
  },
  barDayLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600'
  },
  targetLineLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 6
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  macroRatioBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 16
  },
  macroSegment: {
    height: '100%'
  },
  macroRatioDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  ratioItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  ratioLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  weightBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  weightBadgeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '700'
  },
  weightMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderRadius: 12
  },
  weightMetric: {
    alignItems: 'center'
  },
  weightLabel: {
    color: COLORS.textSecondary,
    fontSize: 12
  },
  weightValue: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2
  },
  logWeightRow: {
    flexDirection: 'row',
    marginTop: 12
  },
  weightInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  logWeightBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logWeightBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 14
  }
});
