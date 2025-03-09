import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchRecipeById } from '../../store/reducers/recipeReducer';
import { addToFavorites, removeFromFavorites } from '../../store/reducers/recipeReducer';
import { suggestIngredientSubstitutions } from '../../utils/wastageReductionAlgorithm';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get state from Redux
  const { currentRecipe, status, error } = useSelector(state => state.recipes);
  const { availableIngredients } = useSelector(state => state.ingredients);
  
  // Local state
  const [servings, setServings] = useState(2);
  const [substitutions, setSubstitutions] = useState({});
  
  // Fetch recipe details on component mount
  useEffect(() => {
    if (recipeId) {
      dispatch(fetchRecipeById(recipeId));
    }
  }, [dispatch, recipeId]);
  
  // Calculate substitutions when recipe or ingredients change
  useEffect(() => {
    if (currentRecipe && availableIngredients) {
      const subs = suggestIngredientSubstitutions(currentRecipe, availableIngredients);
      setSubstitutions(subs);
    }
  }, [currentRecipe, availableIngredients]);
  
  // Handle adding to meal plan
  const handleAddToMealPlan = () => {
    navigate('/meal-plan', { state: { selectedRecipeId: recipeId } });
  };
  
  // Check if ingredient is available in user's inventory
  const isIngredientAvailable = (ingredientName) => {
    return availableIngredients.some(ing => 
      ing.name.toLowerCase().includes(ingredientName.toLowerCase()) ||
      ingredientName.toLowerCase().includes(ing.name.toLowerCase())
    );
  };
  
  // Calculate adjusted quantity based on servings
  const adjustQuantity = (quantity) => {
    if (!quantity) return '-';
    const baseServings = 2; // Assume recipes are for 2 people by default
    return (quantity * servings / baseServings).toFixed(1).replace(/\.0$/, '');
  };
  
  // Toggle favorite status
  const toggleFavorite = () => {
    if (currentRecipe.isFavorite) {
      dispatch(removeFromFavorites(currentRecipe.id));
    } else {
      dispatch(addToFavorites(currentRecipe.id));
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">レシピの読み込み中にエラーが発生しました。</p>
        <p className="text-red-600 text-sm mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 bg-white text-red-700 border border-red-300 px-4 py-2 rounded hover:bg-red-50"
        >
          戻る
        </button>
      </div>
    );
  }
  
  if (!currentRecipe) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md">
        <p className="text-yellow-700">レシピが見つかりませんでした。</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-3 bg-white text-yellow-700 border border-yellow-300 px-4 py-2 rounded hover:bg-yellow-50"
        >
          戻る
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
      {/* Recipe Header */}
      <div className="relative">
        {/* Recipe Image */}
        <div className="h-64 sm:h-80 bg-gray-200">
          {currentRecipe.imageUrl ? (
            <img 
              src={currentRecipe.imageUrl} 
              alt={currentRecipe.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
              <span>画像がありません</span>
            </div>
          )}
        </div>
        
        {/* Recipe Title and Actions */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">{currentRecipe.name}</h1>
            <div className="flex space-x-2">
              <button 
                onClick={toggleFavorite}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {currentRecipe.isFavorite ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
              <button
                onClick={handleAddToMealPlan}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                献立に追加する
              </button>
            </div>
          </div>
          
          {/* Recipe Meta Info */}
          <div className="flex flex-wrap gap-3 mb-4 mt-2">
            <span className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              調理時間: {currentRecipe.cookingTime}分
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              難易度: {currentRecipe.difficulty}
            </span>
            <span className="flex items-center text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              カテゴリ: {currentRecipe.category}
            </span>
          </div>
          
          {/* Source */}
          <div className="text-sm text-gray-500 mb-4">
            <span>出典: {currentRecipe.source}</span>
            {currentRecipe.url && (
              <a 
                href={currentRecipe.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 text-green-600 hover:text-green-700 hover:underline"
              >
                オリジナルレシピを見る
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content - Two Column Layout */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Ingredients */}
        <div className="md:col-span-1">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-gray-800">材料</h2>
              <div className="flex items-center">
                <label className="text-sm text-gray-600 mr-2">人数:</label>
                <select 
                  value={servings} 
                  onChange={(e) => setServings(parseInt(e.target.value))}
                  className="border border-gray-300 rounded-md py-1 px-2"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}人前</option>
                  ))}
                </select>
              </div>
            </div>
            
            <ul className="space-y-2">
              {currentRecipe.ingredients && currentRecipe.ingredients.map((ingredient, idx) => {
                const isAvailable = isIngredientAvailable(ingredient.name);
                const hasSubstitution = substitutions[ingredient.name];
                
                return (
                  <li 
                    key={idx}
                    className={`py-2 px-3 rounded-md flex justify-between items-center ${
                      isAvailable 
                        ? 'bg-green-50 border border-green-100' 
                        : hasSubstitution 
                          ? 'bg-yellow-50 border border-yellow-100'
                          : 'bg-white border border-gray-100'
                    }`}
                  >
                    <div className="flex items-center">
                      {isAvailable ? (
                        <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full bg-green-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : hasSubstitution ? (
                        <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full bg-yellow-500 text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <span className="w-5 h-5 mr-2 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </span>
                      )}
                      <span className="text-gray-800">
                        {hasSubstitution ? (
                          <>
                            <span className="line-through text-gray-400">{ingredient.name}</span>
                            <span className="ml-2">→ {substitutions[ingredient.name]}</span>
                          </>
                        ) : (
                          ingredient.name
                        )}
                      </span>
                    </div>
                    <span className="text-gray-600">
                      {adjustQuantity(ingredient.quantity)} {ingredient.unit}
                    </span>
                  </li>
                );
              })}
            </ul>
            
            <div className="mt-4">
              <div className="flex space-x-2 mb-2">
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  <span className="text-gray-600">冷蔵庫にあります</span>
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                  <span className="text-gray-600">代用可能</span>
                </span>
                <span className="flex items-center text-sm">
                  <span className="w-3 h-3 bg-gray-200 rounded-full mr-1"></span>
                  <span className="text-gray-600">必要になります</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Instructions */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">作り方</h2>
          
          {currentRecipe.instructions && currentRecipe.instructions.length > 0 ? (
            <ol className="space-y-4">
              {currentRecipe.instructions.map((step, idx) => (
                <li key={idx} className="flex">
                  <div className="mr-4 flex-shrink-0">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700">{step}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-600">詳細な調理手順は提供されていません。</p>
              {currentRecipe.url && (
                <p className="text-sm text-gray-500 mt-2">
                  詳細は
                  <a 
                    href={currentRecipe.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-1 text-green-600 hover:text-green-700 hover:underline"
                  >
                    オリジナルレシピ
                  </a>
                  をご覧ください。
                </p>
              )}
            </div>
          )}
          
          {/* Nutrition Info */}
          {currentRecipe.nutritionInfo && Object.values(currentRecipe.nutritionInfo).some(val => val > 0) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">栄養情報</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">カロリー</p>
                    <p className="font-semibold text-gray-700">{currentRecipe.nutritionInfo.calories} kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">たんぱく質</p>
                    <p className="font-semibold text-gray-700">{currentRecipe.nutritionInfo.protein} g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">炭水化物</p>
                    <p className="font-semibold text-gray-700">{currentRecipe.nutritionInfo.carbs} g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">脂質</p>
                    <p className="font-semibold text-gray-700">{currentRecipe.nutritionInfo.fat} g</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Back button */}
      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </button>
      </div>
    </div>
  );
};

export default RecipeDetail;
