'use client';
import { useEffect, useState } from 'react';

type MarketItem = {
    name: string;
    value: string;
    trend: 'up' | 'down';
    pct: string;
};

export default function MarketTicker() {
    const [items, setItems] = useState<MarketItem[]>([]);

    useEffect(() => {
        const fetchTicker = async () => {
            try {
                const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD,BTC-BRL');
                if (!res.ok) return;
                const data = await res.json();

                const fmt = (val: string, digits = 2, prefix = 'R$ ') => `${prefix}${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
                const getTrend = (pct: string) => parseFloat(pct) >= 0 ? 'up' : 'down';
                const getPct = (pct: string) => `${parseFloat(pct) >= 0 ? '+' : ''}${parseFloat(pct).toFixed(2)}%`;

                const newItems: MarketItem[] = [];

                if (data.BTCBRL) {
                    newItems.push({
                        name: 'Bitcoin (BRL)',
                        value: fmt(data.BTCBRL.bid, 2, 'R$ '),
                        trend: getTrend(data.BTCBRL.pctChange),
                        pct: getPct(data.BTCBRL.pctChange)
                    });
                    const btcBrl = parseFloat(data.BTCBRL.bid);
                    newItems.push({
                        name: 'Sats / R$1',
                        value: `${(100000000 / btcBrl).toFixed(0)} Sats`,
                        trend: 'up',
                        pct: ''
                    });
                }
                if (data.USDBRL) newItems.push({ name: 'Dólar', value: fmt(data.USDBRL.bid, 2), trend: getTrend(data.USDBRL.pctChange), pct: getPct(data.USDBRL.pctChange) });
                if (data.EURBRL) newItems.push({ name: 'Euro', value: fmt(data.EURBRL.bid, 2), trend: getTrend(data.EURBRL.pctChange), pct: getPct(data.EURBRL.pctChange) });
                if (data.EURUSD) newItems.push({ name: 'EUR/USD', value: fmt(data.EURUSD.bid, 4, '$ '), trend: getTrend(data.EURUSD.pctChange), pct: getPct(data.EURUSD.pctChange) });

                // Mocks
                newItems.push({ name: 'S&P 500', value: '6,047.15', trend: 'up', pct: '+0.25%' });
                newItems.push({ name: 'IBOVESPA', value: '126,340', trend: 'down', pct: '-0.50%' });

                setItems(newItems);
            } catch (e) {
                console.error(e);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 30000);
        return () => clearInterval(interval);
    }, []);

    if (items.length === 0) return null;

    return (
        <div id="market-marquee" className="market-marquee-container">
            <div className="market-marquee-content">
                {/* Render multiple times for seamless loop */}
                {[...items, ...items, ...items].map((item, i) => (
                    <span key={i} className="marquee-item">
                        <span className="marquee-label">{item.name}</span>
                        <strong className="marquee-value">{item.value}</strong>
                        {item.pct && <span className={`marquee-trend-${item.trend}`}>{item.pct}</span>}
                    </span>
                ))}
            </div>
        </div>
    );
}
