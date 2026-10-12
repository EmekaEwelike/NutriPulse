import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { COLORS } from '../theme';
import {
  loginApi,
  registerApi,
  verifyEmailApi,
  resendCodeApi,
  googleAuthApi,
  forgotPasswordApi,
  resetPasswordApi,
  saveStoredAuth
} from '../api';

export default function AuthModal({ visible, onClose, onAuthSuccess }) {
  // Modes: 'login' | 'register' | 'verify' | 'forgot' | 'reset'
  const [mode, setMode] = useState('login');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const resetForm = () => {
    setErrorMsg('');
    setInfoMsg('');
    setLoading(false);
  };

  const handleSwitchMode = (newMode) => {
    resetForm();
    setMode(newMode);
  };

  // -------------------------------------------------------------
  // LOGIN HANDLER
  // -------------------------------------------------------------
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    resetForm();

    const res = await loginApi(email.trim(), password);
    setLoading(false);

    if (res.requiresVerification) {
      setInfoMsg(res.message || 'Please enter the 6-digit verification code.');
      setMode('verify');
      return;
    }

    if (res.success && res.token) {
      saveStoredAuth(res);
      onAuthSuccess(res);
      onClose();
    } else {
      setErrorMsg(res.message || 'Invalid email or password.');
    }
  };

  // -------------------------------------------------------------
  // REGISTER HANDLER
  // -------------------------------------------------------------
  const handleRegister = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    resetForm();

    const res = await registerApi(email.trim(), password, name.trim());
    setLoading(false);

    if (res.success || res.requiresVerification) {
      setInfoMsg(`Verification code sent to ${email.trim()}! Please check your inbox.`);
      setMode('verify');
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  // -------------------------------------------------------------
  // VERIFY EMAIL (OTP) HANDLER
  // -------------------------------------------------------------
  const handleVerifyEmail = async () => {
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    resetForm();

    const res = await verifyEmailApi(email.trim(), otpCode.trim());
    setLoading(false);

    if (res.success && res.token) {
      saveStoredAuth(res);
      onAuthSuccess(res);
      onClose();
    } else {
      setErrorMsg(res.message || 'Invalid or expired verification code.');
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    resetForm();

    const res = await resendCodeApi(email.trim());
    setLoading(false);

    if (res.ok || res.success) {
      setInfoMsg('A new 6-digit code has been sent!');
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setErrorMsg(res.message || 'Could not resend code. Please try again later.');
    }
  };

  // -------------------------------------------------------------
  // GOOGLE SIGN-IN HANDLER
  // -------------------------------------------------------------
  const handleGoogleAuth = async () => {
    setLoading(true);
    resetForm();

    // Use current email or fallback test account for Google sign-in
    const targetEmail = email.includes('@gmail.com') ? email.trim() : 'alex.user@gmail.com';
    const targetName = name.trim() || 'Alex Google User';

    const res = await googleAuthApi({
      email: targetEmail,
      name: targetName,
      googleId: `google_oauth_${Date.now()}`
    });

    setLoading(false);

    if (res.success && res.token) {
      saveStoredAuth(res);
      onAuthSuccess(res);
      onClose();
    } else {
      setErrorMsg(res.message || 'Google Sign-In failed.');
    }
  };

  // -------------------------------------------------------------
  // FORGOT & RESET PASSWORD HANDLERS
  // -------------------------------------------------------------
  const handleForgotPassword = async () => {
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    resetForm();

    const res = await forgotPasswordApi(email.trim());
    setLoading(false);

    setInfoMsg(res.message || 'If an account exists, a 6-digit code was sent.');
    setMode('reset');
  };

  const handleResetPassword = async () => {
    if (otpCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit reset code.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    resetForm();

    const res = await resetPasswordApi(email.trim(), otpCode.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setInfoMsg('Password reset successful! Please log in with your new password.');
      setPassword('');
      setMode('login');
    } else {
      setErrorMsg(res.message || 'Failed to reset password.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Logo & Header */}
            <View style={styles.brandHeader}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoIcon}>🥗</Text>
              </View>
              <Text style={styles.brandTitle}>NutriPulse</Text>
              <Text style={styles.brandSubtitle}>
                {mode === 'login' && 'Sign in to sync your nutrition goals'}
                {mode === 'register' && 'Create your account to start tracking'}
                {mode === 'verify' && 'Email Verification'}
                {mode === 'forgot' && 'Reset your password'}
                {mode === 'reset' && 'Enter your reset code'}
              </Text>
            </View>

            {/* Notifications */}
            {!!errorMsg && (
              <View style={styles.errorAlert}>
                <Text style={styles.alertText}>⚠️ {errorMsg}</Text>
              </View>
            )}
            {!!infoMsg && (
              <View style={styles.infoAlert}>
                <Text style={styles.alertText}>✓ {infoMsg}</Text>
              </View>
            )}

            {/* TAB SWITCHER (Login / Sign Up) */}
            {(mode === 'login' || mode === 'register') && (
              <View style={styles.tabBar}>
                <TouchableOpacity
                  style={[styles.tabItem, mode === 'login' && styles.tabItemActive]}
                  onPress={() => handleSwitchMode('login')}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabItem, mode === 'register' && styles.tabItemActive]}
                  onPress={() => handleSwitchMode('register')}
                >
                  <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* GOOGLE AUTH BUTTON */}
            {(mode === 'login' || mode === 'register') && (
              <View style={styles.oauthContainer}>
                <TouchableOpacity
                  style={styles.googleBtn}
                  onPress={handleGoogleAuth}
                  disabled={loading}
                >
                  <View style={styles.googleIconBg}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with email</Text>
                  <View style={styles.dividerLine} />
                </View>
              </View>
            )}

            {/* ---------------- FORM: LOGIN ---------------- */}
            {mode === 'login' && (
              <View style={styles.formSection}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  <TouchableOpacity onPress={() => handleSwitchMode('forgot')}>
                    <Text style={styles.forgotLink}>Forgot?</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Sign In</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- FORM: SIGN UP ---------------- */}
            {mode === 'register' && (
              <View style={styles.formSection}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Alex Morgan"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="alex@nutripulse.io"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <Text style={styles.label}>Password (min 6 characters)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Create Account & Verify</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- FORM: VERIFY EMAIL (6-DIGIT OTP) ---------------- */}
            {mode === 'verify' && (
              <View style={styles.formSection}>
                <View style={styles.verifyInfoBox}>
                  <Text style={styles.verifyIcon}>✉️</Text>
                  <Text style={styles.verifyInstructions}>
                    Enter the 6-digit confirmation code sent to:
                  </Text>
                  <Text style={styles.verifyTargetEmail}>{email}</Text>
                </View>

                <Text style={styles.label}>6-Digit Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleVerifyEmail}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Confirm Email</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.resendRow}>
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={resendCooldown > 0 || loading}
                  >
                    <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendDisabled]}>
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend 6-Digit Code'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleSwitchMode('login')}>
                    <Text style={styles.secondaryLink}>Back to Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ---------------- FORM: FORGOT PASSWORD ---------------- */}
            {mode === 'forgot' && (
              <View style={styles.formSection}>
                <Text style={styles.verifyInstructions}>
                  Enter your email address and we'll send you a 6-digit code to reset your password.
                </Text>

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => handleSwitchMode('login')}>
                  <Text style={styles.secondaryLink}>← Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ---------------- FORM: RESET PASSWORD ---------------- */}
            {mode === 'reset' && (
              <View style={styles.formSection}>
                <Text style={styles.label}>6-Digit Reset Code</Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="123456"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />

                <Text style={styles.label}>New Password (min 6 chars)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />

                <TouchableOpacity
                  style={[styles.primaryBtn, loading && styles.btnDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.backBtn} onPress={() => handleSwitchMode('login')}>
                  <Text style={styles.secondaryLink}>← Back to Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: 'bold'
  },
  scrollContent: {
    paddingBottom: 16
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 10
  },
  logoIcon: {
    fontSize: 28
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8
  },
  tabItemActive: {
    backgroundColor: COLORS.cardBg,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  oauthContainer: {
    marginBottom: 16
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  googleIconBg: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  googleG: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14
  },
  googleBtnText: {
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '600'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder
  },
  dividerText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginHorizontal: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  formSection: {
    marginTop: 4
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6
  },
  forgotLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#0B0F19',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.primary
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  btnDisabled: {
    opacity: 0.6
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  errorAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  infoAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  alertText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500'
  },
  verifyInfoBox: {
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  verifyIcon: {
    fontSize: 32,
    marginBottom: 8
  },
  verifyInstructions: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18
  },
  verifyTargetEmail: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 4
  },
  resendRow: {
    marginTop: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  resendLink: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600'
  },
  resendDisabled: {
    color: COLORS.textMuted
  },
  secondaryLink: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500'
  },
  backBtn: {
    marginTop: 16,
    alignItems: 'center'
  }
});
