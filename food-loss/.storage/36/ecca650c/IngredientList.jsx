// src/components/Ingredients/IngredientList.jsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteIngredient, updateIngredient } from '../../store/reducers/ingredientReducer';
import { calculateExpiryScore } from '../../utils/wastageReductionAlgorithm';

const IngredientList = () => {
  const { availableIngredients, categories } = useSelector(state => state.ingredients);
  const dispatch = useDispatch();
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('expiryDate');

  // Filter ingredients by category
  const filteredIngredients = categoryFilter === 'all'
    ? availableIngredients
    : availableIngredients.filter(ing => ing.category === categoryFilter);

  // Sort ingredients
  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    if (sortBy === 'expiryDate') {
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'quantity') {
      return a.quantity - b.quantity;
    }
    return 0;
  });

  const handleEdit = (ingredient) => {
    setEditingIngredient({...ingredient});
  };

  const handleSave = () => {
    if (editingIngredient) {
      dispatch(updateIngredient(editingIngredient));
      setEditingIngredient(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('この食材を削除してもよろしいですか？')) {
      dispatch(deleteIngredient(id));
    }
  };

  const handleCancel = () => {
    setEditingIngredient(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingIngredient({
      ...editingIngredient,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value,
    });
  };

  // Get expiry status color
  const getExpiryStatusColor = (ingredient) => {
    const expiryScore = calculateExpiryScore(ingredient);
    if (expiryScore >= 7) return 'bg-red-100 border-red-300';
    if (expiryScore >= 5) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  // Calculate days until expiry
  const daysUntilExpiry = (expiryDate) => {
    const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">冷蔵庫の食材</h2>
        <div className="flex space-x-4">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリで絞り込み
            </label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="all">すべて</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              並び替え
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            >
              <option value="expiryDate">消費期限順</option>
              <option value="name">名前順</option>
              <option value="quantity">量順</option>
            </select>
          </div>
        </div>
      </div>

      {sortedIngredients.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-gray-500">登録されている食材はありません</p>
          <p className="text-sm text-gray-400 mt-1">食材を追加するには「食材を追加」をクリックしてください</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  食材
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  カテゴリ
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  数量
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  消費期限
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  保存場所
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedIngredients.map((ingredient) => (
                <tr key={ingredient.id}>
                  {editingIngredient && editingIngredient.id === ingredient.id ? (
                    // Edit mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          name="name"
                          value={editingIngredient.name}
                          onChange={handleChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="category"
                          value={editingIngredient.category}
                          onChange={handleChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="number"
                            name="quantity"
                            value={editingIngredient.quantity}
                            onChange={handleChange}
                            className="w-16 p-1 border border-gray-300 rounded"
                            min="0"
                            step="0.1"
                          />
                          <span className="ml-2">{editingIngredient.unit}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="date"
                          name="expiryDate"
                          value={editingIngredient.expiryDate}
                          onChange={handleChange}
                          className="p-1 border border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          name="storageLocation"
                          value={editingIngredient.storageLocation}
                          onChange={handleChange}
                          className="w-full p-1 border border-gray-300 rounded"
                        >
                          <option value="fridge">冷蔵庫</option>
                          <option value="freezer">冷凍庫</option>
                          <option value="pantry">パントリー</option>
                          <option value="other">その他</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded text-sm"
                          >
                            キャンセル
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{ingredient.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {categories.find(c => c.id === ingredient.category)?.name || ingredient.category}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ingredient.quantity} {ingredient.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm px-2 py-1 rounded border ${getExpiryStatusColor(ingredient)}`}>
                          {ingredient.expiryDate}
                          <span className="ml-2 text-xs">
                            {daysUntilExpiry(ingredient.expiryDate) <= 0
                              ? '(期限切れ)'
                              : `(あと${daysUntilExpiry(ingredient.expiryDate)}日)`}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {ingredient.storageLocation === 'fridge' && '冷蔵庫'}
                          {ingredient.storageLocation === 'freezer' && '冷凍庫'}
                          {ingredient.storageLocation === 'pantry' && 'パントリー'}
                          {ingredient.storageLocation === 'other' && 'その他'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(ingredient)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                          >
                            編集
                          </button>
                          <button
                            onClick={() => handleDelete(ingredient.id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IngredientList;
