import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';
import { calculateTDEE } from '../storage';

export default function Profile({ profile, onUpdateProfile }) {
  const [formData, setFormData] = useState({ ...profile });
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  const handleRecalculate = () => {
    const calc = calculateTDEE(formData);
    const updated = {
      ...formData,
      customCalorieGoal: calc.targetCalories,
      proteinGoalG: calc.proteinG,
      carbsGoalG: calc.carbsG,
      fatGoalG: calc.fatG
    };
    setFormData(updated);
    onUpdateProfile(updated);
    triggerSaveToast();
  };

  const handleManualSave = () => {
    onUpdateProfile(formData);
    triggerSaveToast();
  };

  const triggerSaveToast = () => {
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 2500);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Title Header */}
      <Text style={styles.screenTitle}>Profile & Goals</Text>

      {/* Save Success Alert */}
      {isSavedMsg && (
        <View style={styles.toastBg}>
          <Text style={styles.toastText}>✓ Profile & Calorie Goals Saved!</Text>
        </View>
      )}

      {/* Personal Specs Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Attributes</Text>
        
        {/* Name */}
        <Text style={styles.fieldLabel}>Display Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={val => setFormData({ ...formData, name: val })}
        />

        <View style={styles.inputRow}>
          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>Age</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.age)}
              onChangeText={val => setFormData({ ...formData, age: parseInt(val, 10) || 0 })}
            />
          </View>

          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.heightCm)}
              onChangeText={val => setFormData({ ...formData, heightCm: parseInt(val, 10) || 0 })}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>Current Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.weightKg)}
              onChangeText={val => setFormData({ ...formData, weightKg: parseFloat(val) || 0 })}
            />
          </View>

          <View style={styles.halfCol}>
            <Text style={styles.fieldLabel}>Target Weight (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.targetWeightKg)}
              onChangeText={val => setFormData({ ...formData, targetWeightKg: parseFloat(val) || 0 })}
            />
          </View>
        </View>
      </View>

      {/* Fitness Objective Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fitness Objective</Text>
        <View style={styles.goalSelectorRow}>
          {[
            { id: 'lose', label: 'Fat Loss', desc: '-500 kcal' },
            { id: 'maintain', label: 'Maintenance', desc: '0 kcal' },
            { id: 'gain', label: 'Muscle Gain', desc: '+400 kcal' }
          ].map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBox, formData.goalType === g.id && styles.goalBoxActive]}
              onPress={() => setFormData({ ...formData, goalType: g.id })}
            >
              <Text style={[styles.goalTitle, formData.goalType === g.id && styles.goalTextActive]}>{g.label}</Text>
              <Text style={styles.goalDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={handleRecalculate}>
          <Text style={styles.calcBtnText}>⚡ Recalculate BMR & Daily Targets</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Macro Goals Customizer */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily Calorie & Macro Target Overrides</Text>

        <Text style={styles.fieldLabel}>Daily Target Calories (kcal)</Text>
        <TextInput
          style={[styles.input, styles.highlightInput]}
          keyboardType="numeric"
          value={String(formData.customCalorieGoal)}
          onChangeText={val => setFormData({ ...formData, customCalorieGoal: parseInt(val, 10) || 0 })}
        />

        <View style={styles.inputRow}>
          <View style={styles.thirdCol}>
            <Text style={[styles.fieldLabel, { color: COLORS.protein }]}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.proteinGoalG)}
              onChangeText={val => setFormData({ ...formData, proteinGoalG: parseInt(val, 10) || 0 })}
            />
          </View>

          <View style={styles.thirdCol}>
            <Text style={[styles.fieldLabel, { color: COLORS.carbs }]}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.carbsGoalG)}
              onChangeText={val => setFormData({ ...formData, carbsGoalG: parseInt(val, 10) || 0 })}
            />
          </View>

          <View style={styles.thirdCol}>
            <Text style={[styles.fieldLabel, { color: COLORS.fat }]}>Fat (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.fatGoalG)}
              onChangeText={val => setFormData({ ...formData, fatGoalG: parseInt(val, 10) || 0 })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleManualSave}>
          <Text style={styles.saveBtnText}>Save Goals</Text>
        </TouchableOpacity>
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
  toastBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center'
  },
  toastText: {
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 14
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
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12
  },
  highlightInput: {
    borderColor: COLORS.primary,
    color: COLORS.primaryLight,
    fontWeight: '700',
    fontSize: 18
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfCol: {
    width: '48%'
  },
  thirdCol: {
    width: '31%'
  },
  goalSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  goalBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  goalBoxActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(16, 185, 129, 0.1)'
  },
  goalTitle: {
    color: COLORS.textPrimary,
    fontWeight: '700',
    fontSize: 13,
    marginBottom: 2
  },
  goalTextActive: {
    color: COLORS.primaryLight
  },
  goalDesc: {
    color: COLORS.textMuted,
    fontSize: 11
  },
  calcBtn: {
    backgroundColor: COLORS.secondaryGlow,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center'
  },
  calcBtnText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 14
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  saveBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15
  }
});
