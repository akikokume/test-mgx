import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/reducers/userReducer';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const { status, error: loginError } = useSelector(state => state.user);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    if (!email.includes('@')) {
      setError('有効なメールアドレスを入力してください');
      return;
    }
    
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }
    
    // Dispatch login action
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err) {
      setError('ログインに失敗しました。認証情報をご確認ください。');
    }
  };
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">ログイン</h2>
      
      {(error || loginError) && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error || loginError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
            メールアドレス
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="your-email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
            パスワード
          </label>
          <input
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              ログイン状態を保持する
            </label>
          </div>
          
          <div>
            <a href="#" className="text-sm text-green-600 hover:text-green-500">
              パスワードを忘れた場合
            </a>
          </div>
        </div>
        
        <button
          type="submit"
          className={`w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでない場合は{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-green-600 hover:text-green-500 font-medium"
          >
            新規登録
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
