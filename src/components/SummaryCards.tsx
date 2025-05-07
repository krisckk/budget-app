import { useSelector } from "react-redux";
import { RootState } from "../store";
import { FaArrowUp, FaArrowDown, FaDollarSign } from "react-icons/fa";
import { useGetRatesQuery } from "../features/fxApi";

export default function SummaryCards() {
    const tx = useSelector((s: RootState) => s.transactions.list);
    const base = "TWD";
    const { data, isLoading } = useGetRatesQuery(base);
    const rates = data?.rates ?? {};

    if(isLoading){
        console.log('Loading rates...')
        return <p style={{color: 'var(--text-primary)', textAlign: 'center'}}>Loading rates...</p>
    }

    const convert = (t: any) => 
        t.amount * (rates[t.currency] ?? 1);

    // Sum by type
    const income = tx
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(convert(t)), 0);
    const expense = tx
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(convert(t)), 0);

    const balance = income - expense;

    return (
        <div className="card-grid">
        <div className="summary-card income">
            <div className="icon"><FaArrowUp /></div>
            <div className="label">Income</div>
            <div className="value">${income.toFixed(2)}</div>
        </div>
        <div className="summary-card expense">
            <div className="icon"><FaArrowDown /></div>
            <div className="label">Expense</div>
            <div className="value">-${expense.toFixed(2)}</div>
        </div>
        <div className="summary-card balance">
            <div className="icon"><FaDollarSign /></div>
            <div className="label">Balance</div>
            <div className="value">${balance.toFixed(2)}</div>
        </div>
        </div>
    );
};