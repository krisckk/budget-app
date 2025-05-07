import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income'|'expense';
  startDate: string;
  rule: string;
  lastRun?: string;
  currency?: string;
}

const slice = createSlice({
  name: 'recurring',
  initialState: [] as RecurringTransaction[],
  reducers: {
    setAll: (_s, a: PayloadAction<RecurringTransaction[]>) => a.payload,
    addOne: (s, a: PayloadAction<RecurringTransaction>) => {
      s.push(a.payload);
    },
    updateOne: (s, a: PayloadAction<RecurringTransaction>) => {
      const idx = s.findIndex(r=>r.id===a.payload.id);
      if(idx>=0) s[idx]=a.payload;
    },
    removeOne: (s, a: PayloadAction<string>) => {
      return s.filter(r=>r.id!==a.payload);
    },
  },
});

export const { setAll, addOne, updateOne, removeOne } = slice.actions;
export default slice.reducer;
