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
                const [awesomeRes, hgRes] = await Promise.all([
                    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD,BTC-BRL'),
                    fetch('/api/ticker')
                ]);

                const awesomeData = awesomeRes.ok ? await awesomeRes.json() : null;
                const tickerData = hgRes.ok ? await hgRes.json() : null;

                const fmt = (val: string, digits = 2, prefix = 'R$ ') => `${prefix}${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
                const getTrend = (pct: string | number) => {
                    const val = typeof pct === 'string' ? parseFloat(pct) : pct;
                    return val >= 0 ? 'up' : 'down';
                };
                const getPct = (pct: string | number) => {
                    const val = typeof pct === 'string' ? parseFloat(pct) : pct;
                    return `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
                };

                const newItems: MarketItem[] = [];

                if (awesomeData) {
                    if (awesomeData.BTCBRL) {
                        newItems.push({
                            name: 'Bitcoin (BRL)',
                            value: fmt(awesomeData.BTCBRL.bid, 2, 'R$ '),
                            trend: getTrend(awesomeData.BTCBRL.pctChange),
                            pct: getPct(awesomeData.BTCBRL.pctChange)
                        });
                        const btcBrl = parseFloat(awesomeData.BTCBRL.bid);
                        newItems.push({
                            name: 'Sats / R$1',
                            value: `${(100000000 / btcBrl).toFixed(0)} Sats`,
                            trend: 'up',
                            pct: ''
                        });
                    }
                    if (awesomeData.USDBRL) newItems.push({ name: 'Dólar', value: fmt(awesomeData.USDBRL.bid, 2), trend: getTrend(awesomeData.USDBRL.pctChange), pct: getPct(awesomeData.USDBRL.pctChange) });
                    if (awesomeData.EURBRL) newItems.push({ name: 'Euro', value: fmt(awesomeData.EURBRL.bid, 2), trend: getTrend(awesomeData.EURBRL.pctChange), pct: getPct(awesomeData.EURBRL.pctChange) });
                    if (awesomeData.EURUSD) newItems.push({ name: 'EUR/USD', value: fmt(awesomeData.EURUSD.bid, 4, '$ '), trend: getTrend(awesomeData.EURUSD.pctChange), pct: getPct(awesomeData.EURUSD.pctChange) });
                }

                // Internal API (S&P 500 & HG Brasil)
                if (tickerData) {
                    // S&P 500
                    if (tickerData.sp500) {
                        newItems.push({
                            name: 'S&P 500',
                            value: tickerData.sp500.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                            trend: getTrend(tickerData.sp500.change),
                            pct: getPct(tickerData.sp500.change)
                        });
                    } else {
                        // Fallback/Mock just in case
                        newItems.push({ name: 'S&P 500', value: '6,047.15', trend: 'up', pct: '+0.25%' });
                    }

                    // IBOVESPA
                    const hg = tickerData.hgBrasil;
                    if (hg && hg.results && hg.results.stocks && hg.results.stocks.IBOVESPA) {
                        const ibov = hg.results.stocks.IBOVESPA;
                        newItems.push({
                            name: 'IBOVESPA',
                            value: ibov.points.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
                            trend: getTrend(ibov.variation),
                            pct: getPct(ibov.variation)
                        });
                    } else {
                        newItems.push({ name: 'IBOVESPA', value: '126,340', trend: 'down', pct: '-0.50%' });
                    }
                } else {
                    newItems.push({ name: 'S&P 500', value: '6,047.15', trend: 'up', pct: '+0.25%' });
                    newItems.push({ name: 'IBOVESPA', value: '126,340', trend: 'down', pct: '-0.50%' });
                }

                setItems(newItems);
            } catch (e) {
                console.error(e);
            }
        };

        fetchTicker();
        const interval = setInterval(fetchTicker, 60000); // Increased interval to 60s
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
