// src/pages/Home.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchPopularRecipes } from '../store/reducers/recipeReducer';
import { fetchIngredients } from '../store/reducers/ingredientReducer';
import { checkAuthState } from '../store/reducers/userReducer';
import RecipeCard from '../components/Recipes/RecipeCard';

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: user } = useSelector(state => state.user);
  const { popularRecipes, status: recipeStatus } = useSelector(state => state.recipes);
  const { availableIngredients, status: ingredientStatus } = useSelector(state => state.ingredients);
  const { plannedMeals } = useSelector(state => state.mealPlan);
  
  // Check if user is already logged in
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);
  
  // Fetch popular recipes and user ingredients
  useEffect(() => {
    dispatch(fetchPopularRecipes());
    if (user) {
      dispatch(fetchIngredients(user.id));
    }
  }, [dispatch, user]);
  
  // Navigate to recipe details
  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };
  
  // Get upcoming meals (next 3 days)
  const getUpcomingMeals = () => {
    const today = new Date();
    const next3Days = [];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      next3Days.push(date.toISOString().split('T')[0]);
    }
    
    return plannedMeals.filter(meal => next3Days.includes(meal.date));
  };
  
  // Get expiring ingredients (expiring in the next 3 days)
  const getExpiringIngredients = () => {
    if (!availableIngredients) return [];
    
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    return availableIngredients.filter(ingredient => {
      if (!ingredient.expiryDate) return false;
      const expiryDate = new Date(ingredient.expiryDate);
      return expiryDate <= threeDaysFromNow;
    }).sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  };
  
  const upcomingMeals = getUpcomingMeals();
  const expiringIngredients = getExpiringIngredients();
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  
  // Get meal type in Japanese
  const getMealTypeJa = (type) => {
    switch(type) {
      case 'breakfast': return '朝食';
      case 'lunch': return '昼食';
      case 'dinner': return '夕食';
      default: return type;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          {user ? `${user.name}さん、こんにちは！` : 'こんにちは！'}
        </h1>
        <p className="text-gray-600 max-w-2xl">
          このアプリは、食材のロスを減らしながら、効率的に献立を計画するお手伝いをします。
          冷蔵庫の食材から最適なレシピを見つけ、買い物リストを自動作成します。
        </p>
        
        {!user && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/auth')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
            >
              ログインして始める
            </button>
          </div>
        )}
      </section>
      
      {/* Main Content - Two Columns Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Upcoming Meals & Expiring Ingredients */}
        <div className="lg:col-span-1 space-y-8">
          {/* Upcoming Meals */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-green-600 text-white">
              <h2 className="text-xl font-semibold">今後の献立</h2>
            </div>
            <div className="p-4">
              {upcomingMeals.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {upcomingMeals.map(meal => {
                    const recipe = popularRecipes.find(r => r.id === meal.recipeId);
                    
                    return (
                      <li key={meal.id} className="py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {recipe?.imageUrl ? (
                              <img
                                className="h-12 w-12 rounded-md object-cover"
                                src={recipe.imageUrl}
                                alt={recipe.name}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {formatDate(meal.date)} - {getMealTypeJa(meal.type)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {recipe ? recipe.name : '献立が設定されていません'}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-gray-500">献立が設定されていません</p>
                  <button
                    onClick={() => navigate('/meal-plan')}
                    className="mt-2 text-sm text-green-600 hover:text-green-700"
                  >
                    献立を作成する
                  </button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/meal-plan')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  すべての献立を見る
                </button>
              </div>
            </div>
          </div>
          
          {/* Expiring Ingredients Alert */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-yellow-500 text-white">
              <h2 className="text-xl font-semibold">もうすぐ期限切れの食材</h2>
            </div>
            <div className="p-4">
              {expiringIngredients.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {expiringIngredients.map(ingredient => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(ingredient.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                    );
                    
                    return (
                      <li key={ingredient.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{ingredient.name}</div>
                            <div className="text-sm text-gray-500">
                              {ingredient.quantity} {ingredient.unit}
                            </div>
                          </div>
                          <div className={`text-sm px-2 py-1 rounded-full ${
                            daysUntilExpiry <= 0 
                              ? 'bg-red-100 text-red-800' 
                              : daysUntilExpiry <= 1
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {daysUntilExpiry <= 0 
                              ? '期限切れ' 
                              : daysUntilExpiry === 1 
                                ? '今日まで' 
                                : `あと${daysUntilExpiry}日`
                            }
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-gray-500">期限切れの食材はありません</p>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate('/ingredients')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  すべての食材を見る
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Popular Recipes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-green-600 text-white">
              <h2 className="text-xl font-semibold">人気のレシピ</h2>
            </div>
            <div className="p-4">
              {recipeStatus === 'loading' ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
                  <p className="mt-4 text-gray-500">レシピを読み込み中...</p>
                </div>
              ) : popularRecipes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularRecipes.slice(0, 6).map(recipe => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      onViewRecipe={handleViewRecipe}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-gray-500">レシピを読み込めませんでした</p>
                  <button
                    onClick={() => dispatch(fetchPopularRecipes())}
                    className="mt-2 text-sm text-green-600 hover:text-green-700"
                  >
                    再試行
                  </button>
                </div>
              )}
              
              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate('/meal-plan')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md"
                >
                  献立を作成する
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Highlight */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">食材ロスを減らす機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">賢い献立作成</h3>
            <p className="text-gray-600">
              期限が近い食材を優先的に使うレシピを提案し、食材ロスを減らします。
              自動的に最適な献立プランを作成します。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">効率的な買い物リスト</h3>
            <p className="text-gray-600">
              必要なものだけを購入できるよう、在庫と献立から自動的に買い物リストを作成します。
              食費削減と無駄な買い物を防ぎます。
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">在庫管理</h3>
            <p className="text-gray-600">
              冷蔵庫の食材を簡単に管理。期限が近づくとアラートでお知らせし、
              常に食材を最大限に活用できるよう支援します。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
