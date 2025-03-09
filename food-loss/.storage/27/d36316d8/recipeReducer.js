// src/store/reducers/recipeReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import recipeService from '../../api/recipeService';

// Initial state
const initialState = {
  recipes: [],
  popularRecipes: [],
  currentRecipe: null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Async thunks for recipe management
export const fetchRecipeById = createAsyncThunk(
  'recipes/fetchById',
  async (recipeId) => {
    return await recipeService.getRecipeById(recipeId);
  }
);

export const fetchRecipesByIngredients = createAsyncThunk(
  'recipes/fetchByIngredients',
  async (ingredients) => {
    return await recipeService.getRecipesByIngredients(ingredients);
  }
);

export const fetchPopularRecipes = createAsyncThunk(
  'recipes/fetchPopular',
  async () => {
    return await recipeService.getPopularRecipes();
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async (query) => {
    return await recipeService.searchRecipes(query);
  }
);

// Recipe slice
const recipeSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    // Clear current recipe
    clearCurrentRecipe(state) {
      state.currentRecipe = null;
    },
    
    // Clear all recipes
    clearRecipes(state) {
      state.recipes = [];
      state.status = 'idle';
    },
    
    // Add a recipe to favorites (would be user-specific in a real app)
    addToFavorites(state, action) {
      const recipe = state.recipes.find(r => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = true;
      }
    },
    
    // Remove a recipe from favorites
    removeFromFavorites(state, action) {
      const recipe = state.recipes.find(r => r.id === action.payload);
      if (recipe) {
        recipe.isFavorite = false;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch recipe by ID cases
      .addCase(fetchRecipeById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentRecipe = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Fetch recipes by ingredients cases
      .addCase(fetchRecipesByIngredients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecipesByIngredients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes = action.payload;
      })
      .addCase(fetchRecipesByIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Fetch popular recipes cases
      .addCase(fetchPopularRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPopularRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.popularRecipes = action.payload;
        
        // If we don't have any recipes yet, populate the recipes array too
        if (state.recipes.length === 0) {
          state.recipes = action.payload;
        }
      })
      .addCase(fetchPopularRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Search recipes cases
      .addCase(searchRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes = action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { 
  clearCurrentRecipe,
  clearRecipes,
  addToFavorites,
  removeFromFavorites
} = recipeSlice.actions;

export default recipeSlice.reducer;
