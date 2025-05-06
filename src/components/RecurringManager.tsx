// src/components/RecurringManager.tsx
import React, { useEffect, useState } from 'react';
import { RRule, rrulestr } from 'rrule';
import { v4 as uuid } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { db } from '../db';
import {
  setAll,
  addOne,
  updateOne,
  removeOne,
  RecurringTransaction,
} from '../features/recurring/recurringSlice';

export function RecurringManager() {
  const recs = useSelector((s: RootState) => s.recurring);
  const dispatch = useDispatch();

  // Load from DB
  useEffect(() => {
    db.recurring.toArray().then(arr => dispatch(setAll(arr)));
  }, [dispatch]);

  // Form state
  const [desc, setDesc]       = useState('');
  const [amt, setAmt]         = useState('');
  const [cat, setCat]         = useState('');
  const [type, setType]       = useState<'income'|'expense'>('expense');
  const [startDate, setStart] = useState(new Date().toISOString().slice(0,10));
  const [rule, setRule]       = useState('FREQ=MONTHLY;BYMONTHDAY=1');
  const [editId, setEditId]   = useState<string|null>(null);

  const reset = () => {
    setDesc(''); setAmt(''); setCat(''); setType('expense');
    setStart(new Date().toISOString().slice(0,10));
    setRule('FREQ=MONTHLY;BYMONTHDAY=1');
    setEditId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tx: RecurringTransaction = {
      id: editId||uuid(),
      description: desc.trim(),
      amount: type==='expense' ? -Math.abs(Number(amt)) : Math.abs(Number(amt)),
      category: cat,
      type,
      startDate,
      rule,
      lastRun: undefined,
    };
    if(editId) {
      await db.recurring.put(tx);
      dispatch(updateOne(tx));
    } else {
      await db.recurring.add(tx);
      dispatch(addOne(tx));
    }
    reset();
  };

  return (
    <div className="recurring-manager">
      <h2>Recurring Transactions</h2>
      <form onSubmit={onSubmit} className="form-columns">
        <input required placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
        <input required placeholder="Amount" value={amt} onChange={e=>setAmt(e.target.value)} />
        <input required type="date" value={startDate} onChange={e=>setStart(e.target.value)} />
        <select value={type} onChange={e=>setType(e.target.value as any)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input required placeholder="Category" value={cat} onChange={e=>setCat(e.target.value)} />
        <input required placeholder="RRULE (e.g. FREQ=WEEKLY;BYDAY=MO)" value={rule} onChange={e=>setRule(e.target.value)} />
        <button type="submit">{editId?'Save':'Add'}</button>
        {editId && <button type="button" onClick={reset}>Cancel</button>}
      </form>
      <ul>
        {recs.map(r => (
          <li key={r.id}>
            {r.description} {r.amount} every <code>{r.rule}</code>
            <button onClick={()=>{setEditId(r.id); setDesc(r.description); setAmt(String(r.amount)); setCat(r.category); setType(r.type); setStart(r.startDate); setRule(r.rule);}}>✎</button>
            <button onClick={async ()=>{ await db.recurring.delete(r.id); dispatch(removeOne(r.id)); }}>🗑️</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
