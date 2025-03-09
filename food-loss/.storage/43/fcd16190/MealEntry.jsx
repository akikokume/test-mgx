import React from 'react';

// Component to display a single meal entry in the calendar
const MealEntry = ({ meal, recipe, onEditMeal, onViewRecipe }) => {
  // If no recipe is assigned yet
  if (!recipe) {
    return (
      <div 
        onClick={() => onEditMeal(meal)} 
        className="h-full flex flex-col items-center justify-center p-2 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="text-sm text-gray-500 mt-1">料理を選ぶ</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Recipe Image */}
      <div 
        className="h-16 bg-cover bg-center cursor-pointer"
        style={{ backgroundImage: `url(${recipe.imageUrl || 'https://via.placeholder.com/150?text=No+Image'})` }}
        onClick={() => onViewRecipe(recipe.id)}
      />
      
      {/* Recipe Info */}
      <div className="p-2">
        <div 
          className="font-medium text-sm text-gray-800 truncate cursor-pointer hover:text-green-600"
          onClick={() => onViewRecipe(recipe.id)}
        >
          {recipe.name}
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <div className="text-xs text-gray-500">
            {meal.servings > 1 ? `${meal.servings}人前` : '1人前'}
          </div>
          
          <button
            onClick={() => onEditMeal(meal)}
            className="text-xs text-green-600 hover:text-green-800 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            編集
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealEntry;
