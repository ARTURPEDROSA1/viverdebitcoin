'use client';

import { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
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
    LineController,
    Title,
    Tooltip,
    Legend,
    Filler
);

type HistoricalData = { [date: string]: number };

export default function DcaCalculator() {
    const [amount, setAmount] = useState<string>('100');
    const [initialInvestment, setInitialInvestment] = useState<string>('');
    const [frequency, setFrequency] = useState('monthly');
    const [currency, setCurrency] = useState('BRL');
    const [date, setDate] = useState('2020-01-01');
    const [livePriceUSD, setLivePriceUSD] = useState<number | null>(null);
    const [livePriceBRL, setLivePriceBRL] = useState<number | null>(null);
    const [livePriceEUR, setLivePriceEUR] = useState<number | null>(null);
    const [isLightMode, setIsLightMode] = useState(false);
    const [loadingPrice, setLoadingPrice] = useState(false);

    const [result, setResult] = useState<{
        totalInvested: string;
        currentValue: string;
        profit: string;
        btcAmount: number;
        roi: string;
        avgPrice: string;
        avgPriceSats: string;
        isProfit: boolean;
    } | null>(null);

    const [chartData, setChartData] = useState<any>(null);
    const [showTable, setShowTable] = useState(false);
    const [chartHistory, setChartHistory] = useState<{ date: string, invested: number, value: number }[]>([]);

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

        // Initial fetch
        fetchPrices();

        return () => observer.disconnect();
    }, []);

    const getDateValue = (dataObj: HistoricalData, target: string) => {
        if (dataObj[target] !== undefined) return { date: target, value: dataObj[target] };

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

    const addDays = (dateStr: string, days: number) => {
        const result = new Date(dateStr);
        result.setDate(result.getDate() + days);
        return result.toISOString().split('T')[0];
    };

    const addMonths = (dateStr: string, months: number) => {
        const result = new Date(dateStr);
        result.setMonth(result.getMonth() + months);
        return result.toISOString().split('T')[0];
    };

    const addYears = (dateStr: string, years: number) => {
        const result = new Date(dateStr);
        result.setFullYear(result.getFullYear() + years);
        return result.toISOString().split('T')[0];
    };

    const calculate = () => {
        // Check if we have the necessary price data for the selected currency
        let hasValidPrice = !!livePriceUSD;
        if (currency === 'BRL' && livePriceBRL) hasValidPrice = true;
        if (currency === 'EUR' && livePriceEUR) hasValidPrice = true;

        if ((!amount && !initialInvestment) || !date || !hasValidPrice) return;

        const recurringAmount = parseFloat(amount) || 0;
        const initialAmount = parseFloat(initialInvestment) || 0;
        const LIMIT_DATE = '2014-09-17';
        let currentDate = date < LIMIT_DATE ? LIMIT_DATE : date;

        let totalInvestedProcess = 0;
        let totalBtc = 0;

        const history: { date: string, invested: number, value: number }[] = [];
        const labels: string[] = [];
        const investedPoints: number[] = [];
        const valuePoints: number[] = [];

        const today = new Date().toISOString().split('T')[0];
        let isFirstPurchase = true;

        // Loop
        while (currentDate <= today) {
            const priceData = getDateValue(bitcoinHistoricalData, currentDate);
            if (!priceData) break;

            const btcPriceUSD = priceData.value;
            const effectiveDate = priceData.date;

            let historicalRate = 1;
            if (currency !== 'USD') {
                // @ts-ignore
                const rateData = getDateValue(exchangeRatesHistorical[currency], effectiveDate);
                if (rateData) historicalRate = rateData.value;
                // @ts-ignore
                else historicalRate = exchangeRates[currency] || 1;
            }

            let investmentThisPeriod = recurringAmount;
            if (isFirstPurchase) {
                investmentThisPeriod += initialAmount;
                isFirstPurchase = false;
            }

            if (investmentThisPeriod > 0) {
                const amountInUSD = investmentThisPeriod / historicalRate;
                const btcBought = amountInUSD / btcPriceUSD;

                totalInvestedProcess += investmentThisPeriod;
                totalBtc += btcBought;
            }

            const portfolioValueAtTime = totalBtc * btcPriceUSD * historicalRate;

            history.push({ date: effectiveDate, invested: totalInvestedProcess, value: portfolioValueAtTime });
            labels.push(effectiveDate);
            investedPoints.push(totalInvestedProcess);
            valuePoints.push(portfolioValueAtTime);

            if (frequency === 'weekly') currentDate = addDays(currentDate, 7);
            else if (frequency === 'biweekly') currentDate = addDays(currentDate, 14);
            else if (frequency === 'monthly') currentDate = addMonths(currentDate, 1);
            else if (frequency === 'yearly') currentDate = addYears(currentDate, 1);
            else break;
        }

        // Final Calculation
        let currentPrice: number = 0;
        if (currency === 'BRL' && livePriceBRL) currentPrice = livePriceBRL;
        else if (currency === 'EUR' && livePriceEUR) currentPrice = livePriceEUR;
        else if (currency === 'USD' && livePriceUSD) currentPrice = livePriceUSD;
        else if (livePriceUSD) {
            // @ts-ignore
            const currentRate = exchangeRates[currency] || 1;
            currentPrice = livePriceUSD * currentRate;
        } else {
            return;
        }

        const currentPortfolioValue = totalBtc * currentPrice;

        const profit = currentPortfolioValue - totalInvestedProcess;
        const roi = (totalInvestedProcess > 0) ? (profit / totalInvestedProcess) * 100 : 0;

        const avgPrice = totalBtc > 0 ? totalInvestedProcess / totalBtc : 0;
        const avgPriceSats = avgPrice / 100000000;

        const fmt = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency });

        setResult({
            totalInvested: fmt.format(totalInvestedProcess),
            currentValue: fmt.format(currentPortfolioValue),
            profit: (profit >= 0 ? '+' : '') + fmt.format(profit),
            btcAmount: totalBtc,
            roi: roi.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' %',
            avgPrice: fmt.format(avgPrice),
            avgPriceSats: (avgPrice / 100000000).toFixed(8),
            isProfit: profit >= 0
        });

        setChartHistory([...history].reverse());
        setChartData({
            labels,
            datasets: [
                {
                    label: `Valor Investido (${currency})`,
                    data: investedPoints,
                    borderColor: '#95a5a6',
                    backgroundColor: 'rgba(149, 165, 166, 0.1)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 0,
                    borderDash: [5, 5],
                },
                {
                    label: `Valor do Portfólio (${currency})`,
                    data: valuePoints,
                    borderColor: '#f2994a',
                    backgroundColor: (context: any) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, 'rgba(242, 153, 74, 0.5)');
                        gradient.addColorStop(1, 'rgba(242, 153, 74, 0.0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                }
            ]
        });
    };

    const getFormattedLivePrice = () => {
        if (currency === 'BRL' && livePriceBRL) return livePriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        if (currency === 'EUR' && livePriceEUR) return livePriceEUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
        if (livePriceUSD) return livePriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        return '...';
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, position: 'bottom' as const } },
        scales: {
            x: {
                grid: {
                    color: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
                },
                ticks: {
                    color: isLightMode ? '#666' : '#ccc'
                }
            },
            y: {
                grid: {
                    color: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'
                },
                ticks: {
                    color: isLightMode ? '#666' : '#ccc'
                }
            }
        },
        color: isLightMode ? '#333' : '#fff'
    };

    return (
        <div className="calculator-container">
            <h2 className="section-title">Calculadora DCA Bitcoin</h2>
            <p className="section-desc">Simule compras recorrentes com Dollar Cost Averaging</p>

            <div className="calculator-card">
                <div className="input-group">
                    <label htmlFor="initial-investment">Aporte Inicial (Opcional)</label>
                    <input
                        type="number"
                        id="initial-investment"
                        placeholder="Ex: 1000"
                        min="0"
                        value={initialInvestment}
                        onChange={(e) => setInitialInvestment(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="investment-amount">Valor Recorrente</label>
                    <div className="amount-wrapper">
                        <input
                            type="number"
                            id="investment-amount"
                            placeholder="Ex: 100"
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
                    <label htmlFor="frequency">Frequência</label>
                    <select
                        id="frequency"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                    >
                        <option value="weekly">Semanal (Toda semana)</option>
                        <option value="biweekly">Quinzenal (A cada 2 semanas)</option>
                        <option value="monthly">Mensal (Todo mês)</option>
                        <option value="yearly">Anual (Todo ano)</option>
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="start-date">Data de Início</label>
                    <input
                        type="date"
                        id="start-date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                <button id="calculate-btn" className="cta-button" onClick={calculate}>Calcular DCA</button>
                <div className="live-price" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loadingPrice ? (
                        <span>Atualizando preço...</span>
                    ) : (
                        <>
                            {getFormattedLivePrice() !== '...' ? `Preço Atual: ${getFormattedLivePrice()}` : 'Carregando preço atual...'}
                            <button
                                onClick={fetchPrices}
                                className="refresh-btn"
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
                                title="Atualizar Preço"
                                aria-label="Atualizar Preço"
                            >
                                🔄
                            </button>
                        </>
                    )}
                </div>

                {/* Share Buttons */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', width: '100%' }}>
                    <a href={`https://twitter.com/intent/tweet?text=Veja%20meu%20resultado%20na%20Calculadora%20DCA%20Bitcoin!&url=https://viverdebitcoin.com/calculadora-dca`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        𝕏
                    </a>
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IG
                    </a>
                    <a href={`https://wa.me/?text=Veja%20meu%20resultado%20na%20Calculadora%20DCA%20Bitcoin!%20https://viverdebitcoin.com/calculadora-dca`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        WhatsApp
                    </a>
                </div>

                {result && (
                    <div id="result-card" className={`result-card fade-in`} style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', background: 'transparent', opacity: 1, transform: 'none', display: 'flex', flexWrap: 'wrap' }}>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Total Investido</span>
                            <strong>{result.totalInvested}</strong>
                        </div>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Valor Hoje</span>
                            <strong>{result.currentValue}</strong>
                        </div>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Lucro/Prejuízo</span>
                            <strong className={result.isProfit ? 'profit-positive' : 'profit-negative'}>{result.profit} ({result.roi})</strong>
                        </div>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Bitcoin Acumulado</span>
                            <strong style={{ color: 'var(--bitcoin-orange)' }}>{result.btcAmount.toFixed(8)} BTC</strong>
                        </div>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Preço Médio (DCA)</span>
                            <strong>{result.avgPrice}</strong>
                        </div>
                        <div className="result-item" style={{ width: '100%' }}>
                            <span>Custo por Sat</span>
                            <strong>{result.avgPriceSats}</strong>
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
                        <div className="chart-container" id="dca-chart-container">
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    ) : (
                        <div className="table-container active" id="dca-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>Investido Acumulado ({currency})</th>
                                        <th>Valor Portfólio ({currency})</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {chartHistory.map((row, i) => (
                                        <tr key={i}>
                                            <td>{row.date.split('-').reverse().join('/')}</td>
                                            <td>{new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', { style: 'currency', currency }).format(row.invested)}</td>
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
