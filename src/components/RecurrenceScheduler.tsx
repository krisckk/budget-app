// src/components/RecurrenceScheduler.tsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RRule, rrulestr } from 'rrule';
import { RootState } from '../store';
import { db } from '../db';
import { addOne as addTx } from '../features/transactions/transactionsSlice';
import { updateOne as updateRecurring } from '../features/recurring/recurringSlice';

export function RecurrenceScheduler() {
  const recs = useSelector((s: RootState) => s.recurring);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const today = new Date();
      for (let r of recs) {
        // build the rule
        const rule = rrulestr(`DTSTART:${r.startDate.replace(/-/g,'')}\nRRULE:${r.rule}`);
        // determine after lastRun or startDate
        const after = r.lastRun ? new Date(r.lastRun) : new Date(r.startDate);
        // get all occurrences up to today
        const dates = rule.between(after, today, true);
        for (let d of dates) {
          // skip if it equals lastRun exactly
          if (r.lastRun && d.getTime() === new Date(r.lastRun).getTime()) continue;
          // create tx
          const tx = {
            id: crypto.randomUUID(),
            description: r.description,
            amount: r.amount,
            date: d.toISOString().slice(0,10),
            category: r.category,
            type: r.type,
          };
          await db.transactions.add(tx);
          dispatch(addTx(tx));
        }
        // update lastRun to latest
        if (dates.length) {
          const latest = dates[dates.length-1].toISOString().slice(0,10);
          await db.recurring.update(r.id, { lastRun: latest });
          dispatch(updateRecurring({ ...r, lastRun: latest }));
        }
      }
    })();
  }, [recs, dispatch]);

  return null; // this component renders nothing
}
