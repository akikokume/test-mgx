// src/store/reducers/mealPlanReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { optimizeMealPlan } from '../../utils/wastageReductionAlgorithm';

// Initial state
const initialState = {
  currentPlan: null,
  plannedMeals: [], // Array of meal entries
  history: [], // Previous meal plans
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Mock meal plan generation API
const mockGenerateMealPlanAPI = async (options) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const startDate = options.startDate || new Date().toISOString().split('T')[0];
      const days = options.days || 7;
      const meals = [];
      
      const mealTypes = ['breakfast', 'lunch', 'dinner'];
      const includeBreakfast = options.includeBreakfast !== false;
      const includeLunch = options.includeLunch !== false;
      const includeDinner = options.includeDinner !== false;
      
      // Generate empty meal plan
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        
        if (includeBreakfast) {
          meals.push({
            id: `meal-${Date.now()}-b-${i}`,
            date: dateString,
            type: 'breakfast',
            recipeId: null,
            customIngredients: [],
            servings: 1
          });
        }
        
        if (includeLunch) {
          meals.push({
            id: `meal-${Date.now()}-l-${i}`,
            date: dateString,
            type: 'lunch',
            recipeId: null,
            customIngredients: [],
            servings: 1
          });
        }
        
        if (includeDinner) {
          meals.push({
            id: `meal-${Date.now()}-d-${i}`,
            date: dateString,
            type: 'dinner',
            recipeId: null,
            customIngredients: [],
            servings: 1
          });
        }
      }
      
      resolve({
        id: `plan-${Date.now()}`,
        userId: options.userId,
        startDate,
        endDate: (() => {
          const end = new Date(startDate);
          end.setDate(end.getDate() + days - 1);
          return end.toISOString().split('T')[0];
        })(),
        meals,
        createdAt: new Date().toISOString()
      });
    }, 500);
  });
};

// Async thunks for meal plan management
export const createMealPlan = createAsyncThunk(
  'mealPlan/create',
  async ({ userId, options, availableIngredients, recipes }) => {
    // First generate an empty meal plan
    const emptyPlan = await mockGenerateMealPlanAPI({
      userId,
      startDate: options.startDate,
      days: options.days || 7,
      includeBreakfast: options.includeBreakfast,
      includeLunch: options.includeLunch,
      includeDinner: options.includeDinner
    });
    
    // Then optimize it with our algorithm if recipes and ingredients are provided
    if (recipes && recipes.length > 0 && availableIngredients) {
      return optimizeMealPlan(emptyPlan, availableIngredients, recipes);
    }
    
    return emptyPlan;
  }
);

export const updateMealEntry = createAsyncThunk(
  'mealPlan/updateEntry',
  async ({ mealId, recipeId, servings, customIngredients }, { getState }) => {
    const { mealPlan } = getState();
    
    if (!mealPlan.currentPlan) {
      throw new Error('No active meal plan');
    }
    
    // In a real app, we would call an API to update the meal entry
    return {
      mealId,
      updates: {
        recipeId,
        servings: servings || 1,
        customIngredients: customIngredients || []
      }
    };
  }
);

export const optimizeCurrentPlan = createAsyncThunk(
  'mealPlan/optimize',
  async (_, { getState }) => {
    const { mealPlan, ingredients, recipes } = getState();
    
    if (!mealPlan.currentPlan) {
      throw new Error('No active meal plan');
    }
    
    // Use our algorithm to optimize the meal plan
    return optimizeMealPlan(
      mealPlan.currentPlan,
      ingredients.availableIngredients,
      recipes.recipes.length > 0 ? recipes.recipes : recipes.popularRecipes
    );
  }
);

// Meal plan slice
const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    // Clear current meal plan
    clearCurrentPlan(state) {
      state.currentPlan = null;
      state.plannedMeals = [];
    },
    
    // Add a recipe to a meal
    addRecipeToMeal(state, action) {
      const { mealId, recipeId, servings } = action.payload;
      const mealIndex = state.plannedMeals.findIndex(meal => meal.id === mealId);
      
      if (mealIndex >= 0) {
        state.plannedMeals[mealIndex] = {
          ...state.plannedMeals[mealIndex],
          recipeId,
          servings: servings || 1
        };
      }
    },
    
    // Remove a recipe from a meal
    removeRecipeFromMeal(state, action) {
      const mealIndex = state.plannedMeals.findIndex(meal => meal.id === action.payload);
      
      if (mealIndex >= 0) {
        state.plannedMeals[mealIndex] = {
          ...state.plannedMeals[mealIndex],
          recipeId: null,
          customIngredients: []
        };
      }
    },
    
    // Update meal servings
    updateMealServings(state, action) {
      const { mealId, servings } = action.payload;
      const mealIndex = state.plannedMeals.findIndex(meal => meal.id === mealId);
      
      if (mealIndex >= 0) {
        state.plannedMeals[mealIndex] = {
          ...state.plannedMeals[mealIndex],
          servings: servings
        };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Create meal plan cases
      .addCase(createMealPlan.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createMealPlan.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPlan = action.payload;
        state.plannedMeals = action.payload.meals;
        
        // Add to history if we already had a plan
        if (state.currentPlan && state.currentPlan.id !== action.payload.id) {
          state.history.push(state.currentPlan);
        }
      })
      .addCase(createMealPlan.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Update meal entry cases
      .addCase(updateMealEntry.fulfilled, (state, action) => {
        const { mealId, updates } = action.payload;
        const mealIndex = state.plannedMeals.findIndex(meal => meal.id === mealId);
        
        if (mealIndex >= 0) {
          state.plannedMeals[mealIndex] = {
            ...state.plannedMeals[mealIndex],
            ...updates
          };
        }
      })
      
      // Optimize current plan cases
      .addCase(optimizeCurrentPlan.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(optimizeCurrentPlan.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentPlan = action.payload;
        state.plannedMeals = action.payload.meals;
      })
      .addCase(optimizeCurrentPlan.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { 
  clearCurrentPlan,
  addRecipeToMeal,
  removeRecipeFromMeal,
  updateMealServings
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;
