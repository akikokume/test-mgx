import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecipeById } from '../store/reducers/recipeReducer';
import { fetchIngredients } from '../store/reducers/ingredientReducer';
import { checkAuthState } from '../store/reducers/userReducer';
import RecipeDetailComponent from '../components/Recipes/RecipeDetail';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get user info
  const { current: user } = useSelector(state => state.user);
  const { currentRecipe, status, error } = useSelector(state => state.recipes);
  const { status: ingredientStatus } = useSelector(state => state.ingredients);
  
  // Check auth and load data
  useEffect(() => {
    dispatch(checkAuthState()).then(userData => {
      if (userData) {
        // Load user ingredients
        dispatch(fetchIngredients(userData.id));
      }
    });
    
    // Load recipe details
    if (recipeId) {
      dispatch(fetchRecipeById(recipeId));
    }
  }, [dispatch, recipeId]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {status === 'loading' ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-red-800 mb-3">エラーが発生しました</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            戻る
          </button>
        </div>
      ) : currentRecipe ? (
        <RecipeDetailComponent />
      ) : (
        <div className="bg-yellow-50 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-yellow-800 mb-3">レシピが見つかりません</h2>
          <p className="text-yellow-700">
            指定されたレシピが見つかりませんでした。別のレシピをお試しください。
          </p>
          <button
            onClick={() => navigate('/meal-plan')}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            レシピを探す
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;
