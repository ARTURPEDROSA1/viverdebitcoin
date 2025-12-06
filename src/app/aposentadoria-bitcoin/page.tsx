
"use client";
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Currency = 'BRL' | 'USD' | 'EUR';

type Anchors = {
    [year: number]: { base: number; bull: number; bear: number };
};

const USD_ANCHORS: Anchors = {
    2028: { base: 225000, bull: 450000, bear: 115000 },
    2033: { base: 425000, bull: 1050000, bear: 185000 },
    2040: { base: 800000, bull: 3250000, bear: 350000 },
    2050: { base: 1900000, bull: 10000000, bear: 650000 },
    2075: { base: 3000000, bull: 30000000, bear: 550000 },
};

const MACRO_EVENTS = [
    { id: 'etf', label: 'Strong ETF Flows', multiplier: 1.10, desc: 'Demand from regulated funds' },
    { id: 'reg_clarity', label: 'Regulatory Clarity', multiplier: 1.05, desc: 'Reduced uncertainty' },
    { id: 'sovereign', label: 'Sovereign/SWF Reserves', multiplier: 1.15, desc: 'Nation-state adoption' },
    { id: 'miner', label: 'Miner-friendly Energy', multiplier: 1.05, desc: 'Sustainable mining security' },
    { id: 'risk_on', label: 'Risk-on Liquidity', multiplier: 1.05, desc: 'Global favorable macro' },
    { id: 'tight_liq', label: 'Tight Liquidity', multiplier: 0.85, desc: 'High rates, low money supply' },
    { id: 'adv_reg', label: 'Adverse Regulation', multiplier: 0.85, desc: 'bans or strict KYC' },
    { id: 'recession', label: 'Recession Shocks', multiplier: 0.80, desc: 'Economic downturn' },
];

export default function BitcoinRetirementPage() {
    // Inputs
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(55);
    const [currentBtc, setCurrentBtc] = useState(0.1);
    const [monthlyContribution, setMonthlyContribution] = useState(500); // in selected currency
    const [currency, setCurrency] = useState<Currency>('BRL');
    const [swr, setSwr] = useState(4); // Safe Withdrawal Rate %
    const [inflation, setInflation] = useState(3); // Annual Inflation %
    const [selectedMacros, setSelectedMacros] = useState<string[]>(['etf', 'reg_clarity']);

    // Exchange Rates & Current Price
    const [prices, setPrices] = useState<{ BRL: number, USD: number, EUR: number } | null>(null);
    const [exchangeRates, setExchangeRates] = useState<{ USDBRL: number, USDEUR: number } | null>(null);

    // Chart Data
    const [chartData, setChartData] = useState<any>(null);
    const [results, setResults] = useState<any>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch BTC prices and Exchange Rates
                // We need BTC in USD to apply anchors, then convert to selected currency.
                // Also need BRL->USD rate if user inputs BRL.
                const res = await fetch("https://economia.awesomeapi.com.br/last/BTC-USD,USD-BRL,EUR-USD");
                const data = await res.json();

                // data.BTCUSD.bid is BTC in USD
                // data.USDBRL.bid is USD in BRL
                // data.EURUSD.bid is EUR in USD (Wait, usually it's EURUSD. need check. AwesomeAPI returns Pair)

                const btcUsd = parseFloat(data.BTCUSD.bid);
                const usdBrl = parseFloat(data.USDBRL.bid);
                const eurUsd = parseFloat(data.EURUSD.bid); // 1 EUR = X USD

                setPrices({
                    USD: btcUsd,
                    BRL: btcUsd * usdBrl,
                    EUR: btcUsd / eurUsd // Approx
                });

                setExchangeRates({
                    USDBRL: usdBrl,
                    USDEUR: 1 / eurUsd // 1 USD = X EUR
                });

            } catch (error) {
                console.error("Failed to fetch data", error);
            }
        };
        fetchData();
    }, []);

    // Main Calculation Logic
    useEffect(() => {
        if (!prices || !exchangeRates) return;

        const currentYear = new Date().getFullYear();
        const yearsToProject = retirementAge - currentAge;
        if (yearsToProject <= 0) return;

        // 1. Calculate Multiplier from Macros
        let totalMultiplier = 1.0;
        selectedMacros.forEach(id => {
            const macro = MACRO_EVENTS.find(m => m.id === id);
            if (macro) totalMultiplier *= macro.multiplier;
        });

        // 2. Generate Price Paths (USD)
        // We start from current BTCUSD price
        // We iterate year by year. If year matches anchor, we use anchor.
        // If between anchors, we interpolate CAGR.
        // Anchor Logic: Apply Multiplier to Anchors? The source says "Macro multipliers apply adjustments". Let's apply to the target Anchor values.

        const generatePath = (scenario: 'base' | 'bull' | 'bear') => {
            const path: number[] = [];
            const startPrice = prices.USD;
            const sortedYears = Object.keys(USD_ANCHORS).map(Number).sort((a, b) => a - b);

            // Add current year as starting point
            // We need a continuous array of prices for each year from now until retirement (or 2070+)
            // Let's go up to 2080 to cover most cases

            let lastAnchorYear = currentYear;
            let lastAnchorPrice = startPrice;

            // Helper to get anchor price for a scenario
            const getAnchor = (y: number) => USD_ANCHORS[y][scenario] * totalMultiplier;

            // Iterate years
            const maxYear = currentYear + Math.max(yearsToProject + 20, 50); // Project well past retirement
            const fullPath: { year: number, price: number }[] = [];

            // We build segments between anchors
            // Current -> 2028
            // 2028 -> 2033 ...

            // Combine current + fixed anchors into a sorted list
            const allPoints = [
                { year: currentYear, price: startPrice },
                ...sortedYears.map(y => ({ year: y, price: getAnchor(y) }))
            ].sort((a, b) => a.year - b.year);

            // Interpolate
            for (let y = currentYear; y <= maxYear; y++) {
                // Find surrounding anchors
                // P_prev at Y_prev, P_next at Y_next
                let prev = allPoints[0];
                let next = allPoints[allPoints.length - 1];

                for (let i = 0; i < allPoints.length - 1; i++) {
                    if (y >= allPoints[i].year && y <= allPoints[i + 1].year) {
                        prev = allPoints[i];
                        next = allPoints[i + 1];
                        break;
                    }
                }

                // If y is beyond last anchor, define simple growth (e.g. 5%? or flat?)
                // Source says 2075 is last anchor.
                if (y > next.year) {
                    // Extrapolate with last known CAGR or flat
                    const lastCagr = Math.pow(next.price / prev.price, 1 / (next.year - prev.year)) - 1;
                    const val = next.price * Math.pow(1 + lastCagr, y - next.year);
                    fullPath.push({ year: y, price: val });
                } else if (y === prev.year) {
                    fullPath.push({ year: y, price: prev.price });
                } else if (y === next.year) {
                    fullPath.push({ year: y, price: next.price });
                } else {
                    // Interpolate
                    const t = y - prev.year;
                    const T = next.year - prev.year;
                    const cagr = Math.pow(next.price / prev.price, 1 / T) - 1;
                    const val = prev.price * Math.pow(1 + cagr, t);
                    fullPath.push({ year: y, price: val });
                }
            }
            return fullPath;
        };

        const pathBase = generatePath('base');
        const pathBull = generatePath('bull');
        const pathBear = generatePath('bear');

        // 3. Convert Paths to Selected Currency
        const convert = (usdPrice: number) => {
            if (currency === 'USD') return usdPrice;
            if (currency === 'BRL') return usdPrice * exchangeRates.USDBRL;
            if (currency === 'EUR') return usdPrice * exchangeRates.USDEUR;
            return usdPrice;
        };

        // 4. Calculate Portfolio Growth (Accumulation)
        // Monthly Contribution is in selected currency.
        // Needs to be converted to BTC at that year's price.

        const calculatePortfolio = (path: { year: number, price: number }[]) => {
            let btcStack = currentBtc;
            let history = [];

            // Contribution amount (Annual)
            // Ideally we adjust contribution for inflation? "Today's dollars" usually implies constant real contribution.
            // If inputs are in 'nominal' terms, we might increase contribution. 
            // Let's assume User inputs "Real" contribution capability (Today's money).
            const annualContrib = monthlyContribution * 12;

            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                const age = currentAge + (p.year - currentYear);

                // Stop contributing at retirement
                if (age < retirementAge) {
                    // Buy BTC
                    const priceInCur = convert(p.price);
                    const btcBought = annualContrib / priceInCur;
                    btcStack += btcBought;
                }

                // Portfolio Value in Current Currency
                const portValue = btcStack * convert(p.price);

                // Inflation Adjustment? 
                // "Today's Dollars" = Nominal / (1+inf)^(year-now)
                const discount = Math.pow(1 + inflation / 100, p.year - currentYear);
                const realValue = portValue / discount;

                history.push({ year: p.year, age, btc: btcStack, nominal: portValue, real: realValue });
            }
            return history;
        };

        const resBase = calculatePortfolio(pathBase);
        const resBull = calculatePortfolio(pathBull);
        const resBear = calculatePortfolio(pathBear);

        // Prepare Chart Data
        // X-Axis: Age
        const labels = resBase.filter(r => r.age <= retirementAge + 10).map(r => `Idade ${r.age}`);

        // We show Portfolio Value (Real or Nominal? User usually wants Real purchasing power). Let's show Real.
        const dataLength = labels.length;

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Base (Real Purchasing Power)',
                    data: resBase.slice(0, dataLength).map(r => r.real),
                    borderColor: '#f2994a', // Orange
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: 'Bull (Optimistic)',
                    data: resBull.slice(0, dataLength).map(r => r.real),
                    borderColor: '#27ae60', // Green
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                },
                {
                    label: 'Bear (Conservative)',
                    data: resBear.slice(0, dataLength).map(r => r.real),
                    borderColor: '#e74c3c', // Red
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.4
                }
            ]
        });

        // Set Results Snapshot (at Retirement Age)
        const getAtRetirement = (arr: any[]) => arr.find(r => r.age === retirementAge) || arr[arr.length - 1];

        setResults({
            base: getAtRetirement(resBase),
            bull: getAtRetirement(resBull),
            bear: getAtRetirement(resBear),
        });

    }, [currentAge, retirementAge, currentBtc, monthlyContribution, currency, swr, inflation, selectedMacros, prices, exchangeRates]);

    const formatMoney = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: currency, maximumFractionDigits: 0 });
    const formatBtc = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

    const toggleMacro = (id: string) => {
        if (selectedMacros.includes(id)) {
            setSelectedMacros(selectedMacros.filter(m => m !== id));
        } else {
            setSelectedMacros([...selectedMacros, id]);
        }
    };

    return (
        <main className="about-section" style={{ maxWidth: '1200px' }}>
            <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>Calculadora de Aposentadoria Bitcoin</h1>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                Simule cenários macroeconômicos, ajuste inflação e descubra quanto BTC você precisa para se aposentar com segurança.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* Left Column: Chart & Results */}
                <div>
                    {/* Results Cards */}
                    {results && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                            <div className="result-card" style={{ borderTop: '4px solid #e74c3c' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🐻</span>
                                    <span style={{ fontWeight: 'bold', color: '#e74c3c' }}>Bear</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Patrimônio Real</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatMoney(results.bear.real)}</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Renda Mensal (SWR {swr}%)</p>
                                <p style={{ color: 'var(--bitcoin-orange)' }}>{formatMoney((results.bear.real * swr / 100) / 12)}</p>
                            </div>

                            <div className="result-card" style={{ borderTop: '4px solid #f2994a', background: 'rgba(242, 153, 74, 0.1)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>⚖️</span>
                                    <span style={{ fontWeight: 'bold', color: '#f2994a' }}>Base</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Patrimônio Real</p>
                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{formatMoney(results.base.real)}</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Renda Mensal (SWR {swr}%)</p>
                                <p style={{ color: 'var(--bitcoin-orange)', fontWeight: 'bold' }}>{formatMoney((results.base.real * swr / 100) / 12)}</p>
                            </div>

                            <div className="result-card" style={{ borderTop: '4px solid #27ae60' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🐂</span>
                                    <span style={{ fontWeight: 'bold', color: '#27ae60' }}>Bull</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Patrimônio Real</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{formatMoney(results.bull.real)}</p>
                                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Renda Mensal (SWR {swr}%)</p>
                                <p style={{ color: 'var(--bitcoin-orange)' }}>{formatMoney((results.bull.real * swr / 100) / 12)}</p>
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div style={{ height: '400px', background: 'var(--card-bg)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem' }}>
                        {chartData && (
                            <Line
                                data={chartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'top' },
                                        title: { display: true, text: `Projeção de Patrimônio (${currency}) - Poder de Compra Real` }
                                    },
                                    scales: {
                                        y: {
                                            ticks: {
                                                callback: (val) => (val as number).toLocaleString('pt-BR', { notation: 'compact', compactDisplay: 'short' })
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>

                    {/* Model Notes */}
                    <div className="about-content">
                        <h3>Notas e Âncoras do Modelo</h3>
                        <p>Este modelo utiliza interpolação logarítmica entre âncoras de preço futuras para projetar o valor do Bitcoin. As âncoras baseiam-se em cenários de adoção institucional, clareza regulatória e escassez do halving.</p>

                        <h4>Âncoras de Preço (USD) - Cenário Base</h4>
                        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
                            <li style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px' }}>2028: $225k</li>
                            <li style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px' }}>2033: $425k</li>
                            <li style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px' }}>2040: $800k</li>
                            <li style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '4px' }}>2050: $1.9M</li>
                        </ul>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                            * Os valores projetados são ajustados pela inflação informada ({inflation}%) para refletir o poder de compra de hoje.
                        </p>
                    </div>
                </div>

                {/* Right Column: Controls */}
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Configurações</h3>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Moeda</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="calculator-input">
                            <option value="BRL">Real (BRL)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="EUR">Euro (EUR)</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Idade Atual</label>
                        <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="calculator-input" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Idade Aposentadoria</label>
                        <input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="calculator-input" />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">BTC Já Acumulado</label>
                        <input type="number" step="0.0001" value={currentBtc} onChange={e => setCurrentBtc(Number(e.target.value))} className="calculator-input" />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="input-label">Aporte Mensal ({currency})</label>
                        <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(Number(e.target.value))} className="calculator-input" />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="input-label">Taxa Segura de Retirada (SWR) %</label>
                        <input type="number" step="0.1" value={swr} onChange={e => setSwr(Number(e.target.value))} className="calculator-input" />
                    </div>

                    <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

                    <h4 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--primary-green)' }}>Eventos Macro & Bitcoin</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {MACRO_EVENTS.map(macro => (
                            <label key={macro.id} style={{ display: 'flex', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedMacros.includes(macro.id)}
                                    onChange={() => toggleMacro(macro.id)}
                                    style={{ accentColor: 'var(--primary-green)' }}
                                />
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{macro.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{macro.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
