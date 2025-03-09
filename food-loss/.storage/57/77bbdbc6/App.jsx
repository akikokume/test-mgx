import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import { checkAuthState } from './store/reducers/userReducer';

// Import pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import Ingredients from './pages/Ingredients';
import MealPlan from './pages/MealPlan';
import RecipeDetail from './pages/RecipeDetail';
import ShoppingList from './pages/ShoppingList';

// Import components
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

function App() {
  useEffect(() => {
    // Check if user is already logged in
    store.dispatch(checkAuthState());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow bg-gray-50">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/ingredients" element={<Ingredients />} />
              <Route path="/meal-plan" element={<MealPlan />} />
              <Route path="/recipe/:recipeId" element={<RecipeDetail />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
