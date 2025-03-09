import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MealEntry from './MealEntry';

// Component for displaying the weekly meal plan calendar
const WeeklyCalendar = ({
  onEditMeal,
  onViewRecipe,
  selectedDate,
  onDateChange
}) => {
  const { plannedMeals } = useSelector(state => state.mealPlan);
  const { recipes, popularRecipes } = useSelector(state => state.recipes);
  const [weekDays, setWeekDays] = useState([]);
  
  // Calculate week days when selected date changes
  useEffect(() => {
    if (selectedDate) {
      const days = getWeekDays(new Date(selectedDate));
      setWeekDays(days);
    } else {
      const days = getWeekDays(new Date());
      setWeekDays(days);
    }
  }, [selectedDate]);

  // Get 7 days of the week starting from the given date
  const getWeekDays = (startDate) => {
    const days = [];
    const currentDay = new Date(startDate);
    
    // If no specific date is selected, start from today
    if (!selectedDate) {
      currentDay.setHours(0, 0, 0, 0);
    }
    
    // Get the day of week (0 = Sunday)
    const dayOfWeek = currentDay.getDay();
    
    // Adjust to start from Monday
    currentDay.setDate(currentDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };

  // Format date to YYYY-MM-DD for comparing with meal plan dates
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Check if the given date is today
  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  // Format date for display in the header
  const formatDateHeader = (date) => {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // Get day of week in Japanese
  const getDayOfWeek = (date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[date.getDay()];
  };

  // Navigate to previous week
  const goPreviousWeek = () => {
    const newStartDate = new Date(weekDays[0]);
    newStartDate.setDate(newStartDate.getDate() - 7);
    onDateChange(formatDate(newStartDate));
  };

  // Navigate to next week
  const goNextWeek = () => {
    const newStartDate = new Date(weekDays[0]);
    newStartDate.setDate(newStartDate.getDate() + 7);
    onDateChange(formatDate(newStartDate));
  };

  // Get meals for a specific date and meal type
  const getMealsForDateAndType = (date, mealType) => {
    const dateStr = formatDate(date);
    return plannedMeals.filter(meal => meal.date === dateStr && meal.type === mealType);
  };

  // Find a recipe by its ID
  const findRecipeById = (recipeId) => {
    return recipes.find(r => r.id === recipeId) || 
           popularRecipes.find(r => r.id === recipeId) || 
           null;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-green-600 text-white">
        <button
          onClick={goPreviousWeek}
          className="p-2 rounded-full hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold">
          {weekDays.length > 0 && `${weekDays[0].getFullYear()}年${weekDays[0].getMonth() + 1}月`}
        </h2>
        
        <button
          onClick={goNextWeek}
          className="p-2 rounded-full hover:bg-green-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Day Headers */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((day, index) => (
          <div 
            key={index}
            className={`p-2 text-center border-r border-gray-200 ${
              isToday(day) ? 'bg-green-50' : ''
            } ${index === 6 ? 'border-r-0' : ''}`}
          >
            <p className={`text-sm font-medium ${day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
              {getDayOfWeek(day)}
            </p>
            <p className={`text-lg ${isToday(day) ? 'font-bold text-green-700' : 'text-gray-800'}`}>
              {formatDateHeader(day)}
            </p>
          </div>
        ))}
      </div>
      
      {/* Meal Types */}
      {['breakfast', 'lunch', 'dinner'].map(mealType => (
        <div key={mealType} className="grid grid-cols-7 border-b border-gray-200">
          <div className="col-span-7 bg-gray-100 px-4 py-2 border-b border-gray-200">
            <h3 className="font-medium text-gray-700">
              {mealType === 'breakfast' ? '朝食' : mealType === 'lunch' ? '昼食' : '夕食'}
            </h3>
          </div>
          
          {weekDays.map((day, index) => {
            const meals = getMealsForDateAndType(day, mealType);
            
            return (
              <div 
                key={`${mealType}-${index}`} 
                className={`min-h-[100px] border-r border-gray-200 p-2 ${
                  index === 6 ? 'border-r-0' : ''
                } ${isToday(day) ? 'bg-green-50' : ''}`}
              >
                {meals.length > 0 ? (
                  meals.map(meal => {
                    const recipe = meal.recipeId ? findRecipeById(meal.recipeId) : null;
                    
                    return (
                      <MealEntry
                        key={meal.id}
                        meal={meal}
                        recipe={recipe}
                        onEditMeal={onEditMeal}
                        onViewRecipe={onViewRecipe}
                      />
                    );
                  })
                ) : (
                  <div 
                    className="h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-green-300 transition-colors"
                    onClick={() => onEditMeal({
                      date: formatDate(day),
                      type: mealType
                    })}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default WeeklyCalendar;
