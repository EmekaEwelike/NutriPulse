import { PRESET_FOODS } from './foodDatabase';

export const INITIAL_PROFILE = {
  name: 'Alex Morgan',
  age: 28,
  gender: 'male',
  heightCm: 178,
  weightKg: 75.5,
  targetWeightKg: 72.0,
  activityLevel: 1.55, // Moderate active
  goalType: 'lose', // 'lose', 'maintain', 'gain'
  customCalorieGoal: 2200,
  proteinGoalG: 150,
  carbsGoalG: 220,
  fatGoalG: 65,
  waterGoalMl: 2500,
  streakDays: 14
};

export const INITIAL_LOGGED_FOODS = [
  { ...PRESET_FOODS[0], id: 'log-1', quantity: 1, category: 'breakfast', loggedAt: '08:30 AM' },
  { ...PRESET_FOODS[1], id: 'log-2', quantity: 1, category: 'breakfast', loggedAt: '08:35 AM' },
  { ...PRESET_FOODS[5], id: 'log-3', quantity: 1, category: 'lunch', loggedAt: '01:15 PM' },
  { ...PRESET_FOODS[15], id: 'log-4', quantity: 1, category: 'snack', loggedAt: '04:45 PM' }
];

export const INITIAL_WATER_INTAKE_ML = 1750;

export const INITIAL_WEIGHT_HISTORY = [
  { date: 'Mon', weight: 76.5 },
  { date: 'Tue', weight: 76.2 },
  { date: 'Wed', weight: 76.0 },
  { date: 'Thu', weight: 75.8 },
  { date: 'Fri', weight: 75.7 },
  { date: 'Sat', weight: 75.6 },
  { date: 'Sun', weight: 75.5 }
];

export const calculateTDEE = (profile) => {
  const { gender, weightKg, heightCm, age, activityLevel, goalType } = profile;
  
  // Mifflin-St Jeor Equation
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  bmr = gender === 'female' ? bmr - 161 : bmr + 5;
  
  const tdee = Math.round(bmr * activityLevel);

  let targetCalories = tdee;
  if (goalType === 'lose') targetCalories -= 500;
  if (goalType === 'gain') targetCalories += 400;

  // Calculate default macros
  const proteinG = Math.round((targetCalories * 0.30) / 4);
  const carbsG = Math.round((targetCalories * 0.45) / 4);
  const fatG = Math.round((targetCalories * 0.25) / 9);

  return {
    bmr: Math.round(bmr),
    tdee,
    targetCalories,
    proteinG,
    carbsG,
    fatG
  };
};
