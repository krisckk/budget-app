import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

interface CategoriesState { list: Category[] }
const initialState: CategoriesState = { list: [] };

const slice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setAll(state, action: PayloadAction<Category[]>) {
      state.list = action.payload.sort((a,b)=>a.order-b.order);
    },
    addOne(state, action: PayloadAction<Category>) {
      state.list.push(action.payload);
      state.list.sort((a,b)=>a.order-b.order);
    },
    updateOne(state, action: PayloadAction<Category>) {
      const idx = state.list.findIndex(c=>c.id===action.payload.id);
      if (idx>=0) state.list[idx] = action.payload;
      state.list.sort((a,b)=>a.order-b.order);
    },
    removeOne(state, action: PayloadAction<string>) {
      state.list = state.list.filter(c=>c.id!==action.payload);
    },
    reorder(state, action: PayloadAction<Category[]>) {
      // payload is the new ordered array
      state.list = action.payload.map((c,i)=>({ ...c, order: i }));
    }
  }
});

export const { setAll, addOne, updateOne, removeOne, reorder } = slice.actions;
export default slice.reducer;
