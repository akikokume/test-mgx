import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleItemPurchased, 
  updateItemQuantity, 
  removeItem,
  updateListNotes,
  updateBudgetLimit
} from '../../store/reducers/shoppingListReducer';

const ShoppingList = () => {
  const dispatch = useDispatch();
  const { items, currentList } = useSelector(state => state.shoppingList);
  
  const [activeTab, setActiveTab] = useState('all');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budget, setBudget] = useState(0);
  
  useEffect(() => {
    if (currentList) {
      setNotes(currentList.notes || '');
      setBudget(currentList.budgetLimit || 0);
    }
  }, [currentList]);
  
  // Group items by category
  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  // Get sorted category names
  const categories = Object.keys(itemsByCategory).sort();
  
  // Calculate total items and purchased items
  const totalItems = items.length;
  const purchasedItems = items.filter(item => item.purchased).length;
  const progress = totalItems > 0 ? Math.round((purchasedItems / totalItems) * 100) : 0;
  
  // Calculate estimated total price
  const estimatedTotal = items.reduce((sum, item) => sum + (item.estimatedPrice || 0) * item.quantity, 0);
  
  // Handle toggling item purchased status
  const handleToggleItem = (itemId) => {
    dispatch(toggleItemPurchased(itemId));
  };
  
  // Handle updating item quantity
  const handleQuantityChange = (itemId, quantity) => {
    dispatch(updateItemQuantity({ itemId, quantity: parseFloat(quantity) || 0 }));
  };
  
  // Handle removing item
  const handleRemoveItem = (itemId) => {
    if (window.confirm('このアイテムを削除してもよろしいですか？')) {
      dispatch(removeItem(itemId));
    }
  };
  
  // Handle notes update
  const handleNotesUpdate = () => {
    dispatch(updateListNotes(notes));
    setEditingNotes(false);
  };
  
  // Handle budget update
  const handleBudgetUpdate = () => {
    dispatch(updateBudgetLimit(parseFloat(budget) || 0));
    setEditingBudget(false);
  };
  
  // Filter items based on active tab
  const filteredItems = activeTab === 'all' 
    ? items 
    : activeTab === 'remaining' 
      ? items.filter(item => !item.purchased) 
      : items.filter(item => item.purchased);
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-green-600 text-white">
        <h2 className="text-xl font-semibold">買い物リスト</h2>
        {currentList && (
          <p className="text-sm text-green-100 mt-1">
            {new Date(currentList.createdDate).toLocaleDateString('ja-JP')}作成
          </p>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">進捗状況: {purchasedItems}/{totalItems} アイテム</span>
          <span className="text-sm font-medium text-gray-700">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-green-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Budget Section */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="text-md font-medium text-gray-700">予算</h3>
          {!editingBudget ? (
            <button 
              onClick={() => setEditingBudget(true)}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              編集
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleBudgetUpdate}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                保存
              </button>
              <button 
                onClick={() => {
                  setEditingBudget(false);
                  setBudget(currentList?.budgetLimit || 0);
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
        
        {editingBudget ? (
          <div className="mt-2 flex items-center">
            <span className="text-gray-600 mr-2">¥</span>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              step="100"
            />
          </div>
        ) : (
          <div className="mt-2 flex justify-between">
            <div>
              <p className="text-gray-500 text-sm">設定金額:</p>
              <p className="font-semibold text-gray-800">¥{currentList?.budgetLimit?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">予想合計:</p>
              <p className={`font-semibold ${
                currentList?.budgetLimit && estimatedTotal > currentList.budgetLimit
                  ? 'text-red-600'
                  : 'text-gray-800'
              }`}>
                ¥{estimatedTotal.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Notes Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium text-gray-700">メモ</h3>
          {!editingNotes ? (
            <button 
              onClick={() => setEditingNotes(true)}
              className="text-green-600 hover:text-green-700 text-sm"
            >
              編集
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleNotesUpdate}
                className="text-green-600 hover:text-green-700 text-sm"
              >
                保存
              </button>
              <button 
                onClick={() => {
                  setEditingNotes(false);
                  setNotes(currentList?.notes || '');
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                キャンセル
              </button>
            </div>
          )}
        </div>
        
        {editingNotes ? (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="買い物リストへのメモ..."
            rows={3}
          />
        ) : (
          <p className="text-gray-600 text-sm">
            {currentList?.notes || 'メモはまだありません。'}
          </p>
        )}
      </div>
      
      {/* Filter Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'all' 
              ? 'text-green-600 border-b-2 border-green-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('all')}
        >
          全て ({items.length})
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'remaining' 
              ? 'text-green-600 border-b-2 border-green-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('remaining')}
        >
          未購入 ({items.filter(item => !item.purchased).length})
        </button>
        <button
          className={`flex-1 py-3 px-4 text-center ${
            activeTab === 'purchased' 
              ? 'text-green-600 border-b-2 border-green-600 font-medium' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('purchased')}
        >
          購入済み ({items.filter(item => item.purchased).length})
        </button>
      </div>
      
      {/* Shopping List */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-500">買い物リストが空です</h3>
          <p className="mt-2 text-gray-500">
            {activeTab === 'all' 
              ? '買い物リストにアイテムがありません。'
              : activeTab === 'remaining'
                ? '全てのアイテムを購入済みです！'
                : 'まだ何も購入していません。'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {activeTab === 'all' ? (
            // Group by category when showing all items
            categories.map(category => (
              <div key={category} className="p-4">
                <h3 className="text-md font-medium text-gray-700 mb-3 capitalize">
                  {category === 'vegetables' && '野菜'}
                  {category === 'fruits' && '果物'}
                  {category === 'meat' && '肉類'}
                  {category === 'seafood' && '魚介類'}
                  {category === 'dairy' && '乳製品'}
                  {category === 'grains' && '穀物'}
                  {category === 'seasonings' && '調味料'}
                  {category === 'other' && 'その他'}
                </h3>
                <ul className="space-y-2">
                  {itemsByCategory[category].map(item => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={handleToggleItem}
                      onQuantityChange={handleQuantityChange}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </ul>
              </div>
            ))
          ) : (
            // Show flat list for filtered views
            <ul className="p-4 space-y-2">
              {filteredItems.map(item => (
                <ShoppingItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// Individual shopping item component
const ShoppingItem = ({ item, onToggle, onQuantityChange, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onQuantityChange(item.id, quantity);
    setIsEditing(false);
  };
  
  return (
    <li className={`flex items-center p-2 rounded-md ${
      item.purchased ? 'bg-gray-50' : 'hover:bg-gray-50'
    }`}>
      <div className="mr-3">
        <input
          type="checkbox"
          checked={item.purchased}
          onChange={() => onToggle(item.id)}
          className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
        />
      </div>
      
      <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className={item.purchased ? 'line-through text-gray-500' : 'text-gray-800'}>
          {item.name}
        </div>
        
        <div className="flex items-center mt-1 sm:mt-0">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                min="0"
                step="0.1"
                autoFocus
                onBlur={handleSubmit}
              />
              <span className="ml-2 text-gray-600">{item.unit}</span>
              <button 
                type="submit" 
                className="ml-2 text-green-600 hover:text-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </form>
          ) : (
            <>
              <span className={`text-sm ${item.purchased ? 'text-gray-500' : 'text-gray-600'}`}>
                {item.quantity} {item.unit}
              </span>
              
              <button 
                onClick={() => setIsEditing(true)}
                className="ml-3 text-blue-600 hover:text-blue-700"
                title="数量を編集する"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              
              <button 
                onClick={() => onRemove(item.id)}
                className="ml-2 text-red-600 hover:text-red-700"
                title="アイテムを削除する"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
          
          {item.estimatedPrice > 0 && (
            <span className="ml-3 text-gray-500 text-sm">
              ¥{(item.estimatedPrice * item.quantity).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default ShoppingList;
