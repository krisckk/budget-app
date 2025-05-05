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
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" dot={false} />
        <Brush dataKey="date" height={30} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};