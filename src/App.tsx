import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAll } from './features/transactions/transactionsSlice';
import { db } from './db';
import AddTransactionForm from './components/AddTransactionForm';
import TransactionList from './components/TransactionList';
import { AsyncBudgetChart as BudgetChart } from './components/AsyncBudgetChart';
import SummaryCards from './components/SummaryCards';
import CategoryManager from './components/CategoryManager';
import { RecurrenceScheduler } from './components/RecurrenceScheduler';
import { RecurringManager } from './components/RecurringManager';
import { SpendCalendarHeatmap } from './components/SpendCalendarHeatmap';
import { TimelineSlider } from './components/TimelineSlider';
import { defaultCategories } from './data/defaultCategories';
import { setAll as setCategories, addOne as addCategory } from './features/categories/categoriesSlice';
import Dashboard from './pages/Dashboard';
import './index.css';
import 'react-calendar-heatmap/dist/styles.css';
import { parseISO } from 'date-fns';

export function App() {
  const dispatch = useDispatch();
  
  const [theme, setTheme] = useState<string>(() => 
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => {
    db.transactions.toArray().then(arr => dispatch(setAll(arr)));
  }, [dispatch]);

  
  useEffect(() => {
    db.categories.count().then(count => {
      if (count === 0) {
        defaultCategories.forEach((c, i) => {
          const cat = {
            id: crypto.randomUUID(),
            name: c.name,
            icon: c.icon,
            color: c.color,
            order: i
          };
          db.categories.add(cat);
          dispatch(addCategory(cat));
        });
      }
    });
  }, [dispatch]);

  const toggleTheme = () =>
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <div className="container">
      <RecurrenceScheduler />
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <nav className="top-nav">
          <NavLink to="/" end className="nav-button">
            Dashboard
          </NavLink>
          
        </nav>
        <h1>My Budget App</h1>
        <button onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
