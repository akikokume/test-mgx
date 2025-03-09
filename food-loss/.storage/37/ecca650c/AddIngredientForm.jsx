// src/components/Ingredients/AddIngredientForm.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addIngredient } from '../../store/reducers/ingredientReducer';

const AddIngredientForm = ({ onCancel }) => {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.ingredients);
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  
  // Calculate default expiry date (2 weeks from today)
  const getDefaultExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    quantity: 1,
    unit: '個',
    expiryDate: getDefaultExpiryDate(),
    storageLocation: 'fridge',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setFormError('食材名を入力してください');
      return;
    }
    
    if (formData.quantity <= 0) {
      setFormError('数量は0より大きい値を入力してください');
      return;
    }
    
    dispatch(addIngredient(formData));
    
    // Reset form
    setFormData({
      name: '',
      category: 'vegetables',
      quantity: 1,
      unit: '個',
      expiryDate: getDefaultExpiryDate(),
      storageLocation: 'fridge',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
    
    setFormError('');
    setFormOpen(false);
  };

  const toggleForm = () => {
    setFormOpen(!formOpen);
    if (!formOpen) {
      setFormError('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      {!formOpen ? (
        <button
          onClick={toggleForm}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          食材を追加
        </button>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">新しい食材を追加</h2>
            <button
              onClick={toggleForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
              {formError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  食材名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="例：玉ねぎ"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    数量
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0.1"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div className="w-1/2">
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    単位
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="個">個</option>
                    <option value="g">グラム (g)</option>
                    <option value="kg">キログラム (kg)</option>
                    <option value="ml">ミリリットル (ml)</option>
                    <option value="L">リットル (L)</option>
                    <option value="本">本</option>
                    <option value="袋">袋</option>
                    <option value="パック">パック</option>
                    <option value="束">束</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  消費期限
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="storageLocation" className="block text-sm font-medium text-gray-700 mb-1">
                  保存場所
                </label>
                <select
                  id="storageLocation"
                  name="storageLocation"
                  value={formData.storageLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  <option value="fridge">冷蔵庫</option>
                  <option value="freezer">冷凍庫</option>
                  <option value="pantry">パントリー</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                  購入日
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={toggleForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                追加
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddIngredientForm;
