// src/api/recipeService.js
import axios from 'axios';

// Constants
const RAKUTEN_API_BASE_URL = 'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426';
const RAKUTEN_API_KEY = 'YOUR_RAKUTEN_API_KEY'; // In a real app, this should be in .env
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

// In-memory cache
const cache = {
  recipes: {},
  categories: {},
  popular: { data: null, timestamp: 0 },
};

/**
 * Wrapper for API calls with caching
 */
const cachedApiCall = async (key, apiCall) => {
  const now = Date.now();
  
  // If cached and not expired, return cached data
  if (cache[key] && cache[key].timestamp && now - cache[key].timestamp < CACHE_EXPIRY) {
    return cache[key].data;
  }
  
  // Otherwise make the API call
  try {
    const data = await apiCall();
    // Update cache
    cache[key] = {
      data,
      timestamp: now
    };
    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (recipeId) => {
  const cacheKey = `recipe_${recipeId}`;
  
  return cachedApiCall(cacheKey, async () => {
    try {
      const response = await axios.get(RAKUTEN_API_BASE_URL, {
        params: {
          applicationId: RAKUTEN_API_KEY,
          categoryId: recipeId
        }
      });
      
      // Process the response to match our internal data model
      if (response.data.result && response.data.result.length > 0) {
        return transformRakutenRecipe(response.data.result[0]);
      }
      throw new Error('Recipe not found');
    } catch (error) {
      console.error(`Failed to fetch recipe ID ${recipeId}:`, error);
      throw error;
    }
  });
};

/**
 * Search recipes by ingredients
 */
export const getRecipesByIngredients = async (ingredients) => {
  // Generate a unique key based on sorted ingredients
  const sortedIngredients = [...ingredients].sort().join(',');
  const cacheKey = `ingredients_${sortedIngredients}`;
  
  return cachedApiCall(cacheKey, async () => {
    try {
      // Rakuten API doesn't directly support ingredient search
      // So we'll fetch by category and filter on client side
      const response = await axios.get(RAKUTEN_API_BASE_URL, {
        params: {
          applicationId: RAKUTEN_API_KEY,
          // We use a general category to get diverse recipes
          categoryId: '30' // General category for main dishes
        }
      });
      
      // Process the response to match our internal data model
      const recipes = response.data.result.map(transformRakutenRecipe);
      
      // Filter recipes that include at least some of our ingredients
      // In a real app, this would be more sophisticated
      return recipes.filter(recipe => 
        recipe.ingredients.some(ri => 
          ingredients.some(i => ri.name.includes(i))
        )
      );
    } catch (error) {
      console.error('Failed to fetch recipes by ingredients:', error);
      throw error;
    }
  });
};

/**
 * Get popular recipes
 */
export const getPopularRecipes = async () => {
  return cachedApiCall('popular', async () => {
    try {
      const response = await axios.get(RAKUTEN_API_BASE_URL, {
        params: {
          applicationId: RAKUTEN_API_KEY,
          // Default parameters will return popular recipes
        }
      });
      
      // Process the response to match our internal data model
      return response.data.result.map(transformRakutenRecipe);
    } catch (error) {
      console.error('Failed to fetch popular recipes:', error);
      throw error;
    }
  });
};

/**
 * Get recipes by category
 */
export const getRecipesByCategory = async (categoryId) => {
  const cacheKey = `category_${categoryId}`;
  
  return cachedApiCall(cacheKey, async () => {
    try {
      const response = await axios.get(RAKUTEN_API_BASE_URL, {
        params: {
          applicationId: RAKUTEN_API_KEY,
          categoryId: categoryId
        }
      });
      
      // Process the response to match our internal data model
      return response.data.result.map(transformRakutenRecipe);
    } catch (error) {
      console.error(`Failed to fetch recipes for category ${categoryId}:`, error);
      throw error;
    }
  });
};

/**
 * Search recipes by query
 */
export const searchRecipes = async (query) => {
  const cacheKey = `search_${query}`;
  
  return cachedApiCall(cacheKey, async () => {
    try {
      const response = await axios.get(RAKUTEN_API_BASE_URL, {
        params: {
          applicationId: RAKUTEN_API_KEY,
          // Rakuten doesn't have direct text search
          // Using category search as an alternative
          categoryId: '30', // General category
        }
      });
      
      // Process and filter the response based on the query
      const recipes = response.data.result.map(transformRakutenRecipe);
      
      // Simple filter by recipe name or ingredients
      return recipes.filter(recipe => 
        recipe.name.includes(query) || 
        recipe.ingredients.some(ing => ing.name.includes(query))
      );
    } catch (error) {
      console.error(`Failed to search recipes with query "${query}":`, error);
      throw error;
    }
  });
};

/**
 * Transform Rakuten Recipe API data to our internal model
 */
const transformRakutenRecipe = (rakutenRecipe) => {
  // Extract ingredients from the foodImageUrl
  // This is a simplified approach. In a real app, we'd need to parse the actual ingredient data
  const fakeIngredients = [
    { name: '玉ねぎ', quantity: 1, unit: '個' },
    { name: 'にんじん', quantity: 1, unit: '本' },
    { name: 'じゃがいも', quantity: 2, unit: '個' },
    { name: '豚肉', quantity: 200, unit: 'g' },
    { name: 'カレールー', quantity: 1, unit: '箱' }
  ];
  
  return {
    id: rakutenRecipe.recipeId || `recipe-${Math.random().toString(36).substring(2, 9)}`,
    name: rakutenRecipe.recipeTitle || 'Unknown Recipe',
    category: rakutenRecipe.recipeCategory || 'General',
    cookingTime: 30, // Default as Rakuten doesn't provide this
    difficulty: 'medium', // Default as Rakuten doesn't provide this
    imageUrl: rakutenRecipe.foodImageUrl || '',
    source: 'Rakuten Recipe',
    ingredients: fakeIngredients,
    instructions: ['詳細はレシピリンクを確認してください。'],
    nutritionInfo: {
      calories: 0, // Not provided by Rakuten API
      protein: 0,
      carbs: 0,
      fat: 0
    },
    url: rakutenRecipe.recipeUrl || ''
  };
};

export default {
  getRecipeById,
  getRecipesByIngredients,
  getPopularRecipes, 
  getRecipesByCategory,
  searchRecipes
};
