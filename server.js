import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import e from 'express';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/quote', async (req, res) => {
    const symbol = (req.query.symbol || '').toString().toUpperCase();
    if(!symbol){
        return res.status(400).json({ error: 'Symbol is required' });
    }

    const API_KEY = process.env.ALPHA_VANTAGE_KEY;
    if(!API_KEY){
        return res.status(500).json({ error: 'API key is not set' });
    }

    try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
        const r = await fetch(url);
        const data = await r.json();
        const raw = data['Global Quote'] || {};
        const price = parseFloat(raw['05. price']);
        if (isNaN(price)) throw new Error('Invalid response');
        res.json({ symbol, price });
    } 
    catch (e) {
        console.error(e);
        res.status(502).json({ error: 'Bad gateway' });
    }
});

app.listen(PORT, () => {
    console.log(`⚡ Quote API listening on http://localhost:${PORT}/api/quote`);
});