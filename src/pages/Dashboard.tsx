import { AsyncBudgetChart as BudgetChart } from '../components/AsyncBudgetChart';
import { SpendCalendarHeatmap } from '../components/SpendCalendarHeatmap';
import { TimelineSlider } from '../components/TimelineSlider';
import SummaryCards from '../components/SummaryCards';
import AddTransactionForm from '../components/AddTransactionForm';
import TransactionList from '../components/TransactionList';
import CategoryManager from '../components/CategoryManager';

export default function Dashboard() {
    return (
        <>
            <SummaryCards />
            <BudgetChart theme="dark" />
            <AddTransactionForm />
            <TransactionList />
            <CategoryManager />
            <h2>Spending Heatmap</h2>
            <SpendCalendarHeatmap yearsBack={1} />
            <h2>Spending Over Time</h2>
            <TimelineSlider />
        </>
    )
}
