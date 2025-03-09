import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/reducers/userReducer';

const Header = () => {
  const { current: user } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <header className="bg-green-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">食材ロス削減献立アプリ</Link>
          </div>
          
          <nav className="hidden md:flex space-x-4">
            <Link to="/" className="px-3 py-2 hover:bg-green-700 rounded transition-colors">
              ホーム
            </Link>
            <Link to="/ingredients" className="px-3 py-2 hover:bg-green-700 rounded transition-colors">
              食材管理
            </Link>
            <Link to="/meal-plan" className="px-3 py-2 hover:bg-green-700 rounded transition-colors">
              献立計画
            </Link>
            <Link to="/shopping-list" className="px-3 py-2 hover:bg-green-700 rounded transition-colors">
              買い物リスト
            </Link>
          </nav>
          
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="hidden md:inline">{user.name}</span>
                <button 
                  onClick={handleLogout}
                  className="px-3 py-1 bg-white text-green-600 rounded-full hover:bg-green-100 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <Link 
                to="/auth" 
                className="px-3 py-1 bg-white text-green-600 rounded-full hover:bg-green-100 transition-colors"
              >
                ログイン
              </Link>
            )}
            
            {/* Mobile menu button */}
            <button className="ml-4 md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu (hidden by default) */}
        <div className="md:hidden hidden">
          <div className="py-2 space-y-2">
            <Link to="/" className="block px-3 py-2 hover:bg-green-700 rounded transition-colors">
              ホーム
            </Link>
            <Link to="/ingredients" className="block px-3 py-2 hover:bg-green-700 rounded transition-colors">
              食材管理
            </Link>
            <Link to="/meal-plan" className="block px-3 py-2 hover:bg-green-700 rounded transition-colors">
              献立計画
            </Link>
            <Link to="/shopping-list" className="block px-3 py-2 hover:bg-green-700 rounded transition-colors">
              買い物リスト
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
