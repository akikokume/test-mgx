// src/store/reducers/ingredientReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  availableIngredients: [],
  categories: [
    { id: 'vegetables', name: '野菜' },
    { id: 'meat', name: '肉類' },
    { id: 'seafood', name: '魚介類' },
    { id: 'dairy', name: '乳製品' },
    { id: 'grains', name: '穀物' },
    { id: 'seasonings', name: '調味料' },
    { id: 'other', name: 'その他' }
  ],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Helper function to calculate expiry date based on shelf life
const calculateExpiryDate = (shelfLife) => {
  const date = new Date();
  date.setDate(date.getDate() + shelfLife);
  return date.toISOString().split('T')[0];
};

// Sample ingredients for development
const sampleIngredients = [
  {
    id: 'ing1',
    name: '玉ねぎ',
    category: 'vegetables',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: calculateExpiryDate(14),
    quantity: 3,
    unit: '個',
    storageLocation: 'fridge'
  },
  {
    id: 'ing2',
    name: '豚肉',
    category: 'meat',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: calculateExpiryDate(3),
    quantity: 300,
    unit: 'g',
    storageLocation: 'fridge'
  },
  {
    id: 'ing3',
    name: 'にんじん',
    category: 'vegetables',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: calculateExpiryDate(10),
    quantity: 2,
    unit: '本',
    storageLocation: 'fridge'
  },
  {
    id: 'ing4',
    name: 'じゃがいも',
    category: 'vegetables',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: calculateExpiryDate(30),
    quantity: 4,
    unit: '個',
    storageLocation: 'pantry'
  },
  {
    id: 'ing5',
    name: '牛乳',
    category: 'dairy',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: calculateExpiryDate(7),
    quantity: 1,
    unit: 'L',
    storageLocation: 'fridge'
  }
];

// Async thunks for ingredient management
export const fetchIngredients = createAsyncThunk(
  'ingredients/fetchIngredients',
  async (userId) => {
    // In a real app, we would fetch from an API
    // For now, return sample data
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(sampleIngredients);
      }, 500);
    });
  }
);

export const addIngredient = createAsyncThunk(
  'ingredients/addIngredient',
  async (ingredientData) => {
    // In a real app, we would post to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ...ingredientData,
          id: `ing${Date.now()}`,
          purchaseDate: ingredientData.purchaseDate || new Date().toISOString().split('T')[0]
        });
      }, 300);
    });
  }
);

export const updateIngredient = createAsyncThunk(
  'ingredients/updateIngredient',
  async (ingredientData) => {
    // In a real app, we would put to an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ingredientData);
      }, 300);
    });
  }
);

export const deleteIngredient = createAsyncThunk(
  'ingredients/deleteIngredient',
  async (ingredientId) => {
    // In a real app, we would delete from an API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(ingredientId);
      }, 300);
    });
  }
);

// Ingredient slice
const ingredientSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    // Update ingredient quantity
    updateIngredientQuantity(state, action) {
      const { id, quantity } = action.payload;
      const index = state.availableIngredients.findIndex(ing => ing.id === id);
      
      if (index >= 0) {
        state.availableIngredients[index].quantity = quantity;
        
        // If quantity is 0, remove the ingredient
        if (quantity <= 0) {
          state.availableIngredients.splice(index, 1);
        }
      }
    },
    
    // Update ingredient expiry date
    updateIngredientExpiry(state, action) {
      const { id, expiryDate } = action.payload;
      const index = state.availableIngredients.findIndex(ing => ing.id === id);
      
      if (index >= 0) {
        state.availableIngredients[index].expiryDate = expiryDate;
      }
    },

    // Clear all ingredients
    clearIngredients(state) {
      state.availableIngredients = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch ingredients cases
      .addCase(fetchIngredients.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.availableIngredients = action.payload;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Add ingredient cases
      .addCase(addIngredient.fulfilled, (state, action) => {
        state.availableIngredients.push(action.payload);
      })
      
      // Update ingredient cases
      .addCase(updateIngredient.fulfilled, (state, action) => {
        const index = state.availableIngredients.findIndex(
          ing => ing.id === action.payload.id
        );
        
        if (index >= 0) {
          state.availableIngredients[index] = action.payload;
        }
      })
      
      // Delete ingredient cases
      .addCase(deleteIngredient.fulfilled, (state, action) => {
        state.availableIngredients = state.availableIngredients.filter(
          ing => ing.id !== action.payload
        );
      });
  }
});

export const { 
  updateIngredientQuantity, 
  updateIngredientExpiry,
  clearIngredients 
} = ingredientSlice.actions;

export default ingredientSlice.reducer;
