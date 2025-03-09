import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchRecipeById } from '../../store/reducers/recipeReducer';

// Component to display a recipe card in the list of recipes
const RecipeCard = ({ recipe, onAddToMealPlan, isMealPlanMode = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Navigate to recipe detail page
  const handleViewDetails = () => {
    dispatch(fetchRecipeById(recipe.id));
    navigate(`/recipe/${recipe.id}`);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case '簡単':
        return 'bg-green-100 text-green-800';
      case 'medium':
      case '普通':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case '難しい':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      {/* Recipe Image */}
      <div className="h-48 w-full bg-gray-200 overflow-hidden">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <span>画像がありません</span>
          </div>
        )}
      </div>
      
      {/* Recipe Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{recipe.name}</h3>
          {recipe.score !== undefined && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
              マッチ度: {Math.round(recipe.score * 100)}%
            </span>
          )}
        </div>
        
        {/* Recipe details */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
            調理時間: {recipe.cookingTime}分
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded ${getDifficultyColor(recipe.difficulty)}`}>
            難易度: {recipe.difficulty}
          </span>
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
            {recipe.category}
          </span>
        </div>
        
        {/* Ingredient preview */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">主な材料:</p>
          <div className="flex flex-wrap gap-1">
            {recipe.ingredients && recipe.ingredients.slice(0, 3).map((ing, idx) => (
              <span key={idx} className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1">
                {ing.name}
              </span>
            ))}
            {recipe.ingredients && recipe.ingredients.length > 3 && (
              <span className="text-xs text-gray-500">他{recipe.ingredients.length - 3}種...</span>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between mt-2">
          <button
            onClick={handleViewDetails}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            詳細を見る
          </button>
          
          {isMealPlanMode && (
            <button
              onClick={() => onAddToMealPlan(recipe.id)}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded"
            >
              献立に追加
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
