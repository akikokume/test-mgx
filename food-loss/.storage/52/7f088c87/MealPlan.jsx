import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkAuthState } from '../store/reducers/userReducer';
import { fetchIngredients } from '../store/reducers/ingredientReducer';
import { fetchPopularRecipes, fetchRecipesByIngredients, clearRecipes } from '../store/reducers/recipeReducer';
import { createMealPlan, optimizeCurrentPlan, updateMealEntry } from '../store/reducers/mealPlanReducer';
import WeeklyCalendar from '../components/MealPlan/WeeklyCalendar';
import RecipeCard from '../components/Recipes/RecipeCard';

const MealPlan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get Redux state
  const { current: user } = useSelector(state => state.user);
  const { availableIngredients } = useSelector(state => state.ingredients);
  const { recipes, popularRecipes, status: recipeStatus } = useSelector(state => state.recipes);
  const { currentPlan, plannedMeals, status: mealPlanStatus } = useSelector(state => state.mealPlan);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [currentMealEditing, setCurrentMealEditing] = useState(null);
  
  // Check authentication and load user data
  useEffect(() => {
    dispatch(checkAuthState()).unwrap()
      .then(userData => {
        if (userData) {
          dispatch(fetchIngredients(userData.id));
          dispatch(fetchPopularRecipes());
        } else {
          navigate('/auth');
        }
      })
      .catch(() => {
        navigate('/auth');
      });
      
    // Check if we have a selected recipe from another page
    if (location.state && location.state.selectedRecipeId) {
      setCurrentMealEditing({
        date: new Date().toISOString().split('T')[0],
        type: 'dinner',
        isNew: true
      });
      setShowRecipeSelector(true);
    }
      
    // Clean up function
    return () => {
      dispatch(clearRecipes());
    };
  }, [dispatch, navigate, location]);
  
  // Generate meal plan when button is clicked
  const handleGenerateMealPlan = () => {
    if (!user) return;
    
    setIsGeneratingPlan(true);
    
    // Create meal plan options
    const options = {
      startDate: selectedDate,
      days: 7,
      includeBreakfast: true,
      includeLunch: true,
      includeDinner: true
    };
    
    dispatch(createMealPlan({
      userId: user.id,
      options,
      availableIngredients,
      recipes: recipes.length > 0 ? recipes : popularRecipes
    })).finally(() => {
      setIsGeneratingPlan(false);
    });
  };
  
  // Optimize existing meal plan
  const handleOptimizeMealPlan = () => {
    if (!currentPlan) return;
    
    dispatch(optimizeCurrentPlan());
  };
  
  // Handle meal editing
  const handleEditMeal = (meal) => {
    setCurrentMealEditing(meal);
    setShowRecipeSelector(true);
    
    // Find recipes that match available ingredients
    if (availableIngredients && availableIngredients.length > 0) {
      const ingredientNames = availableIngredients.map(ing => ing.name);
      dispatch(fetchRecipesByIngredients(ingredientNames));
    } else {
      // Fall back to popular recipes if no ingredients
      dispatch(fetchPopularRecipes());
    }
  };
  
  // Handle adding a recipe to meal plan
  const handleAddToMealPlan = (recipeId) => {
    if (!currentMealEditing) return;
    
    // If it's a new meal (not existing in plan)
    if (currentMealEditing.isNew) {
      // Find empty meal slot with matching date and type
      const existingMeal = plannedMeals.find(meal => 
        meal.date === currentMealEditing.date && meal.type === currentMealEditing.type
      );
      
      if (existingMeal) {
        // Update existing empty meal
        dispatch(updateMealEntry({
          mealId: existingMeal.id,
          recipeId,
          servings: 2
        }));
      } else {
        console.error('No matching meal slot found');
      }
    } else {
      // Update existing meal
      dispatch(updateMealEntry({
        mealId: currentMealEditing.id,
        recipeId,
        servings: currentMealEditing.servings || 2
      }));
    }
    
    setShowRecipeSelector(false);
    setCurrentMealEditing(null);
  };
  
  // View recipe details
  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Filter recipes based on search query
  const filteredRecipes = searchQuery.trim() === '' 
    ? recipes.length > 0 ? recipes : popularRecipes
    : (recipes.length > 0 ? recipes : popularRecipes).filter(recipe => 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  // Format date for display
  const formatDateRange = () => {
    if (!currentPlan) return '';
    
    const start = new Date(currentPlan.startDate);
    const end = new Date(currentPlan.endDate);
    
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">献立計画</h1>
      
      {/* Current plan section */}
      {currentPlan ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              現在の献立計画: {formatDateRange()}
            </h2>
            <div className="flex space-x-3">
              <button
                onClick={handleOptimizeMealPlan}
                disabled={mealPlanStatus === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                献立を最適化
              </button>
              <button
                onClick={handleGenerateMealPlan}
                disabled={isGeneratingPlan}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                献立を再生成
              </button>
            </div>
          </div>
          
          {/* Weekly Calendar */}
          <WeeklyCalendar
            onEditMeal={handleEditMeal}
            onViewRecipe={handleViewRecipe}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">献立計画を作成しましょう</h2>
          <p className="text-gray-600 mb-6">
            食材のロスを減らすために、冷蔵庫の食材を活用したレシピから献立を自動作成できます。
          </p>
          <button
            onClick={handleGenerateMealPlan}
            disabled={isGeneratingPlan}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md font-medium"
          >
            {isGeneratingPlan ? (
              <>
                <span className="inline-block animate-spin mr-2">⟳</span>
                献立を作成中...
              </>
            ) : (
              '自動で献立を作成'
            )}
          </button>
        </div>
      )}
      
      {/* Recipe selector modal */}
      {showRecipeSelector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 bg-green-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {currentMealEditing?.date && new Date(currentMealEditing.date).toLocaleDateString('ja-JP')}
                {' '}
                {currentMealEditing?.type === 'breakfast' && '朝食'}
                {currentMealEditing?.type === 'lunch' && '昼食'}
                {currentMealEditing?.type === 'dinner' && '夕食'}
                のレシピを選択
              </h3>
              <button
                onClick={() => {
                  setShowRecipeSelector(false);
                  setCurrentMealEditing(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="レシピを検索..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button className="bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[60vh]">
                {recipeStatus === 'loading' ? (
                  <div className="py-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-500">レシピを読み込み中...</p>
                  </div>
                ) : filteredRecipes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredRecipes.map(recipe => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isMealPlanMode={true}
                        onAddToMealPlan={handleAddToMealPlan}
                        onViewRecipe={handleViewRecipe}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery.trim() !== '' 
                        ? '検索条件に一致するレシピが見つかりませんでした。'
                        : 'レシピが見つかりませんでした。'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tips section */}
      <div className="mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">食材ロスを減らすヒント</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              「献立を最適化」ボタンを使うと、期限が近い食材を優先的に使うレシピに献立を調整します。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              一度に1週間分の献立を計画して、必要な食材だけを購入しましょう。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              余った食材は冷凍したり、アレンジして別の料理に使いましょう。アプリが自動的に提案します。
            </li>
          </ul>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/shopping-list')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
            >
              買い物リストを作成する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlan;
