import { configureStore } from '@reduxjs/toolkit';
import transactionsReducer from './features/transactions/transactionsSlice';
import categoriesReducer  from './features/categories/categoriesSlice';
import recurringReducer  from './features/recurring/recurringSlice';
import { fxApi } from './features/fxApi';

export const store = configureStore({
  reducer: { 
    transactions: transactionsReducer, 
    categories:   categoriesReducer,
    recurring:    recurringReducer,
    [fxApi.reducerPath]: fxApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(fxApi.middleware),
  devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
