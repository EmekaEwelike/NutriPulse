import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../theme';
import { calculateTDEE } from '../storage';
import { changePasswordApi } from '../api';

export default function Profile({ profile, onUpdateProfile, authState, onOpenAuth, onLogout }) {
  const [formData, setFormData] = useState({ ...profile });
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  // Change Password State
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

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

  const handleChangePassword = async () => {
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    const token = authState?.token;
    const res = await changePasswordApi(currentPassword, newPassword, token);
    setPassLoading(false);

    if (res.success || res.ok) {
      setPassSuccess('✓ Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setShowChangePass(false), 2000);
    } else {
      setPassError(res.message || 'Failed to change password. Verify your current password.');
    }
  };

  const currentUser = authState?.user;

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

      {/* ---------------- ACCOUNT & SECURITY CARD ---------------- */}
      <View style={styles.card}>
        <View style={styles.accountHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarTextLarge}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : formData.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.accountMeta}>
            <Text style={styles.accountName}>
              {currentUser?.name || formData.name}
            </Text>
            <Text style={styles.accountEmail}>
              {currentUser?.email || 'Guest Mode (Not Synced)'}
            </Text>
            {currentUser && (
              <View style={styles.badgeRow}>
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓ Confirmed Email</Text>
                </View>
                <View style={styles.providerBadge}>
                  <Text style={styles.providerText}>
                    {currentUser.authProvider === 'google' ? 'Google Auth' : 'Password Auth'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {currentUser ? (
          <View style={styles.authActionsRow}>
            <TouchableOpacity
              style={styles.securityBtn}
              onPress={() => setShowChangePass(!showChangePass)}
            >
              <Text style={styles.securityBtnText}>
                {showChangePass ? 'Cancel Password Change' : '🔒 Change Password'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.guestPrompt}>
            <Text style={styles.guestText}>
              Sign in with your email or Google account to sync your diet logs and goals across devices.
            </Text>
            <TouchableOpacity style={styles.signInBtn} onPress={onOpenAuth}>
              <Text style={styles.signInBtnText}>Sign In / Register</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Change Password Dropdown Form */}
        {showChangePass && (
          <View style={styles.changePassContainer}>
            <Text style={styles.sectionHeader}>Change Password</Text>

            {!!passError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {passError}</Text>
              </View>
            )}
            {!!passSuccess && (
              <View style={styles.successBox}>
                <Text style={styles.successText}>{passSuccess}</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <Text style={styles.fieldLabel}>New Password (min 6 characters)</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.fieldLabel}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
              style={[styles.updatePassBtn, passLoading && { opacity: 0.6 }]}
              onPress={handleChangePassword}
              disabled={passLoading}
            >
              {passLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.updatePassBtnText}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ---------------- PERSONAL SPECS CARD ---------------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Personal Attributes</Text>

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

        <Text style={styles.fieldLabel}>Biological Gender</Text>
        <View style={styles.goalSelectorRow}>
          {['male', 'female'].map(g => (
            <TouchableOpacity
              key={g}
              style={[styles.goalBox, formData.gender === g && styles.goalBoxActive]}
              onPress={() => setFormData({ ...formData, gender: g })}
            >
              <Text style={[styles.goalTitle, formData.gender === g && styles.goalTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ---------------- GOALS & NUTRITION TARGETS ---------------- */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fitness & Diet Goals</Text>

        <Text style={styles.fieldLabel}>Target Goal</Text>
        <View style={styles.goalSelectorRow}>
          {[
            { id: 'lose', label: 'Fat Loss', desc: '-500 kcal' },
            { id: 'maintain', label: 'Maintain', desc: 'Balanced' },
            { id: 'gain', label: 'Muscle Gain', desc: '+400 kcal' }
          ].map(g => (
            <TouchableOpacity
              key={g.id}
              style={[styles.goalBox, formData.goalType === g.id && styles.goalBoxActive]}
              onPress={() => setFormData({ ...formData, goalType: g.id })}
            >
              <Text style={[styles.goalTitle, formData.goalType === g.id && styles.goalTextActive]}>
                {g.label}
              </Text>
              <Text style={styles.goalDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={handleRecalculate}>
          <Text style={styles.calcBtnText}>⚡ Auto-Calculate Recommended Macros (TDEE)</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />

        <Text style={styles.fieldLabel}>Target Daily Calories (kcal)</Text>
        <TextInput
          style={[styles.input, styles.highlightInput]}
          keyboardType="numeric"
          value={String(formData.customCalorieGoal)}
          onChangeText={val => setFormData({ ...formData, customCalorieGoal: parseInt(val, 10) || 0 })}
        />

        <View style={styles.inputRow}>
          <View style={styles.thirdCol}>
            <Text style={styles.fieldLabel}>Protein (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.proteinGoalG)}
              onChangeText={val => setFormData({ ...formData, proteinGoalG: parseInt(val, 10) || 0 })}
            />
          </View>

          <View style={styles.thirdCol}>
            <Text style={styles.fieldLabel}>Carbs (g)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(formData.carbsGoalG)}
              onChangeText={val => setFormData({ ...formData, carbsGoalG: parseInt(val, 10) || 0 })}
            />
          </View>

          <View style={styles.thirdCol}>
            <Text style={styles.fieldLabel}>Fat (g)</Text>
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
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  cardTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 14
  },
  avatarTextLarge: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold'
  },
  accountMeta: {
    flex: 1
  },
  accountName: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700'
  },
  accountEmail: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  verifiedText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '600'
  },
  providerBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)'
  },
  providerText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600'
  },
  authActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  securityBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8
  },
  securityBtnText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600'
  },
  guestPrompt: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  guestText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  signInBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700'
  },
  changePassContainer: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder
  },
  sectionHeader: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '500'
  },
  successBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10
  },
  successText: {
    color: COLORS.primaryLight,
    fontSize: 12,
    fontWeight: '600'
  },
  updatePassBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14
  },
  updatePassBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700'
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 15
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
