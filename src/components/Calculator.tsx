'use client';

import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { bitcoinHistoricalData, exchangeRates, exchangeRatesHistorical } from '@/lib/historicalData';
import { useSettings } from '@/contexts/SettingsContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Type Helper for Data
type HistoricalData = { [date: string]: number };

export default function Calculator() {
    const { currency, setCurrency, t } = useSettings();
    const [amount, setAmount] = useState<string>('1000');
    // Currency is now global
    const [date, setDate] = useState('2014-09-17');
    const [livePriceBRL, setLivePriceBRL] = useState<number | null>(null);
    const [livePriceUSD, setLivePriceUSD] = useState<number | null>(null);
    const [livePriceEUR, setLivePriceEUR] = useState<number | null>(null);
    const [isLightMode, setIsLightMode] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const [result, setResult] = useState<{
        currentValue: number;
        profit: number;
        btcAmount: number;
        roi: number;
        formattedValue: string;
        formattedProfit: string;
        formattedRoi: string;
    } | null>(null);

    const [chartData, setChartData] = useState<any>(null);
    const [showTable, setShowTable] = useState(false);
    const [chartHistory, setChartHistory] = useState<{ date: string, value: number }[]>([]);

    const fetchPrices = async () => {
        setLoadingPrice(true);
        // USD & EUR (CoinDesk with CoinGecko fallback)
        try {
            const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await res.json();

            if (data.bpi && data.bpi.USD) {
                setLivePriceUSD(data.bpi.USD.rate_float);
            }
            if (data.bpi && data.bpi.EUR) {
                setLivePriceEUR(data.bpi.EUR.rate_float);
            }
        } catch (e) {
            console.error("Error fetching USD/EUR from CoinDesk:", e);

            // Fallback to CoinGecko
            try {
                const resCoingecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
                const dataCoingecko = await resCoingecko.json();
                setLivePriceUSD(dataCoingecko.bitcoin.usd);
                setLivePriceEUR(dataCoingecko.bitcoin.eur);
            } catch (e2) {
                console.error("Error fetching USD/EUR from CoinGecko:", e2);
            }
        }

        // BRL from AwesomeAPI (Independent)
        try {
            const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
            const dataBRL = await resBRL.json();
            setLivePriceBRL(parseFloat(dataBRL.BTCBRL.bid));
        } catch (e) {
            console.error("Error fetching BRL:", e);
        }
        setLoadingPrice(false);
    };

    useEffect(() => {
        // Theme Observer
        const checkTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: {
                grid: { color: isLightMode ? '#e5e5e5' : 'rgba(255,255,255,0.05)' },
                ticks: { color: isLightMode ? '#666' : '#ccc' }
            },
            y: {
                grid: { color: isLightMode ? '#e5e5e5' : 'rgba(255,255,255,0.05)' },
                ticks: { color: isLightMode ? '#666' : '#ccc' }
            }
        },
        color: isLightMode ? '#333' : '#fff'
    };

    const getDateValue = (dataObj: HistoricalData, target: string) => {
        if (dataObj[target] !== undefined) return { date: target, value: dataObj[target] };

        // Closest previous
        const dates = Object.keys(dataObj).sort();
        const t = new Date(target);
        let closest = null;
        for (let d of dates) {
            if (new Date(d) <= t) closest = d;
            else break;
        }
        if (closest) return { date: closest, value: dataObj[closest] };
        return null;
    };

    const calculate = () => {
        if (!amount || !date || !livePriceUSD) return;

        // Logic from script.js
        const LIMIT_DATE = '2014-09-17';
        // eslint-disable-next-line
        let targetDate = date < LIMIT_DATE ? LIMIT_DATE : date;
        if (date < LIMIT_DATE) {
            setDate(LIMIT_DATE);
            targetDate = LIMIT_DATE;
        }

        const priceData = getDateValue(bitcoinHistoricalData, targetDate);
        if (!priceData) {
            alert('Sem dados para esta data.');
            return;
        }

        const historicalPriceUSD = priceData.value;
        const effectiveDate = priceData.date;

        let historicalRate = 1;
        if (currency !== 'USD') {
            // @ts-ignore
            const rateData = getDateValue(exchangeRatesHistorical[currency], effectiveDate);
            if (rateData) historicalRate = rateData.value;
            // @ts-ignore
            else historicalRate = exchangeRates[currency] || 1;
        }

        const amountNum = parseFloat(amount);
        const amountInUSD = amountNum / historicalRate;
        const btcAmount = amountInUSD / historicalPriceUSD;

        // @ts-ignore
        const currentRate = exchangeRates[currency] || 1;

        const currentValueUSD = btcAmount * livePriceUSD;
        const currentValueLocal = currentValueUSD * currentRate;

        const profit = currentValueLocal - amountNum;
        const roi = ((profit / amountNum) * 100);

        const fmt = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency });

        setResult({
            currentValue: currentValueLocal,
            profit,
            btcAmount,
            roi,
            formattedValue: fmt.format(currentValueLocal),
            formattedProfit: (profit >= 0 ? '+' : '') + fmt.format(profit),
            formattedRoi: roi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %'
        });

        // Chart
        generateChart(btcAmount, effectiveDate, currency);
    };

    const generateChart = (btcAmount: number, startDate: string, curr: string) => {
        const dates = Object.keys(bitcoinHistoricalData).sort();
        const startIdx = dates.findIndex(d => d >= startDate);

        const labels: string[] = [];
        const points: number[] = [];
        const history: { date: string, value: number }[] = [];

        for (let i = startIdx; i < dates.length; i++) {
            const d = dates[i];
            // @ts-ignore
            const price = bitcoinHistoricalData[d];

            let rate = 1;
            if (curr !== 'USD') {
                // @ts-ignore
                const rData = getDateValue(exchangeRatesHistorical[curr], d);
                if (rData) rate = rData.value;
                // @ts-ignore
                else rate = exchangeRates[curr] || 1;
            }

            const val = btcAmount * price * rate;
            labels.push(d);
            points.push(val);
            history.push({ date: d, value: val });
        }

        // Reverse history for table
        setChartHistory([...history].reverse());

        setChartData({
            labels,
            datasets: [
                {
                    label: `Valor do Portfólio (${curr})`,
                    data: points,
                    borderColor: '#27ae60',
                    backgroundColor: (context: any) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(39, 174, 96, 0.5)');
                        gradient.addColorStop(1, 'rgba(39, 174, 96, 0.0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                }
            ]
        });
    };

    return (
        <div className="calculator-container">
            <h1 className="section-title">{t('roi.title')}</h1>
            <p className="section-desc">{t('roi.subtitle')}</p>

            <div className="calculator-card">
                <div className="input-group">
                    <label htmlFor="investment-amount">{t('roi.investment_amount')}</label>
                    <div className="amount-wrapper">
                        <input
                            type="number"
                            id="investment-amount"
                            placeholder="Ex: 1000"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as any)}
                            style={{ width: 'auto', minWidth: '80px', textAlign: 'center' }}
                        >
                            <option value="BRL">BRL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="investment-date">{t('roi.buy_date')}</label>
                    <input
                        type="date"
                        id="investment-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min="2014-09-17"
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <button id="calculate-btn" className="cta-button" onClick={calculate}>{t('roi.calculate_btn')}</button>
                <p className="historical-note">{t('roi.historical_note')}</p>
                <div className="live-price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loadingPrice ? (
                        <span>{t('common.updating')}</span>
                    ) : (
                        <>
                            {
                                currency === 'BRL' && livePriceBRL ? `${t('common.current_price')}: ${livePriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` :
                                    currency === 'EUR' && livePriceEUR ? `${t('common.current_price')}: ${livePriceEUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}` :
                                        livePriceUSD ? `${t('common.current_price')}: ${livePriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` :
                                            t('common.updating')
                            }
                            <button
                                onClick={fetchPrices}
                                className="refresh-btn"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                                title={t('common.refresh')}
                                aria-label={t('common.refresh')}
                            >
                                🔄
                            </button>
                        </>
                    )}
                </div>

                {/* Share Buttons */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', width: '100%' }}>
                    <a href={`https://twitter.com/intent/tweet?text=Confira%20esta%20Calculadora%20do%20Arrependimento%20Bitcoin!&url=https://viverdebitcoin.com/calculadora-arrependimento`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        𝕏
                    </a>
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IG
                    </a>
                    <a href={`https://wa.me/?text=Confira%20esta%20Calculadora%20do%20Arrependimento%20Bitcoin!%20https://viverdebitcoin.com/calculadora-arrependimento`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        WhatsApp
                    </a>
                </div>
                <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0' }}>
                    {t('common.share')}
                </p>

                {result && (
                    <div id="result-card" className={`result-card fade-in`} style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: 'transparent', opacity: 1, transform: 'none', display: 'flex' }}>
                        <div className="result-item">
                            <span>{t('dca.results.value_today')}</span>
                            <strong id="result-value">{result.formattedValue}</strong>
                        </div>
                        <div className="result-item">
                            <span>{t('common.btc_acquired')}</span>
                            <strong id="result-btc-amount">{result.btcAmount.toFixed(8)} BTC</strong>
                        </div>
                        <div className="result-item">
                            <span>{t('common.profit')}</span>
                            <strong id="result-profit" className={result.profit >= 0 ? 'profit-positive' : 'profit-negative'}>{result.formattedProfit}</strong>
                        </div>
                        <div className="result-item">
                            <span>{t('roi.result_roi')}</span>
                            <strong id="result-roi" className={result.roi >= 0 ? 'roi-positive' : 'roi-negative'}>{result.formattedRoi}</strong>
                        </div>
                    </div>
                )}
            </div>

            {chartData && (
                <>
                    <div className="view-switcher" id="view-switcher-container">
                        <button className={`view-btn ${!showTable ? 'active' : ''}`} onClick={() => setShowTable(false)}>{t('common.chart')}</button>
                        <button className={`view-btn ${showTable ? 'active' : ''}`} onClick={() => setShowTable(true)}>{t('common.table')}</button>
                    </div>

                    {!showTable ? (
                        <div className="chart-container" id="roi-chart-container">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    ) : (
                        <div className="table-container active" id="roi-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>{t('common.date')}</th>
                                        <th>{t('dca.results.value_today')} ({currency})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartHistory.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.date.split('-').reverse().join('/')}</td>
                                            <td>{new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency }).format(row.value)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
