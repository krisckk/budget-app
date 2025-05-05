import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  currency: string;
}

interface TransactionsState { list: Transaction[]; }
const initialState: TransactionsState = { list: [] };

const slice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Transaction[]>) {
      state.list = action.payload;
    },
    addOne(state, action: PayloadAction<Transaction>) {
      state.list.push(action.payload);
    },
    removeOne(state, action: PayloadAction<string>) {
      state.list = state.list.filter(t => t.id !== action.payload);
    }
  }
});

export const { setAll, addOne, removeOne } = slice.actions;
export default slice.reducer;
