import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { removeOne } from '../features/transactions/transactionsSlice';
import { db } from '../db';
import  * as Icons from 'react-icons/fa';

export default function TransactionList() {
    const allTx = useSelector((s: RootState) => s.transactions.list);
    const categories = useSelector((s: RootState) => s.categories.list);
    const dispatch = useDispatch();
  
    // New: filter state
    const [viewType, setViewType] = useState<'all' | 'income' | 'expense'>('all');
  
    // Filtered list
    const filtered = allTx.filter(tx =>
      viewType === 'all' ? true : tx.type === viewType
    );
  
    const onDelete = async (id: string) => {
      await db.transactions.delete(id);
      dispatch(removeOne(id));
    };
  
    return (
      <div>
        {/* Filter control */}
        <div className="filter-bar">
          <label>
            Show:&nbsp;
            <select
              value={viewType}
              onChange={e => setViewType(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
        </div>
  
        {/* Transaction list */}
        <ul>
            {filtered.length === 0 && (
                <li className="empty">No {viewType} transactions.</li>
            )}
              {filtered.map(t => {
                  // find that category’s metadata
                  const cat = categories.find(c => c.name === t.category);
                  const Icon = cat ? (Icons as any)[cat.icon] : null;
                  return (
                    <li key={t.id}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {Icon && <Icon style={{ color: cat?.color }} />}
                            {t.date} · {t.category} · ${Math.abs(t.amount).toFixed(2)} · {t.type} · {t.description} · {t.currency}
                        </span>
                        <button onClick={()=>onDelete(t.id)}>✕</button>
                    </li>
                  );
              })}
        </ul>
      </div>
    );
  
}
