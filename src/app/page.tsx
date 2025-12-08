
"use client";
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Currency = 'BRL' | 'USD' | 'EUR';

type Anchors = {
    [year: number]: { base: number; bull: number; bear: number };
};

type PortfolioHistoryItem = {
    year: number;
    age: number;
    btc: number;
    nominal: number;
    real: number;
    price: number;
    invested: number;
    investedReal: number;
};

type RetirementResult = PortfolioHistoryItem & {
    swrNominalMonthly: number;
    swrRealMonthly: number;
    sliceNominalMonthly: number;
    sliceRealMonthly: number;
    sliceBtcMonthly: number;
    swrBtcMonthly: number;
    gapRealMonthly: number;
    btcNeeded: number;
    yearsInRetirement: number;
};

type ResultsState = {
    base: RetirementResult;
    bull: RetirementResult;
    bear: RetirementResult;
    historyBase: PortfolioHistoryItem[];
    historyBull: PortfolioHistoryItem[];
    historyBear: PortfolioHistoryItem[];
};

const USD_ANCHORS: Anchors = {
    2028: { base: 225000, bull: 450000, bear: 115000 },
    2033: { base: 425000, bull: 1050000, bear: 185000 },
    2040: { base: 800000, bull: 3250000, bear: 350000 },
    2050: { base: 1900000, bull: 10000000, bear: 650000 },
    2075: { base: 3000000, bull: 30000000, bear: 550000 },
};

const MACRO_EVENTS = [
    { id: 'etf', label: 'Forte Fluxo em ETFs', type: 'tailwind', icon: '📈', multiplier: 1.10, desc: 'Entrada persistente de capital institucional e fundos.' },
    { id: 'reg_clarity', label: 'Clareza Regulatória', type: 'tailwind', icon: '⚖️', multiplier: 1.05, desc: 'Regras claras para custódia e impostos.' },
    { id: 'sovereign', label: 'Adoção Soberana', type: 'tailwind', icon: '🏛️', multiplier: 1.15, desc: 'Bancos centrais adicionam BTC às reservas.' },
    { id: 'miner', label: 'Mineração Sustentável', type: 'tailwind', icon: '⚡', multiplier: 1.05, desc: 'Integração energética e segurança da rede.' },
    { id: 'risk_on', label: 'Liquidez Global', type: 'tailwind', icon: '🌊', multiplier: 1.05, desc: 'Queda de juros reais e expansão monetária.' },
    { id: 'tight_liq', label: 'Liquidez Apertada', type: 'headwind', icon: '📉', multiplier: 0.85, desc: 'Juros altos e aperto quantitativo (QT).' },
    { id: 'adv_reg', label: 'Regulação Hostil', type: 'headwind', icon: '🚫', multiplier: 0.85, desc: 'Restrições de acesso ou KYC agressivo.' },
    { id: 'recession', label: 'Recessão Global', type: 'headwind', icon: '🏚️', multiplier: 0.80, desc: 'Choque de demanda e deflação.' },
    { id: 'protocol', label: 'Falha no Protocolo', type: 'headwind', icon: '⚠️', multiplier: 0.70, desc: 'Bug crítico ou perda de confiança técnica.' },
];

const FALLBACK_PRICES = {
    USD: 98000,
    BRL: 98000 * 6.0,
    EUR: 98000 / 1.05
};

const FALLBACK_RATES = {
    USDBRL: 6.0,
    USDEUR: 0.95
};

export default function BitcoinRetirementPage() {
    // Inputs
    const [currentAge, setCurrentAge] = useState(30);
    const [retirementAge, setRetirementAge] = useState(55);
    const [lifeExpectancy, setLifeExpectancy] = useState(90);
    const [currentBtc, setCurrentBtc] = useState(0.1);

    // Contribution State
    const [contributionAmount, setContributionAmount] = useState(0.01);
    const [contributionUnit, setContributionUnit] = useState<'btc' | 'sats'>('btc');
    const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'annual'>('monthly');

    const [targetIncome, setTargetIncome] = useState(10000); // Target Monthly Income in Today's purchasing power

    const [currency, setCurrency] = useState<Currency>('BRL');
    const [swr, setSwr] = useState(4); // Safe Withdrawal Rate %
    const [inflation, setInflation] = useState(3); // Annual Inflation %
    const [selectedMacros, setSelectedMacros] = useState<string[]>(['etf', 'reg_clarity']);

    // Chart State
    const [chartMode, setChartMode] = useState<'fiat' | 'btc'>('fiat');
    const [showBase, setShowBase] = useState(true);
    const [showBull, setShowBull] = useState(true);
    const [showBear, setShowBear] = useState(true);
    const [view, setView] = useState<'chart' | 'table'>('chart');
    const [isLightMode, setIsLightMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Exchange Rates & Current Price
    const [prices, setPrices] = useState<{ BRL: number, USD: number, EUR: number } | null>(null);
    const [exchangeRates, setExchangeRates] = useState<{ USDBRL: number, USDEUR: number } | null>(null);

    const [results, setResults] = useState<ResultsState | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch Data
    const fetchData = async () => {
        setIsLoadingData(true);
        setErrorMsg('');

        try {
            const newPrices = { ...FALLBACK_PRICES };
            const newRates = { ...FALLBACK_RATES };

            // 1. Fetch BTC-USD & BTC-EUR (CoinDesk -> CoinGecko)
            let btcUsd = 0;
            let btcEur = 0;

            try {
                const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                const data = await res.json();
                if (data.bpi && data.bpi.USD) btcUsd = data.bpi.USD.rate_float;
                if (data.bpi && data.bpi.EUR) btcEur = data.bpi.EUR.rate_float;
            } catch (e) {
                console.error("CoinDesk Error:", e);
                try {
                    const resGecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
                    const dataGecko = await resGecko.json();
                    btcUsd = dataGecko.bitcoin.usd;
                    btcEur = dataGecko.bitcoin.eur;
                } catch (e2) {
                    console.error("CoinGecko Error:", e2);
                }
            }

            // 2. Fetch BTC-BRL & USD-BRL (AwesomeAPI)
            let btcBrl = 0;
            let usdBrl = 0;

            try {
                const resAwesome = await fetch("https://economia.awesomeapi.com.br/last/BTC-BRL,USD-BRL");
                const dataAwesome = await resAwesome.json();
                btcBrl = parseFloat(dataAwesome.BTCBRL.bid);
                usdBrl = parseFloat(dataAwesome.USDBRL.bid);
            } catch (e) {
                console.error("AwesomeAPI Error:", e);
            }

            // 3. Consolidate Data
            if (btcUsd > 0) newPrices.USD = btcUsd;
            if (btcEur > 0) newPrices.EUR = btcEur;
            if (btcBrl > 0) newPrices.BRL = btcBrl;

            // Calculate Rates
            // Prefer direct USD-BRL from API, but fallback to implied if needed
            if (usdBrl > 0) {
                newRates.USDBRL = usdBrl;
            } else if (btcUsd > 0 && btcBrl > 0) {
                newRates.USDBRL = btcBrl / btcUsd;
            }

            // Calculate USD-EUR Rate
            if (btcUsd > 0 && btcEur > 0) {
                newRates.USDEUR = btcEur / btcUsd; // 1 USD = (PriceEUR / PriceUSD) EUR ?? No.
                // If 1 BTC = $100k and 1 BTC = €95k.
                // $100k = €95k  =>  $1 = €0.95.
                // So Rate = PriceEUR / PriceUSD. Correct.
                newRates.USDEUR = btcEur / btcUsd;
            }

            setPrices(newPrices);
            setExchangeRates(newRates);

        } catch (error) {
            console.error("Critical error in fetchData:", error);
            setPrices(FALLBACK_PRICES);
            setExchangeRates(FALLBACK_RATES);
            setErrorMsg('Usando preços offline (Erro Crítico)');
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper: Toggle Unit
    const toggleUnit = () => {
        if (contributionUnit === 'btc') {
            setContributionAmount(prev => parseFloat((prev * 100_000_000).toFixed(0)));
            setContributionUnit('sats');
        } else {
            setContributionAmount(prev => prev / 100_000_000);
            setContributionUnit('btc');
        }
    };

    // Main Calculation Logic
    const calculateResults = () => {
        console.log("Calculando resultados...");
        // Ensure prices exist (should be set by fallback if API failed, but double check)
        const activePrices = prices || FALLBACK_PRICES;
        const activeRates = exchangeRates || FALLBACK_RATES;

        // Ensure valid inputs
        if (retirementAge <= currentAge) {
            alert("A idade de aposentadoria deve ser maior que a idade atual.");
            return;
        }

        const currentYear = new Date().getFullYear();
        const yearsToProject = retirementAge - currentAge;

        let totalMultiplier = 1.0;
        selectedMacros.forEach(id => {
            const macro = MACRO_EVENTS.find(m => m.id === id);
            if (macro) totalMultiplier *= macro.multiplier;
        });

        const generatePath = (scenario: 'base' | 'bull' | 'bear') => {
            const startPrice = activePrices.USD;
            const sortedYears = Object.keys(USD_ANCHORS).map(Number).sort((a, b) => a - b);
            const getAnchor = (y: number) => USD_ANCHORS[y][scenario] * totalMultiplier;
            const maxYear = currentYear + Math.max(yearsToProject + 20, 50);
            const fullPath: { year: number, price: number }[] = [];

            const allPoints = [
                { year: currentYear, price: startPrice },
                ...sortedYears.map(y => ({ year: y, price: getAnchor(y) }))
            ].sort((a, b) => a.year - b.year);

            for (let y = currentYear; y <= maxYear; y++) {
                let prev = allPoints[0];
                let next = allPoints[allPoints.length - 1];

                for (let i = 0; i < allPoints.length - 1; i++) {
                    if (y >= allPoints[i].year && y <= allPoints[i + 1].year) {
                        prev = allPoints[i];
                        next = allPoints[i + 1];
                        break;
                    }
                }

                if (y > next.year) {
                    const lastCagr = Math.pow(next.price / prev.price, 1 / (next.year - prev.year)) - 1;
                    const val = next.price * Math.pow(1 + lastCagr, y - next.year);
                    fullPath.push({ year: y, price: val });
                } else if (y === prev.year) {
                    fullPath.push({ year: y, price: prev.price });
                } else if (y === next.year) {
                    fullPath.push({ year: y, price: next.price });
                } else {
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

        const convert = (usdPrice: number) => {
            if (currency === 'USD') return usdPrice;
            if (currency === 'BRL') return usdPrice * activeRates.USDBRL;
            if (currency === 'EUR') return usdPrice * activeRates.USDEUR;
            return usdPrice;
        };

        const calculatePortfolio = (path: { year: number, price: number }[]) => {
            let btcStack = currentBtc;
            const history = [];

            let annualBtc = contributionFrequency === 'monthly' ? contributionAmount * 12 : contributionAmount;
            if (contributionUnit === 'sats') {
                annualBtc = annualBtc / 100_000_000;
            }

            let totalInvested = currentBtc * convert(path[0].price);
            let totalInvestedReal = totalInvested;
            let initialWithdrawalNominal = 0;

            for (let i = 0; i < path.length; i++) {
                const p = path[i];
                const age = currentAge + (p.year - currentYear);
                const priceInCur = convert(p.price);
                const discount = Math.pow(1 + inflation / 100, p.year - currentYear);

                if (age < retirementAge) {
                    // Accumulation
                    btcStack += annualBtc;
                    const costNominal = annualBtc * priceInCur;
                    totalInvested += costNominal;
                    totalInvestedReal += costNominal / discount;
                } else if (age > retirementAge) {
                    // Decumulation (Drawdown)
                    if (initialWithdrawalNominal === 0) {
                        // Set base withdrawal from previous year's peak (approx) or current value
                        // Using current value at start of first drawdown year effectively
                        // But calculate based on what the SWR WOULD have been at retirement age?
                        // Ideally we want 4% of Peak. 
                        // Peak was roughly year "retirementAge".
                        // We are now at "retirementAge + 1" or later.
                        // Let's estimate Peak Value based on current stack * price?
                        // Or better: The first time we enter here, we set the Base.
                        const portVal = btcStack * priceInCur;
                        // We assume the Portfolio Value at this moment is the basis for SWR in this simulation leg
                        initialWithdrawalNominal = portVal * (swr / 100);
                    }

                    const t = age - retirementAge; // Years since retirement
                    // Adjust withdrawal for inflation
                    const withdrawal = initialWithdrawalNominal * Math.pow(1 + inflation / 100, t);

                    const btcToSell = withdrawal / priceInCur;
                    btcStack -= btcToSell;
                    if (btcStack < 0) btcStack = 0;
                }
                // If age === retirementAge, we hold (Transition Year) - preserves Peak for Result Cards

                const portValue = btcStack * priceInCur;
                const realValue = portValue / discount;

                history.push({
                    year: p.year,
                    age,
                    btc: btcStack,
                    nominal: portValue,
                    real: realValue,
                    price: priceInCur,
                    invested: totalInvested,
                    investedReal: totalInvestedReal
                });
            }
            return history;
        };

        const resBase = calculatePortfolio(pathBase);
        const resBull = calculatePortfolio(pathBull);
        const resBear = calculatePortfolio(pathBear);

        const getAtRetirement = (arr: PortfolioHistoryItem[]) => {
            const r = arr.find(item => item.age === retirementAge) || arr[arr.length - 1];
            const yearsInRetirement = Math.max(1, lifeExpectancy - retirementAge);

            // Monthly Calculations
            const swrNominalMonthly = (r.nominal * swr / 100) / 12;
            const swrRealMonthly = (r.real * swr / 100) / 12; // This compares to Target (Real)

            const sliceNominalMonthly = (r.nominal / yearsInRetirement) / 12;
            const sliceRealMonthly = (r.real / yearsInRetirement) / 12;

            const sliceBtcMonthly = (r.btc / yearsInRetirement) / 12;
            const swrBtcMonthly = (r.btc * swr / 100) / 12;

            const gapRealMonthly = swrRealMonthly - targetIncome;

            const priceReal = r.btc > 0 ? r.real / r.btc : 0; // Prevent div by zero
            // Sanity check for priceReal to prevent infinite btcNeeded
            const safePriceReal = priceReal > 0 ? priceReal : 1;
            const swrFactor = (swr / 100) / 12;

            const btcNeeded = (gapRealMonthly < 0 && swrFactor > 0)
                ? Math.abs(gapRealMonthly) / (safePriceReal * swrFactor)
                : 0;

            return {
                ...r,
                swrNominalMonthly,
                swrRealMonthly,
                sliceNominalMonthly,
                sliceRealMonthly,
                sliceBtcMonthly,
                swrBtcMonthly,
                gapRealMonthly,
                btcNeeded,
                yearsInRetirement
            };
        };

        const resultObj = {
            base: getAtRetirement(resBase),
            bull: getAtRetirement(resBull),
            bear: getAtRetirement(resBear),
            historyBase: resBase,
            historyBull: resBull,
            historyBear: resBear,
        };

        console.log("Results Calculated:", resultObj);
        setResults(resultObj);
        // Scroll to results
        setTimeout(() => {
            const el = document.getElementById('results-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const formatMoney = (val: number) => {
        if (isNaN(val)) return "R$ 0,00";
        return val.toLocaleString('pt-BR', { style: 'currency', currency: currency, maximumFractionDigits: 0 });
    };
    const formatBtc = (val: number) => {
        if (isNaN(val)) return "0.0000";
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    };

    const toggleMacro = (id: string) => {
        if (selectedMacros.includes(id)) {
            setSelectedMacros(selectedMacros.filter(m => m !== id));
        } else {
            setSelectedMacros([...selectedMacros, id]);
        }
    };

    const renderMetricRow = (label: string, value: string, subValue?: string) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>{value}</div>
                {subValue && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{subValue}</div>}
            </div>
        </div>
    );

    const renderResultCard = (title: string, data: RetirementResult, color: string, icon: string) => {
        if (!data) return null;
        const isTargetMet = data.gapRealMonthly >= 0;
        return (
            <div className="result-card" style={{ borderLeft: `4px solid ${color}`, padding: '1.5rem', background: 'var(--card-bg)', borderRadius: '12px', color: 'var(--text-main)', opacity: 1, transform: 'none', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                    <span style={{ fontWeight: 'bold', color: color, fontSize: '1.3rem' }}>{title}</span>
                    <span style={{ fontSize: '0.8rem', background: `rgba(${color === '#f2994a' ? '242, 153, 74' : color === '#27ae60' ? '39, 174, 96' : '231, 76, 60'}, 0.1)`, color: color, padding: '4px 10px', borderRadius: '12px', marginLeft: 'auto' }}>
                        {isTargetMet ? 'Meta Atingida' : 'Abaixo da Meta'}
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {/* Header Stats */}
                    <div style={{ gridColumn: '1/-1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="stat-block" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Patrimônio em BTC</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{formatBtc(data.btc)} <span style={{ fontSize: '0.8rem' }}>BTC</span></div>
                        </div>
                        <div className="stat-block" style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Patrimônio Nominal</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: color }}>{formatMoney(data.nominal)}</div>
                            <div style={{ fontSize: '0.85rem', color: data.nominal >= data.invested ? '#27ae60' : '#e74c3c', marginTop: '4px', fontWeight: 'bold' }}>
                                ROI Nominal: {((data.nominal - data.invested) / data.invested * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0, signDisplay: 'always' })}%
                            </div>
                        </div>
                    </div>

                    {/* Detailed Metrics */}
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ fontSize: '0.9rem', color: color, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Renda Mensal: Método Retirada ({swr}%)</h5>
                        {renderMetricRow('Retirada Nominal (1º Ano)', formatMoney(data.swrNominalMonthly))}
                        {renderMetricRow('Retirada Real (Poder de Compra)', formatMoney(data.swrRealMonthly))}
                        {renderMetricRow('Retirada em BTC', `${formatBtc(data.swrBtcMonthly)} BTC`)}
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <h5 style={{ fontSize: '0.9rem', color: color, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Renda Mensal: Fatias Iguais ({data.yearsInRetirement} Anos)</h5>
                        {renderMetricRow('Nominal (Simples Divisão)', formatMoney(data.sliceNominalMonthly))}
                        {renderMetricRow('Real (Ajustado Inflação)', formatMoney(data.sliceRealMonthly))}
                        {renderMetricRow('Fatia em BTC', `${formatBtc(data.sliceBtcMonthly)} BTC`)}
                    </div>
                </div>

                {/* Gap Analysis */}
                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: isTargetMet ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)',
                    border: `1px solid ${isTargetMet ? '#27ae60' : '#e74c3c'}`
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: isTargetMet ? '#27ae60' : '#e74c3c', fontWeight: 'bold', marginBottom: '4px' }}>
                                {isTargetMet
                                    ? `✅ Você excede sua meta mensal em ${formatMoney(data.gapRealMonthly)}`
                                    : `⚠️ Faltam ${formatMoney(Math.abs(data.gapRealMonthly))} mensais para sua meta`
                                }
                            </div>
                            {!isTargetMet && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    BTC Adicional Necessário (Hoje): <strong style={{ color: 'var(--text-main)' }}>{formatBtc(data.btcNeeded)} BTC</strong>
                                </div>
                            )}
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '1.5rem', fontWeight: 'bold', color: isTargetMet ? '#27ae60' : '#e74c3c' }}>
                            {formatMoney(data.swrRealMonthly)} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/ mês</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="about-section" style={{ maxWidth: '1400px', padding: '2rem 5%' }}>
            <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Calculadora de Aposentadoria Bitcoin</h1>
            <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-secondary)', maxWidth: '800px', marginInline: 'auto' }}>
                Simule cenários macroeconômicos, ajuste inflação e descubra quanto BTC você precisa para se aposentar com segurança.
            </p>

            {errorMsg && (
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#f2994a', fontSize: '0.8rem' }}>
                    ⚠️ {errorMsg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                {/* Inputs Column - Modified layout */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', minHeight: '32px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            ⚙️ Configurações
                        </h2>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', height: 'fit-content' }}>
                        {/* Display Prices Safely - Moved Inside */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#f2994a', fontWeight: 'bold' }}>
                                    {prices ? formatMoney(currency === 'USD' ? prices.USD : currency === 'BRL' ? prices.BRL : prices.EUR) : '---'}
                                </span>
                                <button
                                    onClick={fetchData}
                                    title="Atualizar Preço"
                                    disabled={isLoadingData}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary)',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: isLoadingData ? 0.5 : 1
                                    }}
                                >
                                    🔄
                                </button>
                            </div>
                            {prices && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    1 {currency} ≈ {Math.floor(100_000_000 / (currency === 'USD' ? prices.USD : currency === 'BRL' ? prices.BRL : prices.EUR)).toLocaleString('pt-BR')} sats
                                </span>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="input-label" style={{ fontSize: '0.8rem' }}>Moeda</label>
                                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="calculator-input" style={{ width: '100%' }}>
                                    <option value="BRL">BRL (R$)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="input-label" style={{ fontSize: '0.8rem' }}>Idade Atual</label>
                                <input type="number" value={currentAge} onChange={e => setCurrentAge(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label className="input-label" style={{ fontSize: '0.8rem' }}>Aposentadoria</label>
                                <input type="number" value={retirementAge} onChange={e => setRetirementAge(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                            </div>
                        </div>

                        {/* Target Income Input */}
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem', color: '#f2994a' }}>Renda Mensal Desejada (Valores de Hoje)</label>
                            <input type="number" value={targetIncome} onChange={e => setTargetIncome(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label className="input-label" style={{ fontSize: '0.8rem' }}>Expectativa Vida</label>
                                <input type="number" value={lifeExpectancy} onChange={e => setLifeExpectancy(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                            </div>
                            <div>
                                <label className="input-label" style={{ fontSize: '0.8rem' }}>Inflação Anual (%)</label>
                                <input type="number" step="0.1" value={inflation} onChange={e => setInflation(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>Taxa de Retirada Segura (%)</label>
                            <input type="number" step="0.1" value={swr} onChange={e => setSwr(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label className="input-label" style={{ fontSize: '0.8rem' }}>BTC Já Acumulado</label>
                            <input type="number" step="0.0001" value={currentBtc} onChange={e => setCurrentBtc(Number(e.target.value))} className="calculator-input" style={{ width: '100%' }} />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label className="input-label" style={{ fontSize: '0.8rem', margin: 0 }}>
                                        Aporte ({contributionUnit === 'btc' ? 'BTC' : 'Sats'})
                                    </label>
                                    <button
                                        onClick={toggleUnit}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            fontSize: '0.7rem',
                                            color: '#f2994a',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            padding: 0
                                        }}
                                    >
                                        (Mudar p/ {contributionUnit === 'btc' ? 'Sats' : 'BTC'})
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                                    <span
                                        onClick={() => setContributionFrequency('monthly')}
                                        style={{
                                            cursor: 'pointer',
                                            color: contributionFrequency === 'monthly' ? '#f2994a' : 'var(--text-secondary)',
                                            fontWeight: contributionFrequency === 'monthly' ? 'bold' : 'normal',
                                            textDecoration: contributionFrequency === 'monthly' ? 'underline' : 'none'
                                        }}
                                    >
                                        Mensal
                                    </span>
                                    <span style={{ color: 'var(--border-color)' }}>|</span>
                                    <span
                                        onClick={() => setContributionFrequency('annual')}
                                        style={{
                                            cursor: 'pointer',
                                            color: contributionFrequency === 'annual' ? '#f2994a' : 'var(--text-secondary)',
                                            fontWeight: contributionFrequency === 'annual' ? 'bold' : 'normal',
                                            textDecoration: contributionFrequency === 'annual' ? 'underline' : 'none'
                                        }}
                                    >
                                        Anual
                                    </span>
                                </div>
                            </div>
                            <input
                                type="number"
                                step={contributionUnit === 'btc' ? "0.0001" : "1"}
                                value={contributionAmount}
                                onChange={e => setContributionAmount(Number(e.target.value))}
                                className="calculator-input"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                        <button
                            onClick={calculateResults}
                            className="cta-button"
                            style={{
                                width: '100%',
                                background: '#f2994a', // Bitcoin Orange
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'transform 0.2s',
                                boxShadow: '0 4px 6px rgba(242, 153, 74, 0.2)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Simular Cenários
                        </button>
                    </div>
                </div>

                {/* Macros Column */}
                <div>
                    <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        🌍 Eventos Macro
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {MACRO_EVENTS.map(macro => {
                            const isSelected = selectedMacros.includes(macro.id);
                            const isTailwind = macro.type === 'tailwind';
                            return (
                                <div
                                    key={macro.id}
                                    onClick={() => toggleMacro(macro.id)}
                                    style={{
                                        background: isSelected ? (isTailwind ? 'rgba(39, 174, 96, 0.15)' : 'rgba(231, 76, 60, 0.15)') : 'var(--bg-secondary)',
                                        border: `1px solid ${isSelected ? (isTailwind ? '#27ae60' : '#e74c3c') : 'var(--border-color)'}`,
                                        borderRadius: '10px',
                                        padding: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{
                                        fontSize: '1.2rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        width: '40px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px'
                                    }}>
                                        {macro.icon}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-main)' }}>{macro.label}</span>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: isTailwind ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)',
                                                color: isTailwind ? '#27ae60' : '#e74c3c',
                                                fontWeight: 'bold'
                                            }}>
                                                {isTailwind ? 'BULL' : 'BEAR'}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.3' }}>
                                            {macro.desc}
                                        </div>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <div style={{
                                            width: '18px',
                                            height: '18px',
                                            borderRadius: '50%',
                                            border: '2px solid',
                                            borderColor: isSelected ? (isTailwind ? '#27ae60' : '#e74c3c') : '#666',
                                            background: isSelected ? (isTailwind ? '#27ae60' : '#e74c3c') : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {isSelected && <span style={{ color: '#fff', fontSize: '10px' }}>✓</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Share Buttons */}
                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <a href={`https://twitter.com/intent/tweet?text=Confira%20esta%20calculadora%20de%20aposentadoria%20Bitcoin!&url=https://viverdebitcoin.com/aposentadoria-bitcoin`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>
                            𝕏
                        </a>
                        <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>
                            IG
                        </a>
                        <a href={`https://wa.me/?text=Confira%20esta%20calculadora%20de%20aposentadoria%20Bitcoin!%20https://viverdebitcoin.com/aposentadoria-bitcoin`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center' }}>
                            WhatsApp
                        </a>
                    </div>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Compartilhe com a família e amigos!
                    </p>
                </div>
            </div>

            {/* 4. RESULTS CARDS */}
            {
                results && (
                    <div id="results-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>

                        {/* Timeline Summary Card */}
                        <div style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-around',
                            flexWrap: 'wrap',
                            gap: '1.5rem',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Anos até Aposentadoria</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f2994a' }}>{retirementAge - currentAge} anos</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Ano da Aposentadoria</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{new Date().getFullYear() + (retirementAge - currentAge)}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Anos na Aposentadoria</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>{Math.max(1, lifeExpectancy - retirementAge)} anos</div>
                            </div>
                        </div>

                        {renderResultCard('Base', results.base, '#f2994a', '⚖️')}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {renderResultCard('Bull', results.bull, '#27ae60', '🐂')}
                            {renderResultCard('Bear', results.bear, '#e74c3c', '🐻')}
                        </div>

                        {/* Chart Section */}
                        <div style={{
                            background: 'var(--card-bg)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            marginTop: '1rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>
                                    📈 Projeção de Patrimônio
                                </h2>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Scenario Filters */}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#f2994a', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={showBase} onChange={e => setShowBase(e.target.checked)} /> Base
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#27ae60', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={showBull} onChange={e => setShowBull(e.target.checked)} /> Bull
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.9rem', color: '#e74c3c', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={showBear} onChange={e => setShowBear(e.target.checked)} /> Bear
                                        </label>
                                    </div>

                                    {/* Mode Toggle */}
                                    <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '6px' }}>
                                        <button
                                            onClick={() => setChartMode('fiat')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                background: chartMode === 'fiat' ? 'var(--card-bg)' : 'transparent',
                                                color: chartMode === 'fiat' ? 'var(--text-main)' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                boxShadow: chartMode === 'fiat' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                            }}
                                        >
                                            Nominal ({currency})
                                        </button>
                                        <button
                                            onClick={() => setChartMode('btc')}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '4px',
                                                background: chartMode === 'btc' ? 'var(--card-bg)' : 'transparent',
                                                color: chartMode === 'btc' ? 'var(--text-main)' : 'var(--text-secondary)',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                boxShadow: chartMode === 'btc' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                            }}
                                        >
                                            BTC
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* View Switcher */}
                            <div className="view-switcher" style={{ margin: '0 0 1rem 0', justifyContent: 'flex-start' }}>
                                <button className={`view-btn ${view === 'chart' ? 'active' : ''}`} onClick={() => setView('chart')}>Gráfico</button>
                                <button className={`view-btn ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>Tabela</button>
                            </div>

                            <div style={{ height: '350px', width: '100%', display: view === 'chart' ? 'block' : 'none' }}>
                                <Line
                                    data={{
                                        labels: results.historyBase.map(i => i.age),
                                        datasets: [
                                            {
                                                label: 'Cenário Base',
                                                data: results.historyBase.map(i => chartMode === 'btc' ? i.btc : i.nominal),
                                                borderColor: '#f2994a',
                                                backgroundColor: 'rgba(242, 153, 74, 0.1)',
                                                borderWidth: 2,
                                                pointRadius: 0,
                                                fill: false,
                                                hidden: !showBase
                                            },
                                            {
                                                label: 'Cenário Bull',
                                                data: results.historyBull.map(i => chartMode === 'btc' ? i.btc : i.nominal),
                                                borderColor: '#27ae60',
                                                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                                                borderWidth: 2,
                                                pointRadius: 0,
                                                fill: false,
                                                hidden: !showBull
                                            },
                                            {
                                                label: 'Cenário Bear',
                                                data: results.historyBear.map(i => chartMode === 'btc' ? i.btc : i.nominal),
                                                borderColor: '#e74c3c',
                                                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                                borderWidth: 2,
                                                pointRadius: 0,
                                                fill: false,
                                                hidden: !showBear
                                            }
                                        ]
                                    }}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        interaction: {
                                            mode: 'index',
                                            intersect: false,
                                        },
                                        plugins: {
                                            legend: {
                                                position: 'top',
                                                labels: { color: isLightMode ? '#5e6d7e' : '#cccccc' }
                                            },
                                            tooltip: {
                                                callbacks: {
                                                    label: function (context) {
                                                        let label = context.dataset.label || '';
                                                        if (label) {
                                                            label += ': ';
                                                        }
                                                        if (context.parsed.y !== null) {
                                                            if (chartMode === 'btc') {
                                                                label += context.parsed.y.toFixed(4) + ' BTC';
                                                            } else {
                                                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(context.parsed.y);
                                                            }
                                                        }
                                                        return label;
                                                    }
                                                }
                                            }
                                        },
                                        scales: {
                                            x: {
                                                title: { display: true, text: 'Idade', color: isLightMode ? '#5e6d7e' : '#cccccc' },
                                                ticks: { color: isLightMode ? '#5e6d7e' : '#cccccc' },
                                                grid: { color: isLightMode ? '#cccccc' : 'rgba(255, 255, 255, 0.05)' }
                                            },
                                            y: {
                                                ticks: { color: isLightMode ? '#5e6d7e' : '#cccccc' },
                                                grid: { color: isLightMode ? '#cccccc' : 'rgba(255, 255, 255, 0.05)' }
                                            }
                                        }
                                    }}
                                />
                            </div>

                            {view === 'table' && (
                                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-secondary)' }}>Idade</th>
                                                <th style={{ textAlign: 'left', padding: '10px', color: 'var(--text-secondary)' }}>Ano</th>
                                                {showBase && <th style={{ textAlign: 'right', padding: '10px', color: '#f2994a' }}>Base</th>}
                                                {showBull && <th style={{ textAlign: 'right', padding: '10px', color: '#27ae60' }}>Bull</th>}
                                                {showBear && <th style={{ textAlign: 'right', padding: '10px', color: '#e74c3c' }}>Bear</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {results.historyBase.map((item, i) => {
                                                const year = new Date().getFullYear() + (item.age - currentAge);
                                                const fmt = (v: number) => chartMode === 'btc' ? v.toFixed(4) + ' ₿' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(v);
                                                return (
                                                    <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                        <td style={{ padding: '10px', color: 'var(--text-main)' }}>{item.age}</td>
                                                        <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{year}</td>
                                                        {showBase && <td style={{ textAlign: 'right', padding: '10px', color: 'var(--text-main)' }}>{fmt(chartMode === 'btc' ? item.btc : item.nominal)}</td>}
                                                        {showBull && <td style={{ textAlign: 'right', padding: '10px', color: 'var(--text-main)' }}>{fmt(chartMode === 'btc' ? results.historyBull[i].btc : results.historyBull[i].nominal)}</td>}
                                                        {showBear && <td style={{ textAlign: 'right', padding: '10px', color: 'var(--text-main)' }}>{fmt(chartMode === 'btc' ? results.historyBear[i].btc : results.historyBear[i].nominal)}</td>}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Explanations & How it Works */}
            <div className="about-content" style={{ fontSize: '0.9rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', marginTop: '3rem', border: '1px solid var(--border-color)' }}>
                <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontSize: '1.4rem' }}>Calculadora de Aposentadoria Bitcoin — Como Funciona?</h2>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    A Calculadora de Aposentadoria Bitcoin projeta quanto BTC você precisa acumular para garantir uma renda mensal segura no futuro. Ela combina trajetórias macroeconômicas do preço do Bitcoin, cenários Base, Bull e Bear, inflação, expectativa de vida e seu aporte mensal em BTC ou sats.
                </p>

                <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Ao informar sua idade, idade de aposentadoria, renda desejada, inflação e taxa de retirada segura (SWR), o modelo calcula:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>BTC acumulado até a aposentadoria</li>
                    <li>Valor nominal do patrimônio em cada cenário</li>
                    <li>Renda mensal estimada, ajustada pela inflação</li>
                    <li>Comparação com sua meta de renda</li>
                    <li>Projeção ano a ano (gráfico e tabela)</li>
                    <li>Impacto dos eventos macro (ETFs, liquidez, regulamentação, recessão, etc.)</li>
                </ul>

                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    O objetivo é mostrar, de forma clara e auditável, seu possível poder de compra futuro usando Bitcoin como ativo de longo prazo.
                </p>

                <h2 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem', fontSize: '1.4rem' }}>O que esperar dos resultados</h2>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Os cenários exibem três trajetórias possíveis:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li><strong>Base</strong> – projeção neutra</li>
                    <li><strong>Bull</strong> – adoção acelerada</li>
                    <li><strong>Bear</strong> – ambiente adverso</li>
                </ul>

                <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>O relatório mostra:</p>
                <ul style={{ paddingLeft: '20px', marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <li>Patrimônio final em BTC e na sua moeda</li>
                    <li>Renda mensal estimada pelo método dos 4% e pelo método Fatias Iguais</li>
                    <li>Se sua meta financeira é atingida ou não</li>
                    <li>Um gráfico claro da evolução do seu patrimônio até os 90 anos</li>
                </ul>

                <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    Você vê exatamente quanto BTC precisa acumular para viver com segurança — e como diferentes condições macroeconômicas podem afetar seus planos.
                </p>

                <div style={{ padding: '1.5rem', background: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c', borderRadius: '8px' }}>
                    <h4 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>Aviso Importante (Disclaimer)</h4>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        Esta calculadora é uma ferramenta educacional de planejamento financeiro e não constitui recomendação de investimento, consultoria financeira ou garantia de resultados futuros.
                    </p>
                    <p style={{ marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        O Bitcoin é um ativo volátil e todos os cenários são simulações hipotéticas. Sempre revise suas decisões com um profissional qualificado e pratique boa autocustódia, armazenando BTC de forma segura.
                    </p>
                </div>
            </div>

            {/* 5. MODEL NOTES */}
            <div className="about-content" style={{ fontSize: '0.9rem', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '3rem' }}>
                <h4 style={{ marginTop: 0, fontSize: '1.2rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
                    📌 Notas do Modelo e Âncoras
                </h4>
                <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    Esta calculadora combina um modelo transparente de trajetória de preço com alternadores macroeconômicos e dois métodos de gastos na aposentadoria. Tudo abaixo é editável e projetado para ser fácil de auditar.
                    <br /><br />
                    Esta ferramenta é para planejamento de cenários; <strong>não é conselho de investimento</strong>. Edite os parâmetros para refletir sua própria visão.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Column 1: Formula & Anchors */}
                    <div>
                        <h5 style={{ fontSize: '1rem', color: '#f2994a', marginBottom: '0.8rem' }}>Fórmula da Trajetória de Preço</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            As faixas de âncora em 2028, 2033, 2040, 2050 e 2075 para Base, Bull e Bear representam pontos médios direcionais baseados em cenários amplamente discutidos (adoção de ETFs, clareza regulatória, diversificação de reservas, economia dos mineradores).
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            <strong>Interpolação logarítmica:</strong> calculamos a taxa de crescimento anual composta (CAGR) entre âncoras adjacentes e projetamos para o ano da sua aposentadoria.
                        </p>
                        <div style={{ background: 'var(--bg-secondary)', padding: '0.8rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            CAGR = (Pt2 / Pt1)^(1/(t2−t1)) − 1<br />
                            Pret = Pt1 · (1 + CAGR)^(ret−t1)
                        </div>

                        <h5 style={{ fontSize: '1rem', color: '#f2994a', marginBottom: '0.8rem' }}>Âncoras Atuais (USD)</h5>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '4px' }}><strong>2028:</strong> Base $225k, Bull $450k, Bear $115k</li>
                            <li style={{ marginBottom: '4px' }}><strong>2033:</strong> Base $425k, Bull $1.05M, Bear $185k</li>
                            <li style={{ marginBottom: '4px' }}><strong>2040:</strong> Base $800k, Bull $3.25M, Bear $350k</li>
                            <li style={{ marginBottom: '4px' }}><strong>2050:</strong> Base $1.9M, Bull $10M, Bear $650k</li>
                            <li style={{ marginBottom: '4px' }}><strong>2075:</strong> Base $3M, Bull $30M, Bear $550k</li>
                        </ul>
                    </div>

                    {/* Column 2: Macros & Math */}
                    <div>
                        <h5 style={{ fontSize: '1rem', color: '#f2994a', marginBottom: '0.8rem' }}>Lógica dos Alternadores Macro</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Os multiplicadores macro aplicam ajustes multiplicativos por cenário. Exemplo: se o cenário Base tem +10% de fluxos de ETF e -15% de liquidez restrita, o multiplicador líquido será 1.10 × 0.85 = 0.935.
                        </p>
                        <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '4px' }}><strong>Fortes fluxos de ETF:</strong> eleva Base/Bull mais do que Bear.</li>
                            <li style={{ marginBottom: '4px' }}><strong>Clareza regulatória:</strong> reduz risco de cauda (Bear).</li>
                            <li style={{ marginBottom: '4px' }}><strong>Reservas Soberanas:</strong> adoção simbólica mas poderosa (Bull).</li>
                            <li style={{ marginBottom: '4px' }}><strong>Energia e Mineração:</strong> reduz risco operacional.</li>
                            <li style={{ marginBottom: '4px' }}><strong>Liquidez Global:</strong> correlação com ativos de risco.</li>
                        </ul>

                        <h5 style={{ fontSize: '1rem', color: '#f2994a', marginBottom: '0.8rem' }}>Matemática de Portfólio</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            <strong>BTC na aposentadoria</strong> = BTC atual + (Compras anuais × Anos).<br />
                            <strong>Portfólio</strong> = BTC Final × Preço no Cenário.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0' }}>
                            *Todos os valores de gastos são trazidos a <strong>Valor Presente</strong> (descontados pela inflação) para refletir o poder de compra de hoje.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <h5 style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.8rem' }}>📚 Fontes e Leitura Adicional</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>
                            <strong>Emissão do Bitcoin:</strong> <a href="https://www.unchained.com/blog/bitcoin-source-code-21-million" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>Unchained: The 21M supply in code</a> · <a href="https://bitcoinmagazine.com/guides/when-is-the-next-bitcoin-halving" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>Bitcoin Magazine: Halving primer</a>.
                        </div>
                        <div>
                            <strong>ETFs Spot (EUA):</strong> <a href="https://www.sec.gov/newsroom/speeches-statements/gensler-statement-spot-bitcoin-011023" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>SEC Chair statement</a> · <a href="https://www.congress.gov/crs_external_products/IF/PDF/IF12573/IF12573.2.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>CRS explainer</a>.
                        </div>
                        <div>
                            <strong>Mineração e Energia:</strong> <a href="https://cpowerenergy.com/vpps-and-flexible-demand-response-bitcoin-mining-flexes-its-capabilities/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>cPower: miners as flexible load</a> · <a href="https://www.mara.com/posts/the-duke-study-bitcoin-mining-and-the-future-of-grid-stability" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>Duke study summary</a>.
                        </div>
                        <div>
                            <strong>Fluxos de ETFs:</strong> <a href="https://www.blackrock.com/us/individual/products/333011/ishares-bitcoin-trust" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>BlackRock IBIT facts</a> · <a href="https://cryptoslate.com/insights/blackrocks-bitcoin-fund-ibit-hits-top-3-us-etfs-by-inflow-for-2024/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>CryptoSlate/Bloomberg on 2024 flows</a>.
                        </div>
                        <div>
                            <strong>Taxa de Retirada Segura (SWR):</strong> <a href="https://www.financialplanningassociation.org/sites/default/files/2021-04/MAR04%20Determining%20Withdrawal%20Rates%20Using%20Historical%20Data.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>Bengen (1994) PDF</a>.
                        </div>
                        <div>
                            <strong>Stock-to-Flow (S2F):</strong> <a href="https://www.emerald.com/sef/article/39/3/506/511921/Dissecting-the-stock-to-flow-model-for-Bitcoin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-green)', textDecoration: 'none' }}>Emerald: dissecting S2F</a>.
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
