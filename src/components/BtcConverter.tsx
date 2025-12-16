'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
// @ts-ignore
import { bitcoinHistoricalData, exchangeRatesHistorical } from '@/lib/historicalData';

type Unit = 'BTC' | 'SATS' | 'BRL' | 'USD' | 'EUR';

type HistoricalRow = {
    date: string;
    btcUsd: number;
    btcBrl: number;
    usdBrl: number;
    eurBrl: number;
    eurUsd: number;
    isOffline?: boolean;
};

export default function BtcConverter() {
    const { t, language } = useSettings();

    // State
    const [amountA, setAmountA] = useState<string>('1');
    const [unitA, setUnitA] = useState<Unit>('BTC');

    const [amountB, setAmountB] = useState<string>('');
    const [unitB, setUnitB] = useState<Unit>('BRL');

    const [prices, setPrices] = useState<{ BRL: number, USD: number, EUR: number } | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

    // History State
    const [showHistory, setShowHistory] = useState<'none' | '2' | '7' | '15' | '30'>('none');

    // Sorting State
    const [sortConfig, setSortConfig] = useState<{ key: keyof HistoricalRow; direction: 'asc' | 'desc' } | null>(null);

    const requestSort = (key: keyof HistoricalRow) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof HistoricalRow) => {
        if (!sortConfig || sortConfig.key !== key) return '↕';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    // Fetch Prices
    const fetchPrices = useCallback(async () => {
        setLoadingPrice(true);
        const newPrices = { BRL: 0, USD: 0, EUR: 0 };

        try {
            // USD & EUR (CoinDesk)
            try {
                const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                const data = await res.json();
                if (data.bpi?.USD) newPrices.USD = data.bpi.USD.rate_float;
                if (data.bpi?.EUR) newPrices.EUR = data.bpi.EUR.rate_float;
            } catch (e) {
                console.error("CoinDesk Error:", e);
                // Fallback to CoinGecko
                try {
                    const resCoingecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
                    const dataCoingecko = await resCoingecko.json();
                    newPrices.USD = dataCoingecko.bitcoin.usd;
                    newPrices.EUR = dataCoingecko.bitcoin.eur;
                } catch (e2) {
                    console.error("CoinGecko Error:", e2);
                    newPrices.USD = 96000;
                    newPrices.EUR = 90000;
                }
            }

            // BRL (AwesomeAPI)
            try {
                const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                const dataBRL = await resBRL.json();
                newPrices.BRL = parseFloat(dataBRL.BTCBRL.bid);
            } catch (e) {
                console.error("BRL Error:", e);
                newPrices.BRL = 466000;
            }

            // Only update if we got valid prices to avoid zeroing out
            setPrices(prev => ({
                BRL: newPrices.BRL || (prev?.BRL ?? 0),
                USD: newPrices.USD || (prev?.USD ?? 0),
                EUR: newPrices.EUR || (prev?.EUR ?? 0),
            }));

        } catch (error) {
            console.error("Error fetching prices:", error);
        } finally {
            setLoadingPrice(false);
        }
    }, []);

    // Initial Fetch & Interval
    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, [fetchPrices]);

    // Conversion Helpers (Formatters & Logic)

    // Parse any formatted string back to a number
    const parseCurrencyInput = (val: string, unit: Unit): number => {
        if (!val) return NaN;
        let clean = val;
        // BRL and EUR uses dot as thousands, comma as decimal
        if (unit === 'BRL' || unit === 'EUR') {
            clean = clean.replace(/\./g, '').replace(',', '.');
        } else {
            // USD, BTC, SATS uses comma as thousands, dot as decimal
            clean = clean.replace(/,/g, '');
        }
        return parseFloat(clean);
    };

    // Format a number into the localized string
    const formatCurrencyValue = (val: number, unit: Unit): string => {
        if (isNaN(val)) return '';
        if (unit === 'SATS') return Math.floor(val).toLocaleString('en-US');

        let locale = 'en-US';
        if (unit === 'BRL') locale = 'pt-BR';
        if (unit === 'EUR') locale = 'de-DE';

        // Limit decimals for cleaner display
        const maxDecimals = unit === 'BTC' ? 8 : 2;

        return val.toLocaleString(locale, {
            minimumFractionDigits: unit === 'BTC' ? 0 : 2,
            maximumFractionDigits: maxDecimals
        });
    };

    const getBtcValue = (val: number, unit: Unit): number => {
        // Fallback to yesterday's price if live prices fail and we have historical data
        let brlPrice = prices?.BRL || 0;
        let usdPrice = prices?.USD || 0;
        let eurPrice = prices?.EUR || 0;

        // Fallback logic
        if (!prices || prices.USD === 0) {
            // Try to find a recent fallback from history
            // For now, hardcode a reasonable panic fallback if history is empty or complicated to access synchronously here without memo
            // But we can check if prices object is null.
            if (!prices) {
                // Simple safe fallback to prevent crash, though inaccurate
                usdPrice = 90000;
                brlPrice = 500000;
                eurPrice = 85000;
            }
        }

        switch (unit) {
            case 'BTC': return val;
            case 'SATS': return val / 100000000;
            case 'BRL': return brlPrice > 0 ? val / brlPrice : 0;
            case 'USD': return usdPrice > 0 ? val / usdPrice : 0;
            case 'EUR': return eurPrice > 0 ? val / eurPrice : 0;
            default: return 0;
        }
    };

    const convertFromBtc = (btcVal: number, targetUnit: Unit): number => {
        let brlPrice = prices?.BRL || 0;
        let usdPrice = prices?.USD || 0;
        let eurPrice = prices?.EUR || 0;

        if (!prices) {
            usdPrice = 90000;
            brlPrice = 500000;
            eurPrice = 85000;
        }

        switch (targetUnit) {
            case 'BTC': return btcVal;
            case 'SATS': return btcVal * 100000000;
            case 'BRL': return btcVal * brlPrice;
            case 'USD': return btcVal * usdPrice;
            case 'EUR': return btcVal * eurPrice;
            default: return 0;
        }
    };

    const handleAChange = (val: string) => {
        setAmountA(val);
        const num = parseCurrencyInput(val, unitA);
        if (isNaN(num)) {
            setAmountB('');
            return;
        }
        const btc = getBtcValue(num, unitA);
        const res = convertFromBtc(btc, unitB);
        setAmountB(formatCurrencyValue(res, unitB));
    };

    const handleA_Blur = () => {
        const num = parseCurrencyInput(amountA, unitA);
        if (!isNaN(num)) {
            setAmountA(formatCurrencyValue(num, unitA));
        }
    };

    const handleBChange = (val: string) => {
        setAmountB(val);
        const num = parseCurrencyInput(val, unitB);
        if (isNaN(num)) {
            setAmountA('');
            return;
        }
        const btc = getBtcValue(num, unitB);
        const res = convertFromBtc(btc, unitA);
        setAmountA(formatCurrencyValue(res, unitA));
    };

    const handleB_Blur = () => {
        const num = parseCurrencyInput(amountB, unitB);
        if (!isNaN(num)) {
            setAmountB(formatCurrencyValue(num, unitB));
        }
    };

    const handleSwap = () => {
        setAmountA(amountB);
        setAmountB(amountA);
        setUnitA(unitB);
        setUnitB(unitA);
    };

    useEffect(() => {
        if (amountA) { // Removed 'prices' dependency check blockade to allow fallback
            const num = parseCurrencyInput(amountA, unitA);
            if (!isNaN(num)) {
                const btc = getBtcValue(num, unitA);
                const res = convertFromBtc(btc, unitB);
                setAmountB(formatCurrencyValue(res, unitB));
            }
        }
    }, [prices, unitA, unitB]);

    const symbols: Record<Unit, string> = {
        BTC: '₿',
        SATS: '⚡',
        BRL: 'R$',
        USD: '$',
        EUR: '€'
    };

    // --- History Logic ---

    const getDateValue = (dataObj: any, target: string) => {
        if (!dataObj) return null;
        if (dataObj[target] !== undefined) return { date: target, value: dataObj[target] };

        // Closest previous
        const dates = Object.keys(dataObj).sort();
        const t = new Date(target);
        let closest = null;
        // Optimization: search backwards from end
        for (let i = dates.length - 1; i >= 0; i--) {
            if (new Date(dates[i]) <= t) {
                closest = dates[i];
                break;
            }
        }
        if (closest) return { date: closest, value: dataObj[closest] };
        return null;
    };

    const getHistoricalRow = (daysAgo: number): HistoricalRow | null => {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const targetDate = d.toISOString().split('T')[0];

        // Get BTC USD price
        // @ts-ignore
        const btcData = getDateValue(bitcoinHistoricalData, targetDate);
        if (!btcData) return null;

        const dateKey = btcData.date;
        const btcUsd = btcData.value;

        // Get Rates
        // @ts-ignore
        const brlData = getDateValue(exchangeRatesHistorical['BRL'], dateKey);
        const brlRate = brlData ? brlData.value : 1;

        // @ts-ignore
        const eurData = getDateValue(exchangeRatesHistorical['EUR'], dateKey);
        const eurRate = eurData ? eurData.value : 0.85;

        // Calculate
        const btcBrl = btcUsd * brlRate;
        const usdBrl = brlRate;
        const eurBrl = brlRate / eurRate;
        const eurUsd = 1 / eurRate;

        return {
            date: dateKey,
            btcUsd,
            btcBrl,
            usdBrl,
            eurBrl,
            eurUsd,
            isOffline: true
        };
    };

    const todayRow: HistoricalRow | null = prices ? {
        date: t('sats.today'),
        btcUsd: prices.USD,
        btcBrl: prices.BRL,
        usdBrl: prices.BRL / prices.USD,
        eurBrl: prices.BRL / prices.EUR,
        eurUsd: prices.USD / prices.EUR,
        isOffline: false
    } : null;

    // Last available DB row (Today - 1 or Closest)
    const yesterdayRow = useMemo(() => getHistoricalRow(1), []);

    const historyRows = useMemo(() => {
        if (showHistory === 'none') return [];
        const targetTotal = parseInt(showHistory);
        // We already have "Agora" (1) and "Yesterday" (1) displayed.
        // So we need to fetch (targetTotal - 2) additional rows.
        const count = targetTotal - 2;

        if (count <= 0) return [];

        const rows: HistoricalRow[] = [];
        const seenDates = new Set<string>();

        if (yesterdayRow) seenDates.add(yesterdayRow.date);

        // Start from 2 days ago because "yesterday" is already shown
        for (let i = 2; i <= count * 2 + 5; i++) { // Look further back to find unique dates
            if (rows.length >= count) break;

            const r = getHistoricalRow(i);
            if (r && !seenDates.has(r.date)) {
                rows.push(r);
                seenDates.add(r.date);
            }
        }
        return rows;
    }, [showHistory, yesterdayRow]);

    return (
        <div className="calculator-container">
            <h1 className="section-title">{t('btc_conv.title')}</h1>
            <p className="section-desc">{t('btc_conv.subtitle')}</p>

            <div className="calculator-card" style={{ maxWidth: '100%', margin: '0 auto' }}>

                {/* Input A */}
                <div className="input-group">
                    <label htmlFor="amount-input-a">{t('btc_conv.amount')}</label>
                    <div className="amount-wrapper">
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 1, pointerEvents: 'none', fontSize: '1.2rem' }}>
                                {symbols[unitA]}
                            </span>
                            <input
                                id="amount-input-a"
                                type="text"
                                inputMode="decimal"
                                value={amountA}
                                onChange={(e) => handleAChange(e.target.value)}
                                onBlur={handleA_Blur}
                                style={{ paddingLeft: '40px', width: '100%', fontSize: '1.2rem', fontWeight: 'bold' }}
                            />
                        </div>
                        <select
                            aria-label="Unidade de entrada"
                            value={unitA}
                            onChange={(e) => setUnitA(e.target.value as Unit)}
                            style={{ width: '100px', fontWeight: 'bold' }}
                        >
                            <option value="BTC">BTC</option>
                            <option value="SATS">SATS</option>
                            <option value="BRL">BRL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '1rem 0',
                        color: 'var(--primary-green)',
                        fontSize: '1.5rem',
                        userSelect: 'none'
                    }}
                >
                    <span
                        onClick={handleSwap}
                        style={{ cursor: 'pointer', padding: '5px' }}
                        title="Inverter valores"
                    >
                        ⇅
                    </span>
                </div>

                {/* Input B */}
                <div className="input-group">
                    <label htmlFor="amount-input-b">{t('btc_conv.equivalent')}</label>
                    <div className="amount-wrapper">
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 1, pointerEvents: 'none', fontSize: '1.2rem' }}>
                                {symbols[unitB]}
                            </span>
                            <input
                                id="amount-input-b"
                                type="text"
                                inputMode="decimal"
                                value={amountB}
                                onChange={(e) => handleBChange(e.target.value)}
                                onBlur={handleB_Blur}
                                style={{ paddingLeft: '40px', width: '100%', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)' }}
                            />
                        </div>
                        <select
                            aria-label="Unidade de saída"
                            value={unitB}
                            onChange={(e) => setUnitB(e.target.value as Unit)}
                            style={{ width: '100px', fontWeight: 'bold' }}
                        >
                            <option value="BTC">BTC</option>
                            <option value="SATS">SATS</option>
                            <option value="BRL">BRL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                {/* Share Buttons */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', width: '100%' }}>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('btc_conv.title'))}&url=https://viverdebitcoin.com/conversor-btc`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        𝕏
                    </a>
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IG
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(t('btc_conv.title'))}%20https://viverdebitcoin.com/conversor-btc`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        WhatsApp
                    </a>
                </div>
            </div>

            {/* Table Section - New Card */}
            <div className="calculator-card" style={{ maxWidth: '100%', margin: '2rem auto 0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{t('common.table')}</h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={fetchPrices}
                            disabled={loadingPrice}
                            className="action-btn"
                            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            {loadingPrice ? '...' : '🔄 Atualizar'}
                        </button>
                        <button
                            onClick={() => setShowHistory(showHistory === '2' ? 'none' : '2')}
                            className={`action-btn ${showHistory === '2' ? 'active' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                            2 Dias
                        </button>
                        <button
                            onClick={() => setShowHistory(showHistory === '7' ? 'none' : '7')}
                            className={`action-btn ${showHistory === '7' ? 'active' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                            7 Dias
                        </button>
                        <button
                            onClick={() => setShowHistory(showHistory === '15' ? 'none' : '15')}
                            className={`action-btn ${showHistory === '15' ? 'active' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                            15 Dias
                        </button>
                        <button
                            onClick={() => setShowHistory(showHistory === '30' ? 'none' : '30')}
                            className={`action-btn ${showHistory === '30' ? 'active' : ''}`}
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                            30 Dias
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)', maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right', minWidth: '600px' }}>
                        <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 5 }}>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th onClick={() => requestSort('date')} style={{ padding: '8px 10px', textAlign: 'left', minWidth: '90px', cursor: 'pointer' }}>Date {getSortIndicator('date')}</th>
                                <th onClick={() => requestSort('btcUsd')} style={{ padding: '8px 10px', cursor: 'pointer' }}>BTC (USD) {getSortIndicator('btcUsd')}</th>
                                <th onClick={() => requestSort('btcBrl')} style={{ padding: '8px 10px', cursor: 'pointer' }}>BTC (BRL) {getSortIndicator('btcBrl')}</th>
                                <th onClick={() => requestSort('usdBrl')} style={{ padding: '8px 10px', cursor: 'pointer' }}>USD (BRL) {getSortIndicator('usdBrl')}</th>
                                <th onClick={() => requestSort('eurBrl')} style={{ padding: '8px 10px', cursor: 'pointer' }}>EUR (BRL) {getSortIndicator('eurBrl')}</th>
                                <th onClick={() => requestSort('eurUsd')} style={{ padding: '8px 10px', cursor: 'pointer' }}>EUR/USD {getSortIndicator('eurUsd')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(() => {
                                // Combine all rows
                                let allRows: HistoricalRow[] = [];
                                if (todayRow) allRows.push(todayRow);
                                if (yesterdayRow) allRows.push(yesterdayRow);
                                allRows = [...allRows, ...historyRows];

                                // Sort
                                if (sortConfig) {
                                    allRows.sort((a, b) => {
                                        const valA = a[sortConfig.key];
                                        const valB = b[sortConfig.key];

                                        if (valA === undefined) return 1;
                                        if (valB === undefined) return -1;

                                        if (valA < valB) {
                                            return sortConfig.direction === 'asc' ? -1 : 1;
                                        }
                                        if (valA > valB) {
                                            return sortConfig.direction === 'asc' ? 1 : -1;
                                        }
                                        return 0;
                                    });
                                }

                                return allRows.map((row, i) => (
                                    <tr key={i} style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: !row.isOffline ? 'rgba(39, 174, 96, 0.1)' : 'transparent' }}>
                                        <td style={{ padding: '8px 10px', textAlign: 'left', fontWeight: !row.isOffline ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                                            {!row.isOffline ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
                                                    <span>{new Date().toLocaleDateString('pt-BR')}</span>
                                                    <span style={{ fontSize: '0.7em', color: '#27ae60' }}>●</span>
                                                </div>
                                            ) : (
                                                row.date.split('-').reverse().join('/')
                                            )}
                                        </td>
                                        <td style={{ padding: '8px 10px' }}>{row.btcUsd.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                                        <td style={{ padding: '8px 10px', fontWeight: !row.isOffline ? 'bold' : 'normal', color: !row.isOffline ? 'var(--text-main)' : 'var(--text-secondary)' }}>{row.btcBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td style={{ padding: '8px 10px' }}>{row.usdBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td style={{ padding: '8px 10px' }}>{row.eurBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td style={{ padding: '8px 10px' }}>{row.eurUsd.toFixed(4)}</td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
