// src/store/reducers/userReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  current: null,
  preferences: {
    familyMembers: [],
    dislikedIngredients: [],
    dietaryRestrictions: [],
    mealPreferences: {
      breakfast: true,
      lunch: true,
      dinner: true
    }
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Mock API calls (would be replaced with real API in production)
const mockLoginAPI = async (credentials) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'user123',
        name: credentials.name || '匿名ユーザー',
        email: credentials.email,
        token: 'fake-jwt-token'
      });
    }, 500);
  });
};

const mockRegisterAPI = async (userData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `user${Math.floor(Math.random() * 1000)}`,
        name: userData.name,
        email: userData.email,
        token: 'fake-jwt-token'
      });
    }, 500);
  });
};

// Async thunks for user authentication
export const login = createAsyncThunk('user/login', async (credentials) => {
  const response = await mockLoginAPI(credentials);
  // Store token in local storage for persistence
  localStorage.setItem('userToken', response.token);
  return response;
});

export const register = createAsyncThunk('user/register', async (userData) => {
  const response = await mockRegisterAPI(userData);
  // Store token in local storage for persistence
  localStorage.setItem('userToken', response.token);
  return response;
});

export const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('userToken');
  return null;
});

// Check if user is already logged in from token
export const checkAuthState = createAsyncThunk('user/checkAuth', async () => {
  const token = localStorage.getItem('userToken');
  if (!token) {
    throw new Error('No token found');
  }
  
  // In a real app, we would validate the token with the server
  // For now, we'll just return a mock user
  return {
    id: 'user123',
    name: 'ログイン済みユーザー',
    email: 'user@example.com',
    token
  };
});

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Update preferences
    updatePreferences(state, action) {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },
    
    // Add or update a family member
    updateFamilyMember(state, action) {
      const index = state.preferences.familyMembers.findIndex(
        member => member.id === action.payload.id
      );
      
      if (index >= 0) {
        state.preferences.familyMembers[index] = action.payload;
      } else {
        state.preferences.familyMembers.push({
          ...action.payload,
          id: action.payload.id || `member-${Date.now()}`
        });
      }
    },
    
    // Remove a family member
    removeFamilyMember(state, action) {
      state.preferences.familyMembers = state.preferences.familyMembers.filter(
        member => member.id !== action.payload
      );
    },
    
    // Add a disliked ingredient
    addDislikedIngredient(state, action) {
      if (!state.preferences.dislikedIngredients.includes(action.payload)) {
        state.preferences.dislikedIngredients.push(action.payload);
      }
    },
    
    // Remove a disliked ingredient
    removeDislikedIngredient(state, action) {
      state.preferences.dislikedIngredients = state.preferences.dislikedIngredients.filter(
        ingredient => ingredient !== action.payload
      );
    },
    
    // Update meal preferences
    updateMealPreferences(state, action) {
      state.preferences.mealPreferences = {
        ...state.preferences.mealPreferences,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
    
    // Register cases
      .addCase(register.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.current = action.payload;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
    
    // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.current = null;
        state.status = 'idle';
        state.error = null;
      })
    
    // Check auth state cases
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.current = action.payload;
        state.status = 'succeeded';
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.current = null;
        // We don't set error here since this could happen normally if user is not logged in
      });
  }
});

export const { 
  updatePreferences, 
  updateFamilyMember, 
  removeFamilyMember,
  addDislikedIngredient,
  removeDislikedIngredient,
  updateMealPreferences
} = userSlice.actions;

export default userSlice.reducer;
