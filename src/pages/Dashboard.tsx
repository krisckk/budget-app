import React from "react";
import SummaryCards from '../components/SummaryCards';
import { AsyncBudgetChart as BudgetChart } from '../components/AsyncBudgetChart';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionList from '../components/TransactionList';
import { SpendCalendarHeatmap } from '../components/SpendCalendarHeatmap';
import { TimelineSlider } from '../components/TimelineSlider';
import CategoryManager from '../components/CategoryManager';
import { RecurringManager } from "../components/RecurringManager";

export default function Dashboard() {
    return (
        <>
            <SummaryCards />
            <BudgetChart theme="dark" />
            <AddTransactionForm />
            <section style={{ marginTop: '2rem' }}>
                <h2>Setup Recurring Transactions</h2>
                <RecurringManager />
            </section>
            <TransactionList />
            <CategoryManager />
            <h2>Spending Heatmap</h2>
            <SpendCalendarHeatmap yearsBack={1} />
            <h2>Spending Over Time</h2>
            <TimelineSlider />
        </>
    )
}
