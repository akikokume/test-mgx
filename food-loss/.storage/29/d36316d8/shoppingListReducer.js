// src/store/reducers/shoppingListReducer.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  currentList: null,
  items: [],
  history: [], // Previous shopping lists
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null
};

// Helper function to categorize shopping items
const categorizeItems = (items) => {
  const categories = {
    vegetables: ['にんじん', '玉ねぎ', 'トマト', '大根', 'キャベツ', '白菜', 'レタス', 'きゅうり'],
    fruits: ['りんご', 'バナナ', 'オレンジ', 'いちご', 'ぶどう', 'レモン'],
    meat: ['鶏肉', '豚肉', '牛肉', 'ひき肉', '鶏むね肉', '鶏もも肉', 'ベーコン', 'ハム', 'ソーセージ'],
    seafood: ['魚', 'サーモン', 'マグロ', 'エビ', 'カニ', 'イカ', 'タコ'],
    dairy: ['牛乳', 'チーズ', 'ヨーグルト', 'バター', '卵', '生クリーム'],
    grains: ['米', 'パスタ', 'パン', '麺', '小麦粉', '片栗粉', 'パン粉'],
    seasonings: ['塩', '砂糖', '醤油', 'みりん', '酢', '味噌', 'ケチャップ', 'マヨネーズ', 'オリーブオイル'],
    other: []
  };
  
  return items.map(item => {
    // Find matching category
    const category = Object.keys(categories).find(cat => 
      categories[cat].some(keyword => item.name.includes(keyword))
    ) || 'other';
    
    return {
      ...item,
      category
    };
  });
};

// Generate a shopping list based on a meal plan
export const generateShoppingList = createAsyncThunk(
  'shoppingList/generate',
  async ({ mealPlanId, userId }, { getState }) => {
    const { mealPlan, ingredients, recipes } = getState();
    
    if (!mealPlan.currentPlan) {
      throw new Error('No active meal plan');
    }
    
    // Get all planned meals
    const plannedMeals = mealPlan.plannedMeals;
    
    // Get available ingredients
    const availableIngredients = ingredients.availableIngredients;
    
    // Collect all required ingredients from recipes
    let requiredIngredients = [];
    plannedMeals.forEach(meal => {
      if (meal.recipeId) {
        // Find recipe
        const recipe = recipes.recipes.find(r => r.id === meal.recipeId) || 
                      recipes.popularRecipes.find(r => r.id === meal.recipeId);
        
        if (recipe && recipe.ingredients) {
          // Add ingredients with quantity adjusted for servings
          recipe.ingredients.forEach(ing => {
            // Check if we already have this ingredient in our list
            const existingIndex = requiredIngredients.findIndex(
              ri => ri.name.toLowerCase() === ing.name.toLowerCase()
            );
            
            if (existingIndex >= 0) {
              // Update quantity if the ingredient already exists
              requiredIngredients[existingIndex].quantity += ing.quantity * (meal.servings || 1);
            } else {
              // Add new ingredient
              requiredIngredients.push({
                ...ing,
                quantity: ing.quantity * (meal.servings || 1),
                recipeId: recipe.id
              });
            }
          });
        }
      }
    });
    
    // Subtract available ingredients
    const shoppingItems = requiredIngredients.map(required => {
      // Find matching available ingredient
      const available = availableIngredients.find(
        avail => avail.name.toLowerCase().includes(required.name.toLowerCase()) ||
                required.name.toLowerCase().includes(avail.name.toLowerCase())
      );
      
      let neededQuantity = required.quantity;
      
      // If we have this ingredient, subtract available quantity
      if (available) {
        neededQuantity = Math.max(0, required.quantity - available.quantity);
      }
      
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: required.name,
        quantity: neededQuantity,
        unit: required.unit,
        estimatedPrice: 0, // Would be calculated in a real app
        purchased: false
      };
    }).filter(item => item.quantity > 0); // Only include items we actually need
    
    // Categorize items
    const categorizedItems = categorizeItems(shoppingItems);
    
    // Create shopping list
    return {
      id: `sl-${Date.now()}`,
      userId,
      mealPlanId,
      createdDate: new Date().toISOString(),
      items: categorizedItems,
      budgetLimit: 0,
      notes: ''
    };
  }
);

// Mark items as purchased
export const markItemsPurchased = createAsyncThunk(
  'shoppingList/markPurchased',
  async (itemIds, { getState }) => {
    // In a real app, we would call an API to update the items
    return itemIds;
  }
);

// Add items to shopping list
export const addShoppingItems = createAsyncThunk(
  'shoppingList/addItems',
  async (newItems, { getState }) => {
    // Process and categorize new items
    const items = newItems.map(item => ({
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || '個',
      estimatedPrice: item.estimatedPrice || 0,
      purchased: false
    }));
    
    return categorizeItems(items);
  }
);

// Shopping list slice
const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    // Clear current shopping list
    clearCurrentList(state) {
      state.currentList = null;
      state.items = [];
    },
    
    // Toggle item purchased status
    toggleItemPurchased(state, action) {
      const itemIndex = state.items.findIndex(item => item.id === action.payload);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].purchased = !state.items[itemIndex].purchased;
      }
    },
    
    // Update item quantity
    updateItemQuantity(state, action) {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === itemId);
      
      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
      }
    },
    
    // Remove item from list
    removeItem(state, action) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    // Update list notes
    updateListNotes(state, action) {
      if (state.currentList) {
        state.currentList.notes = action.payload;
      }
    },
    
    // Update budget limit
    updateBudgetLimit(state, action) {
      if (state.currentList) {
        state.currentList.budgetLimit = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate shopping list cases
      .addCase(generateShoppingList.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(generateShoppingList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentList = action.payload;
        state.items = action.payload.items;
        
        // Add to history if we already had a list
        if (state.currentList && state.currentList.id !== action.payload.id) {
          state.history.push(state.currentList);
        }
      })
      .addCase(generateShoppingList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      
      // Mark items purchased cases
      .addCase(markItemsPurchased.fulfilled, (state, action) => {
        const itemIds = action.payload;
        
        state.items = state.items.map(item => {
          if (itemIds.includes(item.id)) {
            return { ...item, purchased: true };
          }
          return item;
        });
      })
      
      // Add shopping items cases
      .addCase(addShoppingItems.fulfilled, (state, action) => {
        state.items = [...state.items, ...action.payload];
        
        if (state.currentList) {
          state.currentList.items = state.items;
        }
      });
  }
});

export const { 
  clearCurrentList,
  toggleItemPurchased,
  updateItemQuantity,
  removeItem,
  updateListNotes,
  updateBudgetLimit
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;
