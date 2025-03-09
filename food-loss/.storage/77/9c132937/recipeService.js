// src/api/recipeService.js
import axios from 'axios';

// Constants
const RAKUTEN_API_BASE_URL = 'https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426';
// Since we don't have actual API keys, we'll use mock data
const USE_MOCK_DATA = true;
const CACHE_EXPIRY = 1000 * 60 * 60 * 24; // 24 hours

// In-memory cache
const cache = {
  recipes: {},
  categories: {},
  popular: { data: null, timestamp: 0 },
};

// Mock recipe data to use instead of real API calls
const mockRecipes = [
  {
    id: 'recipe-001',
    name: 'カレーライス',
    category: '主菜',
    cookingTime: 40,
    difficulty: 'medium',
    imageUrl: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: '玉ねぎ', quantity: 2, unit: '個' },
      { name: 'にんじん', quantity: 1, unit: '本' },
      { name: 'じゃがいも', quantity: 3, unit: '個' },
      { name: '豚肉', quantity: 300, unit: 'g' },
      { name: 'カレールー', quantity: 1, unit: '箱' },
      { name: '米', quantity: 3, unit: '合' },
    ],
    instructions: ['玉ねぎを切る', 'にんじんを切る', 'じゃがいもを切る', '豚肉を炒める', '野菜を加えて炒める', '水を加えて煮込む', 'カレールーを入れて完成'],
    nutritionInfo: { calories: 650, protein: 20, carbs: 80, fat: 25 },
    url: 'https://example.com/curry'
  },
  {
    id: 'recipe-002',
    name: '肉じゃが',
    category: '副菜',
    cookingTime: 30,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: 'じゃがいも', quantity: 4, unit: '個' },
      { name: '玉ねぎ', quantity: 1, unit: '個' },
      { name: 'にんじん', quantity: 1, unit: '本' },
      { name: '牛肉', quantity: 200, unit: 'g' },
      { name: 'しらたき', quantity: 1, unit: '袋' },
      { name: '醤油', quantity: 3, unit: '大さじ' },
      { name: 'みりん', quantity: 2, unit: '大さじ' },
      { name: '砂糖', quantity: 1, unit: '大さじ' },
    ],
    instructions: ['野菜を切る', '牛肉を炒める', '野菜を加えて炒める', '調味料と水を加えて煮込む'],
    nutritionInfo: { calories: 350, protein: 15, carbs: 45, fat: 10 },
    url: 'https://example.com/nikujaga'
  },
  {
    id: 'recipe-003',
    name: '豚の生姜焼き',
    category: '主菜',
    cookingTime: 20,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1567038770912-5b24917348be?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: '豚ロース', quantity: 300, unit: 'g' },
      { name: '生姜', quantity: 1, unit: '片' },
      { name: '醤油', quantity: 2, unit: '大さじ' },
      { name: '酒', quantity: 1, unit: '大さじ' },
      { name: 'みりん', quantity: 1, unit: '大さじ' },
      { name: '玉ねぎ', quantity: 1, unit: '個' },
    ],
    instructions: ['豚肉に下味をつける', '玉ねぎをスライスする', '豚肉を焼く', '玉ねぎを加えて焼く', 'タレを加えて完成'],
    nutritionInfo: { calories: 450, protein: 30, carbs: 10, fat: 30 },
    url: 'https://example.com/shogayaki'
  },
  {
    id: 'recipe-004',
    name: '味噌汁',
    category: '汁物',
    cookingTime: 10,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1581184953963-d15972933db1?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: '豆腐', quantity: 1, unit: '丁' },
      { name: 'わかめ', quantity: 5, unit: 'g' },
      { name: '味噌', quantity: 3, unit: '大さじ' },
      { name: '長ネギ', quantity: 1, unit: '本' },
    ],
    instructions: ['だしをとる', '具材を入れる', '味噌を溶かして完成'],
    nutritionInfo: { calories: 80, protein: 5, carbs: 5, fat: 2 },
    url: 'https://example.com/misosoup'
  },
  {
    id: 'recipe-005',
    name: 'サラダチキン',
    category: 'おつまみ',
    cookingTime: 15,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: '鶏むね肉', quantity: 1, unit: '枚' },
      { name: '塩', quantity: 1, unit: '小さじ' },
      { name: '黒胡椒', quantity: 1, unit: '少々' },
      { name: 'ハーブ', quantity: 1, unit: '適量' },
    ],
    instructions: ['鶏肉に塩コショウをする', 'ジップロックに入れて湯煎する', '冷蔵庫で冷やして完成'],
    nutritionInfo: { calories: 200, protein: 40, carbs: 0, fat: 5 },
    url: 'https://example.com/saladchicken'
  },
  {
    id: 'recipe-006',
    name: '野菜炒め',
    category: '副菜',
    cookingTime: 15,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1518133835878-5a93cc3f89e5?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: 'キャベツ', quantity: 1/4, unit: '個' },
      { name: 'もやし', quantity: 1, unit: '袋' },
      { name: 'ニンジン', quantity: 1/2, unit: '本' },
      { name: 'ピーマン', quantity: 2, unit: '個' },
      { name: '豚バラ', quantity: 100, unit: 'g' },
      { name: '塩', quantity: 小, unit: '1' },
      { name: '胡椒', quantity: 少々, unit: '' },
    ],
    instructions: ['野菜を切る', '豚バラを炒める', '野菜を加えて炒める', '塩コショウで味付けする'],
    nutritionInfo: { calories: 250, protein: 10, carbs: 15, fat: 18 },
    url: 'https://example.com/yasaitame'
  },
  {
    id: 'recipe-007',
    name: 'きんぴらごぼう',
    category: '副菜',
    cookingTime: 20,
    difficulty: 'medium',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1664472729991-44c1a2213408?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: 'ごぼう', quantity: 1, unit: '本' },
      { name: 'にんじん', quantity: 1/2, unit: '本' },
      { name: '唐辛子', quantity: 1, unit: '本' },
      { name: '醤油', quantity: 大, unit: '1' },
      { name: 'みりん', quantity: 大, unit: '1' },
      { name: '砂糖', quantity: 小, unit: '1' },
      { name: 'ごま油', quantity: 小, unit: '2' },
    ],
    instructions: ['ごぼうを細切りにして水にさらす', 'にんじんも細切りにする', 'ごま油で炒める', '調味料を加えて炒め煮にする'],
    nutritionInfo: { calories: 120, protein: 2, carbs: 20, fat: 5 },
    url: 'https://example.com/kinpira'
  },
  {
    id: 'recipe-008',
    name: 'ほうれん草のおひたし',
    category: '副菜',
    cookingTime: 10,
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=500&auto=format&fit=crop&q=60',
    source: 'モックレシピ',
    ingredients: [
      { name: 'ほうれん草', quantity: 1, unit: '束' },
      { name: 'かつお節', quantity: 1, unit: 'パック' },
      { name: '醤油', quantity: 大, unit: '1' },
    ],
    instructions: ['ほうれん草をゆでる', '冷水にとって冷やす', '水気を絞って切る', '醤油とかつお節をかける'],
    nutritionInfo: { calories: 50, protein: 3, carbs: 5, fat: 1 },
    url: 'https://example.com/ohitashi'
  }
];

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
 * Simulate API delay to make it feel like a real API call
 */
const simulateApiDelay = async (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

/**
 * Get recipe by ID
 */
export const getRecipeById = async (recipeId) => {
  const cacheKey = `recipe_${recipeId}`;
  
  return cachedApiCall(cacheKey, async () => {
    if (USE_MOCK_DATA) {
      const recipe = mockRecipes.find(r => r.id === recipeId);
      if (recipe) {
        return simulateApiDelay(recipe, 300);
      }
      throw new Error('Recipe not found');
    }
    
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
    if (USE_MOCK_DATA) {
      // Filter mock recipes that include at least some of our ingredients
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.ingredients.some(ri => 
          ingredients.some(i => ri.name.includes(i) || i.includes(ri.name))
        )
      );
      return simulateApiDelay(filteredRecipes, 700);
    }
    
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
    if (USE_MOCK_DATA) {
      return simulateApiDelay(mockRecipes, 800);
    }
    
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
    if (USE_MOCK_DATA) {
      // Filter mock recipes by category
      const filteredRecipes = mockRecipes.filter(recipe => recipe.category === categoryId);
      return simulateApiDelay(filteredRecipes.length > 0 ? filteredRecipes : mockRecipes, 500);
    }
    
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
    if (USE_MOCK_DATA) {
      // Filter mock recipes by query
      const filteredRecipes = mockRecipes.filter(recipe => 
        recipe.name.includes(query) || 
        recipe.ingredients.some(ing => ing.name.includes(query))
      );
      return simulateApiDelay(filteredRecipes, 500);
    }
    
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