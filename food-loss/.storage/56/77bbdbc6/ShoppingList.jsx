import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { checkAuthState } from '../store/reducers/userReducer';
import { fetchIngredients } from '../store/reducers/ingredientReducer';
import { generateShoppingList } from '../store/reducers/shoppingListReducer';
import ShoppingListComponent from '../components/ShoppingList/ShoppingList';

const ShoppingList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get state from redux
  const { current: user } = useSelector(state => state.user);
  const { currentPlan } = useSelector(state => state.mealPlan);
  const { currentList, items, status, error } = useSelector(state => state.shoppingList);
  
  // Check authentication and load data
  useEffect(() => {
    dispatch(checkAuthState()).unwrap()
      .then(userData => {
        if (userData) {
          dispatch(fetchIngredients(userData.id));
        } else {
          navigate('/auth');
        }
      })
      .catch(() => {
        navigate('/auth');
      });
  }, [dispatch, navigate]);
  
  // Generate shopping list from meal plan
  const handleGenerateShoppingList = () => {
    if (!currentPlan) {
      alert('献立計画が作成されていません。先に献立計画を作成してください。');
      return;
    }
    
    dispatch(generateShoppingList({
      mealPlanId: currentPlan.id,
      userId: user?.id
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">買い物リスト</h1>
      
      {currentList && items.length > 0 ? (
        <ShoppingListComponent />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">買い物リストを作成しましょう</h2>
          <p className="text-gray-600 mb-6">
            献立計画に基づいて、必要な食材の買い物リストを自動生成できます。
            既にお持ちの食材は自動的に除外されます。
          </p>
          
          {status === 'loading' ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              <span className="ml-3 text-gray-600">買い物リストを生成中...</span>
            </div>
          ) : (
            <button
              onClick={handleGenerateShoppingList}
              className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-md font-medium"
            >
              買い物リストを生成
            </button>
          )}
          
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md">
              {error}
            </div>
          )}
          
          {!currentPlan && (
            <div className="mt-6 text-sm text-gray-500">
              買い物リストを作成するには、先に
              <button
                onClick={() => navigate('/meal-plan')}
                className="ml-1 text-green-600 hover:text-green-700 hover:underline"
              >
                献立計画
              </button>
              を作成してください。
            </div>
          )}
        </div>
      )}
      
      {/* Tips section */}
      <div className="mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">食費削減のヒント</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              買い物に行く前にリストを確認しましょう。計画的に買い物をすることで、無駄な支出を減らせます。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              季節の食材を選ぶと、鮮度が高く価格も抑えられます。旬の食材で料理の質も向上します。
            </li>
            <li className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              まとめ買いは便利ですが、消費期限に注意しましょう。使い切れる量だけ購入することが大切です。
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShoppingList;
