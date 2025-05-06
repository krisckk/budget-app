import Dexie, { Table } from 'dexie';
import { Transaction } from './features/transactions/transactionsSlice';
import { Category } from './features/categories/categoriesSlice';

export class BudgetDB extends Dexie {
  transactions!: Table<Transaction, string>;
  categories!: Table<Category, string>;

  constructor() {
    super('BudgetDB');
    this.version(3).stores({
      transactions: 'id, date, category, amount, type, currency, recurrence',
      categories:   'id, order'
    });
  }
}

declare global {
  interface Window { __budgetDB?: BudgetDB }
}
if (!window.__budgetDB) {
  window.__budgetDB = new BudgetDB();
}
export const db = window.__budgetDB!;
