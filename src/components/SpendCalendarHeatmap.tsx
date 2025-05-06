import React, { useEffect, useState } from 'react';
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { subYears, parseISO } from 'date-fns';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css'; // ensure tooltip styles

interface HeatmapValue { date: string; count: number; }
interface LegendItem { label: string; colorClass: string; }
interface Props { yearsBack?: number; }

export const SpendCalendarHeatmap: React.FC<Props> = ({ yearsBack = 1 }) => {
    const transactions = useSelector((s: RootState) => s.transactions.list);
    const [values, setValues] = useState<HeatmapValue[]>([]);
    const [threshold, setThreshold] = useState<number>(300);

    useEffect(() => {
        const startDate = subYears(new Date(), yearsBack);
        const daily: Record<string, number> = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const day = t.date; // YYYY-MM-DD
                const amt = Math.abs(t.amount);
                daily[day] = (daily[day] || 0) + amt;
        });
        const data = Object.entries(daily)
            .map(([date, count]) => ({ date, count }))
            .filter(v => parseISO(v.date) >= startDate);
        setValues(data);
    }, [transactions, yearsBack]);

    const legend: LegendItem[] = [
        { label: 'No spend',       colorClass: 'color-empty' },
        { label: '< $50',          colorClass: 'color-github-1' },
        { label: '$50–100',        colorClass: 'color-github-2' },
        { label: '$100–200',       colorClass: 'color-github-3' },
        { label: '> $200',         colorClass: 'color-github-4' },
        { label: '> Threshold',    colorClass: 'color-threshold' },
    ];

    const classForValue = (value?: ReactCalendarHeatmapValue) => {
        const count = value?.count ?? 0;
        if (count > threshold) return 'color-threshold';
        if (count <= 0)        return 'color-empty';
        if (count < 50)        return 'color-github-1';
        if (count < 100)       return 'color-github-2';
        if (count < 200)       return 'color-github-3';
                                return 'color-github-4';
    };

    const handleThresholdChange = (val: number) => {
        setThreshold(val < 300 ? 300 : val);
    }

    return (
        <div className="heatmap-container">
        <div className="heatmap-controls">
            <label htmlFor="threshold-input">Budget Threshold: $</label>
            <div className="threshold-control">
                <input
                    id="threshold-input"
                    type="text"
                    value={threshold}
                    onChange={e =>  handleThresholdChange(Number(e.target.value))}
                    className="threshold-input"
                    min={300}
                />
                <div className="spin-buttons">
                    <button
                        type="button"
                        className="spin-up"
                        onClick={() => setThreshold(t => t + 10)}
                        aria-label="Increase threshold"
                    >
                        ▲
                    </button>
                    <button
                        type="button"
                        className="spin-down"
                        onClick={() => setThreshold(t => Math.max(0, t - 10))}
                        aria-label="Decrease threshold"
                    >
                        ▼
                    </button>
                </div>
            </div>
        </div>

        <div className="heatmap-legend">
            {legend.map((item, idx) => (
            <div key={idx} className="legend-item">
                <span className={`legend-color ${item.colorClass}`}></span>
                <span className="legend-label">{item.label}</span>
            </div>
            ))}
        </div>

        <div className="heatmap-wrapper">
            <CalendarHeatmap
            startDate={subYears(new Date(), yearsBack)}
            endDate={new Date()}
            values={values}
            gutterSize={2}
            showMonthLabels={true}
            showWeekdayLabels={false}
            classForValue={classForValue}
            transformDayElement={(element, value) =>
                React.cloneElement(element, {
                rx: 3,
                ry: 3,
                style: { width: 16, height: 16 },
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': value
                    ? `${value.date}: ${value.count}`
                    : 'No data',
                })
            }
            />
            <Tooltip id="heatmap-tooltip" place="top" />
        </div>
        </div>
    );
};