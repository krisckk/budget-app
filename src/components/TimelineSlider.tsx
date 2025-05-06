import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

export const TimelineSlider: React.FC = () => {
  const transactions = useSelector((s: RootState) => s.transactions.list);

  const data = useMemo(() => {
    const daily: Record<string, number> = {};
    transactions.forEach(t => {
      const day = t.date;
      daily[day] = (daily[day] || 0) + t.amount;
    });
    return Object.entries(daily)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }, [transactions]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
           dataKey="date"
           tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
        />
        <YAxis
           tick={{ fill: 'var(--text-secondary)' }}
        />
        <Tooltip
            contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--text-secondary)',
                boxShadow: '0 2px 4px var(--shadow)',
                padding: '0.75rem 1rem', 
                borderRadius: '6px', 
                minWidth: '5rem', 
            }}
            labelStyle={{
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                marginBottom: '0.5rem',
            }}
            itemStyle={{
                color: 'var(--text-primary)',
                fontSize: '1rem',
                padding: '0.25rem 0',
            }}
            cursor={{ stroke: 'var(--primary)', strokeWidth: 2 }}
        />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" dot={false} />
        <Brush 
            dataKey="date"
            height={30} 
            stroke="var(--text-secondary)"
            travellerWidth={10}
            fill='var(-surface)'
            tickFormatter={(date) => date} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
};