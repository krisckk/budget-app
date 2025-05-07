import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addOne as addTransaction, Transaction } from '../features/transactions/transactionsSlice';
import { addOne as addRecurring, RecurringTransaction } from '../features/recurring/recurringSlice';
import { RootState } from '../store';
import { db } from '../db';
import * as Icons from 'react-icons/fa';
import { RRule, Frequency } from 'rrule';
import { FormEvent } from 'react';

type TxType = 'income' | 'expense';

function SingleForm({ type }: { type: TxType }) {
  const dispatch = useDispatch();
  const categories = useSelector((s: RootState) => s.categories.list);

  const [desc, setDesc] = useState('');
  const [amt, setAmt] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [cat, setCat] = useState(categories[0]?.name || '');
  const [currency, setCurrency] = useState('TWD');

  const [isRecurring, setIsRecurring] = useState(false);
  const [freq, setFreq] = useState<Frequency>(RRule.MONTHLY);
  const [interval, setInterval] = useState(1);

  const reset = () => {
    setDesc('');
    setAmt('');
    setDate(new Date().toISOString().slice(0,10));
    setCat(categories[0]?.name || '');
    setCurrency('TWD');
    setIsRecurring(false);
    setFreq(RRule.MONTHLY);
    setInterval(1);
  };

  const buildRuleString = () => {
    return new RRule({
      freq,
      interval,
      dtstart: new Date(date + 'T00:00:00')
    }).toString();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amt);
    if (isNaN(amountNum)) return alert('Enter a valid amount');

    if (isRecurring) {
      const rec: RecurringTransaction = {
        id: crypto.randomUUID(),
        description: desc.trim(),
        amount: type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum),
        category: cat,
        type,
        currency,
        startDate: date,
        rule: buildRuleString(),
        lastRun: undefined
      };
      await db.recurring.add(rec);
      dispatch(addRecurring(rec));
    } 
    else {
      const tx: Transaction = {
        id: crypto.randomUUID(),
        description: desc.trim(),
        amount: type === 'expense' ? -Math.abs(amountNum) : Math.abs(amountNum),
        date,
        category: cat,
        type,
        currency
      };
      await db.transactions.add(tx);
      dispatch(addTransaction(tx));
    }
    reset();
  };

  return (
    <form onSubmit={onSubmit} className="add-form">
      <h4 className={type}>{type === 'income' ? '＋ Income' : '－ Expense'}</h4>
      <input
        type="text"
        placeholder="Description"
        value={desc}
        onChange={e => setDesc(e.target.value)}
        required
      />
      <div className="amount-control">
        <input
          type="text"
          placeholder="Amount"
          value={amt}
          onChange={e => setAmt(e.target.value.replace(/[^0-9.]/g, ''))}
          className="amount-input"
          required
        />
        <div className="amount-spin">
          <button type="button" className="spin-up" onClick={() => setAmt(prev => (Number(prev||0)+1).toString())} aria-label="Increase">▲</button>
          <button type="button" className="spin-down" onClick={() => setAmt(prev => Math.max(0,Number(prev||0)-1).toString())} aria-label="Decrease">▼</button>
        </div>
      </div>
      <div className="category-selector">
        {categories.map(c => {
          const Icon = (Icons as any)[c.icon];
          const sel = c.name === cat;
          return (
            <button
              key={c.id}
              type="button"
              className={`category-chip${sel ? ' selected' : ''}`}
              style={{
                borderColor: sel ? c.color : 'var(--text-secondary)',
                background: sel ? c.color : 'var(--surface)',
                color: sel ? 'var(--on-primary)' : c.color
              }}
              onClick={() => setCat(c.name)}
            >
              {Icon && <Icon />}
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
      <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      <div className="currency-select">
        <select value={currency} onChange={e => setCurrency(e.target.value)}>
          {['TWD','USD','EUR','JPY','GBP','AUD','CAD'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className='recurring-toggle form-row'>
        <label htmlFor='recurring-checkbox'>
          <input 
            id='recurring-checkbox'
            type="checkbox"
            checked={isRecurring}
            onChange={e => setIsRecurring(e.target.checked)}
            className='toggle-input'
          />
          <span className='toggle-label'>Recurring</span>
        </label>
      </div>
      {isRecurring && (
        <div className="recurrence-options form-row">
          <div className='form-group'>
            <label htmlFor="freq-select">Frequency</label>
            <select 
              id='freq-select'
              value={freq} 
              onChange={e => setFreq(Number(e.target.value) as Frequency)}
              className='input-select'
            >
              <option value={RRule.DAILY}>Daily</option>
              <option value={RRule.WEEKLY}>Weekly</option>
              <option value={RRule.MONTHLY}>Monthly</option>
            </select>
          </div>
          <div className='form-group'>
            <label htmlFor='interval-input'>Interval</label>
            <input 
              id='interval-input'
              type='number'
              min={1}
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value) || 1)}
              className='input-text'
            />
          </div>
        </div>
      )}
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
