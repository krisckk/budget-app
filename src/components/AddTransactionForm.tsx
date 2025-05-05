import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addOne } from '../features/transactions/transactionsSlice';
import { db } from '../db';
import { RootState } from '../store';
import * as Icons from 'react-icons/fa';

type TxType = 'income' | 'expense';

function SingleForm({ type }: { type: TxType }) {
  const dispatch = useDispatch();
  const [desc, setDesc]   = useState('');
  const [amt,   setAmt]    = useState('');
  const [cat,   setCat]    = useState('');
  const [date,  setDate]   = useState(new Date().toISOString().slice(0,10));
  const [currency, setCurrency] = useState('TWD');

  const categories = useSelector((s: RootState) => s.categories.list);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amt);
    if (isNaN(amountNum)) {
      alert('Enter a valid number');
      return;
    }
    const signed = type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum);
    const tx = {
      id: crypto.randomUUID(),
      description: desc.trim(),
      amount: signed,
      date,
      category: cat.trim(),
      type,
      currency
    };
    await db.transactions.add(tx);
    dispatch(addOne(tx));
    setDesc(''); 
    setAmt(''); 
    setCat('');
    setDate(new Date().toISOString().slice(0,10));
  };

  return (
    <form onSubmit={onSubmit} className="add-form">
        <h4 className={type}>{type === 'income' ? '＋ Income' : '－ Expense'}</h4>
        <input
            type="text"
            required
            placeholder="Description"
            value={desc}
            onChange={e => setDesc(e.target.value)}
        />
        <input
            type="number"
            required
            placeholder="Amount"
            value={amt}
            onChange={e => setAmt(e.target.value)}
        />
        <div className="category-selector">
            {categories.map(c => {
            const Icon = (Icons as any)[c.icon];
            const selected = c.name === cat;
            return (
                <button
                key={c.id}
                type="button"
                className={`category-chip${selected ? ' selected' : ''}`}
                style={{
                    borderColor: selected ? c.color : 'var(--text-secondary)',
                    background: selected ? c.color : 'var(--surface)',
                    color: selected ? 'var(--on-primary)' : c.color
                }}
                onClick={() => setCat(c.name)}
                >
                  {Icon && <Icon />}
                  <span>{c.name}</span>
                </button>
            );
            })}
        </div>
        <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
        />
        <div className="currency-select">
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            required
          >
            {['USD','EUR','JPY','GBP','AUD','CAD'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button type="submit">Add</button>
    </form>
  );
}

export default function AddTransactionForm() {
  return (
    <div className="form-columns">
      <SingleForm type="income" />
      <SingleForm type="expense" />
    </div>
  );
}
