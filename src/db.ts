import Dexie, { Table } from 'dexie';
import { Transaction } from './features/transactions/transactionsSlice';
import { Category } from './features/categories/categoriesSlice';
import { RecurringTransaction } from './features/recurring/recurringSlice';

export class BudgetDB extends Dexie {
  transactions!: Table<Transaction, string>;
  recurring!: Table<RecurringTransaction, string>;
  categories!: Table<Category, string>;

  constructor() {
    super('BudgetDB');
    this.version(3).stores({
      transactions: 'id, date, category, amount, type, currency, recurrence',
      categories:   'id, order',
      recurring:    'id, startDate, rule',
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
