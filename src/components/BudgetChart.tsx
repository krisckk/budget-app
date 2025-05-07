import { useSelector } from 'react-redux';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { RootState } from '../store';
import { useGetRatesQuery } from '../features/fxApi';

// type Props = { theme: string };

export default function BudgetChart({ theme }: { theme: string }) {
    const transactions = useSelector((s: RootState) => s.transactions.list);
    const categories   = useSelector((s: RootState) => s.categories.list);

    const baseCurrency = 'TWD';  
    const { data, isLoading } = useGetRatesQuery(baseCurrency);
    const rates = data?.rates ?? {};

    if (isLoading) {
        return <p style={{ color: theme === 'dark'?'#e0e0e0':'#333', textAlign:'center'  }}>Loading rates…</p>;
    }

    console.log('Rates:', rates);
    const convert = (t: { amount: number; currency: string }) =>
        t.amount * (rates[t.currency] ?? 1);

    const buildTotals = (type: 'income' | 'expense') => {
        return transactions
        .filter(t => t.type === type)
        .reduce<Record<string, number>>((acc, t) => {
            const amtBase = Math.abs(convert(t));
            acc[t.category] = (acc[t.category] || 0) + amtBase;
            return acc;
        }, {});
    };

    const incomeTotals  = buildTotals('income');
    const expenseTotals = buildTotals('expense');

    const categoryColors: Record<string, string> = Object.fromEntries(
        categories.map(c => [c.name, c.color])
    );

    const makeData = (totals: Record<string, number>) => {
        const labels = Object.keys(totals);
        const data = labels.map(l => totals[l]);
        const backgroundColor = labels.map(l => categoryColors[l] || '#888');
        return { labels, datasets: [{ data, backgroundColor }] };
    };

    const incomeData = makeData(incomeTotals);
    const expenseData = makeData(expenseTotals);

    const textColor = theme === 'dark' ? '#e0e0e0' : '#333333';
    const bgColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
    const borderclr = theme === 'dark' ? '#272727' : '#e0e0e0';

    interface ChartOptions {
        responsive: boolean;
        animation: {
            animateScale: boolean;
        };
        plugins: {
            legend: {
                position: 'bottom';
                labels: {
                    color: string;
                    boxWidth: number;
                    padding: number;
                };
            };
            tooltip: {
                bodyColor: string;
                titleColor: string;
                backgroundColor: string;
                borderColor: string;
                borderWidth: number;
                callbacks: {
                    label: (ctx: { label: string; parsed: number }) => string;
                };
            };
        };
    }

    const options: ChartOptions = {
        responsive: true,
        animation: {
            animateScale: true,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: textColor, boxWidth: 12, padding: 8 },
            },
            tooltip: {
                bodyColor: textColor,
                titleColor: textColor,
                backgroundColor: bgColor,
                borderColor: borderclr,
                borderWidth: 1,
                callbacks: {
                    label: (ctx) =>
                        `${ctx.label}: ${ctx.parsed} ${baseCurrency}`,
                },
            },
        },
    };

    const enhanceDataset = (data: any) => ({
        ...data,
        datasets: data.datasets.map((ds: any) => ({
            ...ds,
            borderclr,
            borderWidth: 2,
            hoverOffset: 20,
            hoverBorderColor: '#fff',
            hoverBorderWidth: 4,
        })),
    });

    return (
        <div className='charts-container'>
            <div className='chart-warp' style={{ flex: '1 1 300px', maxWidth: 400 }}>
                <h3 style={{ textAlign: 'center', color: textColor }}>
                Income by Category
                </h3>
                <Pie data={enhanceDataset(incomeData)} options={options} />
            </div>
            <div className='chart-wrap' style={{ flex: '1 1 300px', maxWidth: 400 }}>
                <h3 style={{ textAlign: 'center', color: textColor }}>
                Expense by Category
                </h3>
                <Pie data={enhanceDataset(expenseData)} options={options} />
            </div>
        </div>
    );
}
