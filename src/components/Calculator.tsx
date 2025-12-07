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
    const [amount, setAmount] = useState<string>('1000');
    const [currency, setCurrency] = useState('BRL');
    const [date, setDate] = useState('2014-09-17');
    const [livePriceBRL, setLivePriceBRL] = useState<number | null>(null);
    const [livePriceUSD, setLivePriceUSD] = useState<number | null>(null);

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

    useEffect(() => {

        // Fetch Prices
        const fetchPrices = async () => {
            try {
                const res = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                const data = await res.json();
                setLivePriceBRL(parseFloat(data.BTCBRL.bid));

                const resUSD = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
                const dataUSD = await resUSD.json();
                setLivePriceUSD(dataUSD.bitcoin.usd);
            } catch (e) {
                console.error(e);
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

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
            <h2 className="section-title">Calculadora de Bitcoin (ROI)</h2>
            <p className="section-desc">Descubra se você seria CLT ou Magnata?</p>

            <div className="calculator-card">
                <div className="input-group">
                    <label htmlFor="investment-amount">Valor do Investimento</label>
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
                            id="currency-selector"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            <option value="BRL">BRL (R$)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                </div>

                <div className="input-group">
                    <label htmlFor="investment-date">Data da Compra</label>
                    <input
                        type="date"
                        id="investment-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <button id="calculate-btn" className="cta-button" onClick={calculate}>Calcular Resultado</button>
                <p className="historical-note">Dados históricos disponíveis a partir de 17/09/2014</p>
                <div className="live-price">
                    {livePriceBRL ? `Preço Atual: ${livePriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}` : 'Carregando preço atual...'}
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
                    Compartilhe nas suas redes sociais :)
                </p>

                {result && (
                    <div id="result-card" className={`result-card fade-in`} style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: 'transparent', opacity: 1, transform: 'none', display: 'flex' }}>
                        <div className="result-item">
                            <span>Valor Hoje</span>
                            <strong id="result-value">{result.formattedValue}</strong>
                        </div>
                        <div className="result-item">
                            <span>Quantidade de Bitcoins</span>
                            <strong id="result-btc-amount">{result.btcAmount.toFixed(8)} BTC</strong>
                        </div>
                        <div className="result-item">
                            <span>Lucro/Prejuízo</span>
                            <strong id="result-profit" className={result.profit >= 0 ? 'profit-positive' : 'profit-negative'}>{result.formattedProfit}</strong>
                        </div>
                        <div className="result-item">
                            <span>ROI (Retorno)</span>
                            <strong id="result-roi" className={result.roi >= 0 ? 'roi-positive' : 'roi-negative'}>{result.formattedRoi}</strong>
                        </div>
                    </div>
                )}
            </div>

            {chartData && (
                <>
                    <div className="view-switcher" id="view-switcher-container">
                        <button className={`view-btn ${!showTable ? 'active' : ''}`} onClick={() => setShowTable(false)}>Gráfico</button>
                        <button className={`view-btn ${showTable ? 'active' : ''}`} onClick={() => setShowTable(true)}>Tabela</button>
                    </div>

                    {!showTable ? (
                        <div className="chart-container" id="roi-chart-container">
                            <Line options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: {
                                    x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                                }
                            }} data={chartData} />
                        </div>
                    ) : (
                        <div className="table-container active" id="roi-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Valor ({currency})</th>
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
