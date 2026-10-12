import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, ActivityIndicator, Text } from 'react-native';
import Header from './src/components/Header';
import Dashboard from './src/components/Dashboard';
import FoodLogger from './src/components/FoodLogger';
import Analytics from './src/components/Analytics';
import Profile from './src/components/Profile';
import Navigation from './src/components/Navigation';
import AuthModal from './src/components/AuthModal';

import { COLORS } from './src/theme';
import {
  INITIAL_PROFILE,
  INITIAL_LOGGED_FOODS,
  INITIAL_WATER_INTAKE_ML,
  INITIAL_WEIGHT_HISTORY
} from './src/storage';
import {
  getProfileApi,
  updateProfileApi,
  getLoggedFoodsApi,
  logFoodApi,
  getWaterApi,
  logWaterApi,
  getWeightHistoryApi,
  logWeightApi,
  getStoredAuth,
  clearStoredAuth
} from './src/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [logCategoryTarget, setLogCategoryTarget] = useState('all');

  // Authentication State
  const [authState, setAuthState] = useState(getStoredAuth());
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // App State
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [loggedFoods, setLoggedFoods] = useState(INITIAL_LOGGED_FOODS);
  const [waterMl, setWaterMl] = useState(INITIAL_WATER_INTAKE_ML);
  const [weightHistory, setWeightHistory] = useState(INITIAL_WEIGHT_HISTORY);
  const [loading, setLoading] = useState(true);

  // Load Dynamic Data from C# Backend on Mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [profData, foodsData, waterData, weightData] = await Promise.all([
          getProfileApi(),
          getLoggedFoodsApi(),
          getWaterApi(),
          getWeightHistoryApi()
        ]);

        if (profData) setProfile(profData);
        if (foodsData) setLoggedFoods(foodsData);
        if (waterData !== undefined) setWaterMl(waterData);
        if (weightData) setWeightHistory(weightData);
      } catch (err) {
        console.log('[App] Loading default dynamic state fallback');
      } finally {
        setLoading(false);
      }
    }
    loadBackendData();
  }, []);

  // Auth Handlers
  const handleAuthSuccess = (newAuth) => {
    setAuthState(newAuth);
    if (newAuth?.user?.name) {
      setProfile(prev => ({ ...prev, name: newAuth.user.name }));
    }
  };

  const handleLogout = () => {
    clearStoredAuth();
    setAuthState(null);
  };

  // Handlers with API Sync
  const handleAddFood = async (foodItem) => {
    setLoggedFoods(prev => [foodItem, ...prev]);
    setActiveTab('dashboard');
    await logFoodApi(foodItem);
  };

  const handleAddWater = async (amountMl) => {
    const newTotal = waterMl + amountMl;
    setWaterMl(newTotal);
    await logWaterApi(newTotal);
  };

  const handleAddWeight = async (weightVal) => {
    const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const newHistory = [...weightHistory, { date: todayLabel, weight: weightVal }];
    setWeightHistory(newHistory);
    setProfile(prev => ({ ...prev, weightKg: weightVal }));

    await logWeightApi(weightVal);
    await updateProfileApi({ ...profile, weightKg: weightVal });
  };

  const handleUpdateProfile = async (updatedProfile) => {
    setProfile(updatedProfile);
    await updateProfileApi(updatedProfile);
  };

  const handleOpenLogForCategory = (category) => {
    setLogCategoryTarget(category);
    setActiveTab('log');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <Header
        profile={profile}
        authState={authState}
        onOpenProfile={() => setActiveTab('profile')}
        onOpenAuth={() => setIsAuthModalVisible(true)}
      />

      <View style={styles.mainContent}>
        {activeTab === 'dashboard' && (
          <Dashboard
            loggedFoods={loggedFoods}
            profile={profile}
            waterMl={waterMl}
            onAddWater={handleAddWater}
            onAddFoodClick={handleOpenLogForCategory}
          />
        )}

        {activeTab === 'log' && (
          <FoodLogger
            initialCategory={logCategoryTarget}
            onLogFood={handleAddFood}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics
            weightHistory={weightHistory}
            onAddWeight={handleAddWeight}
            profile={profile}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            profile={profile}
            authState={authState}
            onUpdateProfile={handleUpdateProfile}
            onOpenAuth={() => setIsAuthModalVisible(true)}
            onLogout={handleLogout}
          />
        )}
      </View>

      <Navigation
        activeTab={activeTab}
        onTabChange={tab => {
          if (tab === 'log') setLogCategoryTarget('all');
          setActiveTab(tab);
        }}
      />

      <AuthModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  mainContent: {
    flex: 1
  }
});
