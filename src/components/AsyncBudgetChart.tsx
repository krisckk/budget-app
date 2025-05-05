import React, { Suspense } from 'react';

const BudgetChart = React.lazy(() => import('./BudgetChart'));

export function AsyncBudgetChart(props: { theme: string }) {
  return (
    <Suspense fallback={<div style={{textAlign:'center'}}>Loading charts…</div>}>
      <BudgetChart {...props} />
    </Suspense>
  );
}