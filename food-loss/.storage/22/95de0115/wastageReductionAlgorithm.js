// src/utils/wastageReductionAlgorithm.js
/**
 * Food Waste Reduction Algorithm
 * Core algorithm that optimizes meal plans to minimize food waste
 */

// Calculate expiry score based on days until expiry
export const calculateExpiryScore = (ingredient) => {
  if (!ingredient || !ingredient.expiryDate) {
    return 1.0; // Default low priority if no expiry date
  }

  const currentDate = new Date();
  const expiryDate = new Date(ingredient.expiryDate);
  const daysUntilExpiry = Math.ceil((expiryDate - currentDate) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 1) {
    return 10.0; // Very high priority for ingredients expiring in 1 day
  } else if (daysUntilExpiry <= 3) {
    return 7.0; // High priority for ingredients expiring in 2-3 days
  } else if (daysUntilExpiry <= 7) {
    return 5.0; // Medium priority for ingredients expiring within a week
  } else {
    // Gradually decreasing priority for ingredients with longer shelf life
    return Math.max(1.0, 5.0 - (daysUntilExpiry - 7) * 0.2);
  }
};

// Calculate usage efficiency score for a recipe given available ingredients
export const calculateUsageEfficiencyScore = (recipe, availableIngredients) => {
  if (!recipe || !recipe.ingredients || !availableIngredients || availableIngredients.length === 0) {
    return 0;
  }

  let usedIngredientCount = 0;
  let expiringIngredientCount = 0;

  // Count used and expiring ingredients
  for (const recipeIngredient of recipe.ingredients) {
    const matchingIngredient = availableIngredients.find(
      ingredient => ingredient.name.toLowerCase().includes(recipeIngredient.name.toLowerCase()) ||
                    recipeIngredient.name.toLowerCase().includes(ingredient.name.toLowerCase())
    );

    if (matchingIngredient) {
      usedIngredientCount += 1;
      
      // Calculate expiry score to check if it's expiring soon
      if (calculateExpiryScore(matchingIngredient) >= 5.0) {
        expiringIngredientCount += 1;
      }
    }
  }

  // Calculate base efficiency and expiry bonus
  const baseEfficiency = usedIngredientCount / recipe.ingredients.length;
  const expiryBonus = expiringIngredientCount / Math.max(1, availableIngredients.length);

  // Combined score with weighted components
  return baseEfficiency * 0.7 + expiryBonus * 0.3;
};

// Calculate compatibility score between ingredients
export const calculateCompatibilityScore = (ingredients) => {
  if (!ingredients || ingredients.length <= 1) {
    return 0;
  }

  // This is a simplified version. In a real app, we would have a database of ingredient compatibility.
  // For now, we'll assume ingredients are more compatible if they're in similar categories.
  
  // Simple ingredient categories
  const categories = {
    vegetables: ['にんじん', '玉ねぎ', 'トマト', '大根', 'キャベツ', '白菜', 'ブロッコリー', 'ピーマン', 'ほうれん草'],
    proteins: ['鶏肉', '豚肉', '牛肉', '卵', '豆腐', '納豆', '魚'],
    grains: ['米', 'パスタ', 'パン', '麺'],
    seasonings: ['塩', '醤油', 'みりん', '砂糖', '味噌', 'バター'],
  };

  // Count ingredients in same category
  let sameCategory = 0;
  let totalComparisons = 0;

  for (let i = 0; i < ingredients.length; i++) {
    for (let j = i + 1; j < ingredients.length; j++) {
      totalComparisons++;
      
      // Find what category each ingredient belongs to
      const categoryI = Object.keys(categories).find(
        cat => categories[cat].some(item => ingredients[i].name.includes(item))
      );
      
      const categoryJ = Object.keys(categories).find(
        cat => categories[cat].some(item => ingredients[j].name.includes(item))
      );
      
      if (categoryI && categoryJ && categoryI === categoryJ) {
        sameCategory++;
      }
    }
  }

  // Calculate compatibility score (higher means more diverse ingredients)
  const diversityScore = 1 - (sameCategory / Math.max(1, totalComparisons));
  return diversityScore;
};

// Find optimal recipes based on available ingredients
export const findOptimalRecipeCombination = (availableIngredients, recipes, userPreferences = {}) => {
  if (!availableIngredients || !recipes || recipes.length === 0) {
    return [];
  }

  // Calculate scores for each recipe
  const scoredRecipes = recipes.map(recipe => {
    const efficiencyScore = calculateUsageEfficiencyScore(recipe, availableIngredients);
    
    // Factor in user preferences if available
    let preferenceScore = 1.0;
    if (userPreferences.dislikedIngredients) {
      const dislikedIngredientsCount = recipe.ingredients.filter(ingredient => 
        userPreferences.dislikedIngredients.some(disliked => 
          ingredient.name.toLowerCase().includes(disliked.toLowerCase())
        )
      ).length;
      
      // Reduce score if recipe contains disliked ingredients
      if (dislikedIngredientsCount > 0) {
        preferenceScore = Math.max(0.1, 1 - (dislikedIngredientsCount / recipe.ingredients.length));
      }
    }
    
    // Combined score
    const totalScore = efficiencyScore * 0.7 + preferenceScore * 0.3;
    
    return {
      ...recipe,
      score: totalScore
    };
  });
  
  // Sort recipes by score in descending order
  return scoredRecipes.sort((a, b) => b.score - a.score);
};

// Optimize a meal plan to minimize waste
export const optimizeMealPlan = (mealPlan, availableIngredients, recipes) => {
  if (!mealPlan || !mealPlan.meals || !availableIngredients || !recipes) {
    return mealPlan;
  }

  // Create a copy of the meal plan to modify
  const optimizedPlan = { ...mealPlan, meals: [...mealPlan.meals] };
  
  // Track which ingredients will be used by meals
  const usedIngredients = new Set();
  
  // First, identify meals that already use expiring ingredients
  optimizedPlan.meals.forEach(meal => {
    if (meal.recipeId) {
      const recipe = recipes.find(r => r.id === meal.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          const matchingIngredient = availableIngredients.find(
            ai => ai.name.toLowerCase().includes(ing.name.toLowerCase())
          );
          if (matchingIngredient) {
            usedIngredients.add(matchingIngredient.id);
          }
        });
      }
    }
  });
  
  // Find unused ingredients, prioritizing those expiring soon
  const unusedIngredients = availableIngredients
    .filter(ing => !usedIngredients.has(ing.id))
    .sort((a, b) => calculateExpiryScore(b) - calculateExpiryScore(a));
  
  // Find empty meal slots that need recipes
  const emptyMealSlots = optimizedPlan.meals
    .map((meal, index) => ({ index, meal }))
    .filter(item => !item.meal.recipeId);
  
  // For each unused ingredient (starting with the most critical)
  for (const ingredient of unusedIngredients) {
    if (emptyMealSlots.length === 0) break;
    
    // Find recipes that use this ingredient
    const candidateRecipes = findOptimalRecipeCombination(
      [ingredient], 
      recipes
    );
    
    if (candidateRecipes.length > 0) {
      // Get the best recipe that uses this ingredient
      const bestRecipe = candidateRecipes[0];
      
      // Assign to the next empty slot
      const slotIndex = emptyMealSlots[0].index;
      optimizedPlan.meals[slotIndex] = {
        ...optimizedPlan.meals[slotIndex],
        recipeId: bestRecipe.id
      };
      
      // Remove this slot from empty slots
      emptyMealSlots.shift();
      
      // Mark ingredients as used
      bestRecipe.ingredients.forEach(ing => {
        const matchingIngredient = availableIngredients.find(
          ai => ai.name.toLowerCase().includes(ing.name.toLowerCase())
        );
        if (matchingIngredient) {
          usedIngredients.add(matchingIngredient.id);
        }
      });
    }
  }
  
  // Fill any remaining empty slots with popular recipes
  emptyMealSlots.forEach(slot => {
    if (!optimizedPlan.meals[slot.index].recipeId && recipes.length > 0) {
      // Just pick a random recipe if nothing else matches
      const randomIndex = Math.floor(Math.random() * Math.min(5, recipes.length));
      optimizedPlan.meals[slot.index] = {
        ...optimizedPlan.meals[slot.index],
        recipeId: recipes[randomIndex].id
      };
    }
  });
  
  return optimizedPlan;
};

// Evaluate the overall quality of a meal plan
export const evaluateMealPlan = (mealPlan, availableIngredients, recipes, userPreferences) => {
  if (!mealPlan || !mealPlan.meals || !availableIngredients || !recipes) {
    return 0;
  }

  // Calculate ingredient usage score
  let usedIngredients = new Set();
  let expiringIngredientsUsed = 0;
  let totalExpiringIngredients = 0;
  
  // Count expiring ingredients
  availableIngredients.forEach(ing => {
    if (calculateExpiryScore(ing) >= 5.0) {
      totalExpiringIngredients++;
    }
  });
  
  // Track which ingredients are used in the meal plan
  mealPlan.meals.forEach(meal => {
    if (meal.recipeId) {
      const recipe = recipes.find(r => r.id === meal.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(recipeIng => {
          const matchingIng = availableIngredients.find(ing => 
            ing.name.toLowerCase().includes(recipeIng.name.toLowerCase()) ||
            recipeIng.name.toLowerCase().includes(ing.name.toLowerCase())
          );
          
          if (matchingIng) {
            usedIngredients.add(matchingIng.id);
            
            if (calculateExpiryScore(matchingIng) >= 5.0) {
              expiringIngredientsUsed++;
            }
          }
        });
      }
    }
  });
  
  // Calculate various scores
  const ingredientUsageScore = usedIngredients.size / Math.max(1, availableIngredients.length);
  const wasteReductionScore = expiringIngredientsUsed / Math.max(1, totalExpiringIngredients);
  
  // Calculate variety score (how diverse the meal plan is)
  const recipeIds = new Set(mealPlan.meals.map(meal => meal.recipeId).filter(Boolean));
  const varietyScore = recipeIds.size / Math.max(1, mealPlan.meals.length);
  
  // Calculate preference match (how well it matches user preferences)
  let preferenceMatchScore = 1.0;
  if (userPreferences && userPreferences.dislikedIngredients) {
    let dislikedIngredientsCount = 0;
    let totalIngredients = 0;
    
    mealPlan.meals.forEach(meal => {
      if (meal.recipeId) {
        const recipe = recipes.find(r => r.id === meal.recipeId);
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ing => {
            totalIngredients++;
            if (userPreferences.dislikedIngredients.some(
              disliked => ing.name.toLowerCase().includes(disliked.toLowerCase())
            )) {
              dislikedIngredientsCount++;
            }
          });
        }
      }
    });
    
    preferenceMatchScore = Math.max(0, 1 - (dislikedIngredientsCount / Math.max(1, totalIngredients)));
  }
  
  // Simple nutritional balance score (placeholder for real calculation)
  const nutritionBalanceScore = 0.5; // Default middle value
  
  // Combined score with weights
  const w1 = 0.3;  // Ingredient usage efficiency
  const w2 = 0.3;  // Waste reduction
  const w3 = 0.15; // Recipe variety
  const w4 = 0.15; // Preference match
  const w5 = 0.1;  // Nutrition balance
  
  return (
    w1 * ingredientUsageScore +
    w2 * wasteReductionScore +
    w3 * varietyScore +
    w4 * preferenceMatchScore +
    w5 * nutritionBalanceScore
  );
};

// Suggest ingredient substitutions
export const suggestIngredientSubstitutions = (recipe, availableIngredients) => {
  if (!recipe || !recipe.ingredients || !availableIngredients) {
    return {};
  }

  const substitutions = {};
  const commonSubstitutions = {
    'バター': ['マーガリン', 'オリーブオイル'],
    '牛乳': ['豆乳', '無調整豆乳', 'アーモンドミルク'],
    '小麦粉': ['米粉', 'コーンスターチ'],
    'サラダ油': ['オリーブオイル', 'ごま油', 'キャノーラ油'],
    '砂糖': ['はちみつ', 'メープルシロップ', '三温糖'],
    '白米': ['玄米', '雑穀米'],
    'じゃがいも': ['さつまいも', '里芋'],
    '鶏肉': ['豚肉', '豆腐'],
    '豚肉': ['鶏肉', '牛肉'],
    '牛肉': ['豚肉', '鶏肉'],
    'パン粉': ['クラッカー', '米粉'],
  };
  
  // Check each recipe ingredient
  recipe.ingredients.forEach(recipeIng => {
    // Check if we need a substitution (ingredient not available)
    const hasIngredient = availableIngredients.some(ing => 
      ing.name.toLowerCase().includes(recipeIng.name.toLowerCase()) ||
      recipeIng.name.toLowerCase().includes(ing.name.toLowerCase())
    );
    
    if (!hasIngredient) {
      // Check if we have substitutes available
      const possibleSubstitutes = commonSubstitutions[recipeIng.name] || [];
      
      for (const substitute of possibleSubstitutes) {
        const substituteAvailable = availableIngredients.some(ing => 
          ing.name.toLowerCase().includes(substitute.toLowerCase())
        );
        
        if (substituteAvailable) {
          substitutions[recipeIng.name] = substitute;
          break;
        }
      }
    }
  });
  
  return substitutions;
};

export default {
  calculateExpiryScore,
  calculateUsageEfficiencyScore,
  calculateCompatibilityScore,
  findOptimalRecipeCombination,
  optimizeMealPlan,
  evaluateMealPlan,
  suggestIngredientSubstitutions
};
