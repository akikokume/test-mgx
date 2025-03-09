// src/pages/Ingredients.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchIngredients } from '../store/reducers/ingredientReducer';
import { checkAuthState } from '../store/reducers/userReducer';
import AddIngredientForm from '../components/Ingredients/AddIngredientForm';
import IngredientList from '../components/Ingredients/IngredientList';

const Ingredients = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: user } = useSelector(state => state.user);
  const { status, error } = useSelector(state => state.ingredients);
  
  // Check user authentication and load ingredients
  useEffect(() => {
    dispatch(checkAuthState()).unwrap()
      .then(userData => {
        if (userData) {
          dispatch(fetchIngredients(userData.id));
        }
      })
      .catch(() => {
        navigate('/auth');
      });
  }, [dispatch, navigate]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && status !== 'loading') {
      navigate('/auth');
    }
  }, [user, status, navigate]);
  
  if (!user && status !== 'loading') {
    return null; // Will redirect to auth page
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">食材管理</h1>
      
      <div className="grid grid-cols-1 gap-8">
        {/* Add ingredient form */}
        <AddIngredientForm />
        
        {/* Ingredient list */}
        {status === 'loading' ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : status === 'failed' ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">エラーが発生しました</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <IngredientList />
        )}
      </div>
      
      <div className="mt-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">食材管理のヒント</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              冷蔵庫にある食材はすべて登録しましょう。アプリが自動的に期限切れが近い食材を優先的に使うレシピを提案します。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              食材を使ったら、量を更新しましょう。正確な在庫管理があなたの食材ロス削減に役立ちます。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              買い物から帰ったら、新しい食材を追加しましょう。保存場所と消費期限を正確に入力することが大切です。
            </li>
          </ul>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/meal-plan')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
            >
              食材からレシピを探す
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
