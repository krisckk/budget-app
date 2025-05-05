import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAll } from './features/transactions/transactionsSlice';
import { db } from './db';
import AddTransactionForm from './components/AddTransactionForm';
import TransactionList from './components/TransactionList';
import { AsyncBudgetChart as BudgetChart } from './components/AsyncBudgetChart';
import SummaryCards from './components/SummaryCards';
import CategoryManager from './components/CategoryManager';
import { SpendCalendarHeatmap } from './components/SpendCalendarHeatmap';
import { TimelineSlider } from './components/TimelineSlider';
import { defaultCategories } from './data/defaultCategories';
import { setAll as setCategories, addOne as addCategory } from './features/categories/categoriesSlice';
import { useGetRatesQuery } from './features/fxApi';
import './index.css';
import 'react-calendar-heatmap/dist/styles.css';

function FxDebug() {
  const { data, error, isLoading, isFetching } = useGetRatesQuery('USD');
  console.log({ data, error, isLoading, isFetching });

  if (isLoading || isFetching) {
    return <p>🔄 FX: loading…</p>;
  }
  if (error) {
    return <p style={{ color: 'var(--error)' }}>⚠️ FX error!</p>;
  }
  if (!data || !data.rates) {
    return <p>❓ FX: no data</p>;
  }

  return (
    <pre style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'pre-wrap' }}>
      ✅ FX rates loaded for USD: {Object.keys(data.rates).length} currencies
    </pre>
  );
}

export function App() {
  const dispatch = useDispatch();
  // 1. Theme state, default to stored or dark
  const [theme, setTheme] = useState<string>(() => 
    localStorage.getItem('theme') || 'dark'
  );
  // 2. Apply it to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  // 3. Load exisiting transactions
  useEffect(() => {
    db.transactions.toArray().then(arr => dispatch(setAll(arr)));
  }, [dispatch]);

  // Seed default categories if none exist
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
      <header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>My Budget</h1>
        <button onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>
      <SummaryCards />
      <BudgetChart theme={theme} />
      <CategoryManager />
      <AddTransactionForm />
      <TransactionList />
      <h2>Spending Heatmap</h2>
      <SpendCalendarHeatmap yearsBack={1} />

      <h2>Spending Over Time</h2>
      <TimelineSlider />
    </div>
  );
}
