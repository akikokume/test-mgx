// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';
import ingredientReducer from './reducers/ingredientReducer';
import recipeReducer from './reducers/recipeReducer';
import mealPlanReducer from './reducers/mealPlanReducer';
import shoppingListReducer from './reducers/shoppingListReducer';

// Configure the Redux store
const store = configureStore({
  reducer: {
    user: userReducer,
    ingredients: ingredientReducer,
    recipes: recipeReducer,
    mealPlan: mealPlanReducer,
    shoppingList: shoppingListReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['user/login/fulfilled', 'user/register/fulfilled'],
        // Ignore these field paths in state for serializable check
        ignoredPaths: ['user.current.token'],
      },
    }),
});

export default store;
