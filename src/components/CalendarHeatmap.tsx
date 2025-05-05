import React, { useMemo } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import type { TooltipDataAttrs } from 'react-calendar-heatmap';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { format, subDays } from 'date-fns';
import 'react-calendar-heatmap/dist/styles.css';

export default function DailyHeatmap() {
  const transactions = useSelector((s: RootState) => s.transactions.list);

  const values = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach(t => {
      const day = t.date; // 'YYYY-MM-DD'
      map[day] = (map[day] || 0) + Math.abs(t.amount);
    });
    return Object.entries(map).map(([date, count]) => ({
      date,
      count,
    }));
  }, [transactions]);

  const endDate = new Date();
  const startDate = subDays(endDate, 365);

  return (
    <div style={{ maxWidth: '100%', margin: '1rem auto' }}>
      <h3>Spending Over the Past Year</h3>
      <CalendarHeatmap
        startDate={format(startDate, 'yyyy-MM-dd')}
        endDate={format(endDate, 'yyyy-MM-dd')}
        values={values}
        classForValue={value =>
          !value || value.count === 0
            ? 'color-empty'
            : value.count < 50
            ? 'color-scale-1'
            : value.count < 200
            ? 'color-scale-2'
            : 'color-scale-3'
        }
        tooltipDataAttrs={(
          value
        ): TooltipDataAttrs => ({
            'data-tip': value
              ? `${value.date}: \$${value.count.toFixed(2)}`
              : `${value.date}: $0.00`,
          } as TooltipDataAttrs)}
        showWeekdayLabels
      />
    </div>
  );
}