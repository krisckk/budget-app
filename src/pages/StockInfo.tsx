import React, { useState } from "react";
import useSWR from 'swr';
import { fetcher } from './fetcher';

interface Quote {
    symbol: string;
    price: number ;
}

export default function StockInfo() {
    const [symbol, setSymbol] = useState('AAPL');
    const { data, error } = useSWR<Quote>(
        symbol ? `/api/quote?symbol=${symbol}` : null,
        fetcher
    );

    return (
        <div className="stock-page">
            <div className="stock-form">
                <input
                    type="text"
                    value={symbol}
                    onChange={e => setSymbol(e.target.value.toUpperCase())}
                    placeholder="Ticker (e.g. AAPL)"
                />
            </div>
            {error && <p className="error">Failed to load quote.</p>}
            {!data && symbol && <p>Loading…</p>}
            {data && (
                <div className="stock-quote">
                <h3>{data.symbol}</h3>
                <div className="price">${data.price.toFixed(2)}</div>
                </div>
            )}
        </div>
    )
}