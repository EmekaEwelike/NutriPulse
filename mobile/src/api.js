import {
  INITIAL_PROFILE,
  INITIAL_LOGGED_FOODS,
  INITIAL_WATER_INTAKE_ML,
  INITIAL_WEIGHT_HISTORY
} from './storage';
import { PRESET_FOODS } from './foodDatabase';

// Set API URL (Configured for C# ASP.NET Core API)
const API_BASE_URL = 'http://localhost:5128/api';

// Helper for fetch with timeout & fallback
async function fetchWithFallback(url, options = {}, fallbackValue) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);

    if (!response.ok) {
      console.warn(`[API] HTTP error ${response.status} from ${url}, using fallback.`);
      return fallbackValue;
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.log(`[API] Server offline/unreachable at ${url}, using local state fallback.`);
    return fallbackValue;
  }
}

// -------------------------------------------------------------
// USER PROFILE API
// -------------------------------------------------------------
export async function getProfileApi() {
  return await fetchWithFallback(`${API_BASE_URL}/UserProfile`, {}, INITIAL_PROFILE);
}

export async function updateProfileApi(profileData) {
  return await fetchWithFallback(
    `${API_BASE_URL}/UserProfile`,
    {
      method: 'PUT',
      body: JSON.stringify(profileData)
    },
    profileData
  );
}

// -------------------------------------------------------------
// FOODS CATALOG API
// -------------------------------------------------------------
export async function getFoodsApi() {
  return await fetchWithFallback(`${API_BASE_URL}/Foods`, {}, PRESET_FOODS);
}

export async function addCustomFoodApi(foodItem) {
  return await fetchWithFallback(
    `${API_BASE_URL}/Foods`,
    {
      method: 'POST',
      body: JSON.stringify(foodItem)
    },
    foodItem
  );
}

// -------------------------------------------------------------
// LOGGED FOODS API
// -------------------------------------------------------------
export async function getLoggedFoodsApi() {
  return await fetchWithFallback(`${API_BASE_URL}/FoodLogs`, {}, INITIAL_LOGGED_FOODS);
}

export async function logFoodApi(foodItem) {
  return await fetchWithFallback(
    `${API_BASE_URL}/FoodLogs`,
    {
      method: 'POST',
      body: JSON.stringify(foodItem)
    },
    foodItem
  );
}

export async function deleteLoggedFoodApi(logId) {
  return await fetchWithFallback(
    `${API_BASE_URL}/FoodLogs/${logId}`,
    {
      method: 'DELETE'
    },
    true
  );
}

// -------------------------------------------------------------
// WATER LOGS API
// -------------------------------------------------------------
export async function getWaterApi() {
  const result = await fetchWithFallback(
    `${API_BASE_URL}/WaterLogs`,
    {},
    { amountMl: INITIAL_WATER_INTAKE_ML }
  );
  return result?.amountMl ?? INITIAL_WATER_INTAKE_ML;
}

export async function logWaterApi(amountMl) {
  const result = await fetchWithFallback(
    `${API_BASE_URL}/WaterLogs`,
    {
      method: 'POST',
      body: JSON.stringify({ amountMl })
    },
    { amountMl }
  );
  return result?.amountMl ?? amountMl;
}

// -------------------------------------------------------------
// WEIGHT LOGS API
// -------------------------------------------------------------
export async function getWeightHistoryApi() {
  return await fetchWithFallback(`${API_BASE_URL}/WeightLogs`, {}, INITIAL_WEIGHT_HISTORY);
}

export async function logWeightApi(weightVal) {
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const newEntry = { date: todayLabel, weight: weightVal };
  return await fetchWithFallback(
    `${API_BASE_URL}/WeightLogs`,
    {
      method: 'POST',
      body: JSON.stringify(newEntry)
    },
    newEntry
  );
}

// -------------------------------------------------------------
// AUTHENTICATION API
// -------------------------------------------------------------
let cachedAuth = null;

export function getStoredAuth() {
  if (cachedAuth) return cachedAuth;
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('nutripulse_auth');
      if (saved) {
        cachedAuth = JSON.parse(saved);
        return cachedAuth;
      }
    }
  } catch (e) {}
  return null;
}

export function saveStoredAuth(authData) {
  cachedAuth = authData;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('nutripulse_auth', JSON.stringify(authData));
    }
  } catch (e) {}
}

export function clearStoredAuth() {
  cachedAuth = null;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('nutripulse_auth');
    }
  } catch (e) {}
}

export async function loginApi(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable. Please ensure the backend is running.' };
  }
}

export async function registerApi(email, password, name) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable. Please ensure the backend is running.' };
  }
}

export async function verifyEmailApi(email, code) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable.' };
  }
}

export async function resendCodeApi(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/resend-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return { ok: response.ok, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable.' };
  }
}

export async function googleAuthApi(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Google Sign-In failed to connect to backend.' };
  }
}

export async function changePasswordApi(currentPassword, newPassword, token) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server connection failed.' };
  }
}

export async function forgotPasswordApi(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json();
    return { ok: response.ok, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable.' };
  }
}

export async function resetPasswordApi(email, code, newPassword) {
  try {
    const response = await fetch(`${API_BASE_URL}/Auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await response.json();
    return { ok: response.ok, status: response.status, ...data };
  } catch (err) {
    return { ok: false, success: false, message: 'Server unreachable.' };
  }
}
