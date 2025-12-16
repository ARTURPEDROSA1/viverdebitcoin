"use client";
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useSettings } from '@/contexts/SettingsContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SatoshiCalculator() {
    // State definitions
    // State definitions
    const { t, language } = useSettings();
    const currency = 'BRL'; // Force specific currency for this calculator
    const [inputAmount, setInputAmount] = useState<number | string>(100);
    // Removed local currency state
    const [annualIncrease, setAnnualIncrease] = useState<number>(5);
    const [currentAge, setCurrentAge] = useState<number>(25);
    const [retirementAge, setRetirementAge] = useState<number>(45);
    const [btcGrowthRate, setBtcGrowthRate] = useState<number>(30);

    const [initialInvestment, setInitialInvestment] = useState<number | string>(0);
    const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'annual'>('monthly');

    // Prices
    const [prices, setPrices] = useState<{ BRL: number, USD: number, EUR: number } | null>(null);

    // Chart Data State
    const [chartData, setChartData] = useState<any>(null);
    const [calculatedSats, setCalculatedSats] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [resultSummary, setResultSummary] = useState<any>(null);
    const [isLightMode, setIsLightMode] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Fetch BTC prices
    const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

    // Derived values for UI
    const yearsUntilRet = Math.max(0, retirementAge - currentAge);
    const currentYear = new Date().getFullYear();
    const retYear = currentYear + yearsUntilRet;

    // Fetch BTC prices
    const fetchPrices = async () => {
        setLoadingPrice(true);
        try {
            const newPrices = { BRL: 0, USD: 0, EUR: 0 };

            // USD & EUR (CoinDesk with CoinGecko fallback)
            try {
                const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                const data = await res.json();

                if (data.bpi && data.bpi.USD) {
                    newPrices.USD = data.bpi.USD.rate_float;
                }
                if (data.bpi && data.bpi.EUR) {
                    newPrices.EUR = data.bpi.EUR.rate_float;
                }
            } catch (e) {
                console.error("Error fetching USD/EUR from CoinDesk:", e);
                // Fallback to CoinGecko
                try {
                    const resCoingecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
                    const dataCoingecko = await resCoingecko.json();
                    newPrices.USD = dataCoingecko.bitcoin.usd;
                    newPrices.EUR = dataCoingecko.bitcoin.eur;
                } catch (e2) {
                    console.error("Error fetching USD/EUR from CoinGecko:", e2);
                }
            }

            // BRL from AwesomeAPI (Independent)
            try {
                const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                const dataBRL = await resBRL.json();
                newPrices.BRL = parseFloat(dataBRL.BTCBRL.bid);
            } catch (e) {
                console.error("Error fetching BRL:", e);
                newPrices.BRL = 466000; // Manual fallback
            }

            // Update state safely (only if values differ significantly or if completely missing)
            setPrices(prev => ({
                BRL: newPrices.BRL || (prev?.BRL ?? 0),
                USD: newPrices.USD || (prev?.USD ?? 0),
                EUR: newPrices.EUR || (prev?.EUR ?? 0),
            }));

        } catch (error) {
            console.error("Erro geral ao buscar preços BTC:", error);
        } finally {
            setLoadingPrice(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    useEffect(() => {
        const checkTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const handleCalculate = () => {
        if (!prices) return;

        const currentPrice = prices[currency];
        const yearsToInvest = retirementAge - currentAge;

        if (yearsToInvest <= 0) {
            setChartData(null);
            setResultSummary(null);
            return;
        }

        // 1. Initial Investment in Sats
        const initialInvVal = typeof initialInvestment === 'string' ? parseFloat(initialInvestment) || 0 : initialInvestment;
        const initialSats = (initialInvVal / currentPrice) * 100000000;

        // 2. Base Annual Sats Contribution
        let annualSatsBase = 0;
        const inputAmtVal = typeof inputAmount === 'string' ? parseFloat(inputAmount) || 0 : inputAmount;

        if (contributionFrequency === 'monthly') {
            annualSatsBase = ((inputAmtVal * 12) / currentPrice) * 100000000;
        } else {
            annualSatsBase = (inputAmtVal / currentPrice) * 100000000;
        }

        setCalculatedSats(annualSatsBase / 12); // Approximate monthly ref

        const labels = [];
        const patrimonyBrl = [];
        const totalBtcAccumulated = [];

        let currentAnnualSats = annualSatsBase;
        let accumulatedSats = initialSats;
        // Projection uses current price as baseline
        let projectedBtcPrice = currentPrice;

        for (let year = 1; year <= yearsToInvest; year++) {
            // Add contribution for this year
            accumulatedSats += currentAnnualSats;

            // Increase contribution for next year (User increases investment)
            currentAnnualSats = currentAnnualSats * (1 + annualIncrease / 100);

            // Project BTC Price
            projectedBtcPrice = projectedBtcPrice * (1 + btcGrowthRate / 100);

            // Calculate Patrimony in Selected Currency
            const accumulatedBtc = accumulatedSats / 100000000;
            const patrimonyValue = accumulatedBtc * projectedBtcPrice;

            labels.push(`Idade ${currentAge + year}`);
            patrimonyBrl.push(patrimonyValue);
            totalBtcAccumulated.push(accumulatedBtc);
        }

        const finalBtcVal = totalBtcAccumulated[totalBtcAccumulated.length - 1];
        const finalPatrimonyVal = patrimonyBrl[patrimonyBrl.length - 1];

        setResultSummary({
            finalBtc: finalBtcVal,
            finalSats: finalBtcVal * 100000000,
            valueAtCurrent: finalBtcVal * currentPrice,
            satsPerCurrent: 100000000 / currentPrice, // Sats per 1 unit of currency
            valueProjected: finalPatrimonyVal,
            satsPerProjected: 100000000 / projectedBtcPrice
        });

        setChartData({
            labels,
            datasets: [
                {
                    label: `${t('sats.projected_value')} (${currency})`,
                    data: patrimonyBrl,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.2)',
                    yAxisID: 'y',
                    fill: true,
                },
                {
                    label: t('sats.final_btc'),
                    data: totalBtcAccumulated,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.2)',
                    yAxisID: 'y1',
                    fill: false,
                }
            ]
        });
        setViewMode('chart');
    };



    const formatCurrency = (val: number, cur: string) => val.toLocaleString('pt-BR', { style: 'currency', currency: cur });
    const formatBtc = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 8, maximumFractionDigits: 8 });

    // Latest results for summary
    const finalBtc = chartData ? chartData.datasets[1].data[chartData.datasets[1].data.length - 1] : 0;
    const finalPatrimony = chartData ? chartData.datasets[0].data[chartData.datasets[0].data.length - 1] : 0;

    // Calculate dynamic sats per unit for subtitle
    const satsPerUnit = prices && prices[currency]
        ? Math.floor(100000000 / prices[currency]).toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US')
        : '...';

    const currencyName = (() => {
        if (currency === 'BRL') return 'real';
        if (currency === 'EUR') return 'euro';
        if (currency === 'USD') return (language === 'en') ? 'dollar' : 'dólar';
        return currency;
    })();

    return (
        <main className="about-section">
            <h1 className="hero-title" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', marginBottom: '1rem', textAlign: 'center', lineHeight: '1.2' }}>{t('sats.title')}</h1>
            <p style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 2rem auto', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.5' }}>
                {t('sats.subtitle')
                    .replace('{{sats}}', satsPerUnit)
                    .replace('{{currency}}', currency)
                    .replace('{{currencyName}}', currencyName)
                }
            </p>

            <div className="about-content">
                {/* Calculator Inputs */}
                <div className="calculator-container" style={{ margin: '2rem auto', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {/* Header: Configurações & Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '1.2rem' }}>⚙️</span>
                            <h3 style={{ margin: 0, fontSize: '1rem', color: '#FFFFFF' }}>{t('home.settings')}</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                                <strong style={{ color: 'var(--bitcoin-orange)', fontSize: '0.8rem' }}>
                                    {prices && prices[currency] ? formatCurrency(prices[currency], currency) : (loadingPrice ? t('common.updating') : t('common.loading'))}
                                </strong>
                                <button
                                    onClick={fetchPrices}
                                    disabled={loadingPrice}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: loadingPrice ? 'not-allowed' : 'pointer',
                                        fontSize: '1rem',
                                        padding: '4px',
                                        opacity: loadingPrice ? 0.5 : 1
                                    }}
                                    title={t('common.refresh')}
                                >
                                    🔄
                                </button>
                            </div>
                            <small style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                1 {currency} ≈ {prices && prices[currency] ? Math.floor(100000000 / prices[currency]).toLocaleString(currency === 'BRL' ? 'pt-BR' : 'en-US') : '...'} sats
                            </small>
                        </div>
                    </div>

                    {/* Top Controls: Ages */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className="input-label" style={{ display: 'block', textAlign: 'left' }}>{t('home.current_age')}</label>
                                <input type="number" value={currentAge} onChange={(e) => setCurrentAge(parseFloat(e.target.value))} className="calculator-input" />
                            </div>
                            <div>
                                <label className="input-label" style={{ display: 'block', textAlign: 'left' }}>{t('home.retirement_age')}</label>
                                <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(parseFloat(e.target.value))} className="calculator-input" />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>

                        {/* Initial Investment */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', minHeight: '27px' }}>
                                <label className="input-label" style={{ marginBottom: 0, textAlign: 'left' }}>{t('sats.initial_investment')}</label>
                            </div>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 1 }}>
                                    {currency === 'BRL' ? 'R$' : (currency === 'EUR' ? '€' : '$')}
                                </span>
                                <input
                                    type="number"
                                    value={initialInvestment}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInitialInvestment(val === '' ? '' : parseFloat(val));
                                    }}
                                    className="calculator-input"
                                    style={{ paddingLeft: '45px', width: '100%' }}
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Contribution & Frequency Toggle */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', minHeight: '27px' }}>
                                <label className="input-label" style={{ marginBottom: 0, textAlign: 'left' }}>{t('sats.contribution_value')}</label>
                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    <span
                                        onClick={() => setContributionFrequency('monthly')}
                                        style={{
                                            cursor: 'pointer',
                                            color: contributionFrequency === 'monthly' ? '#e67e00' : 'var(--text-secondary)',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        {t('sats.freq_monthly')}
                                    </span>
                                    <span style={{ margin: '0 8px', color: 'var(--text-secondary)' }}>|</span>
                                    <span
                                        onClick={() => setContributionFrequency('annual')}
                                        style={{
                                            cursor: 'pointer',
                                            color: contributionFrequency === 'annual' ? '#e67e00' : 'var(--text-secondary)',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        {t('sats.freq_annual')}
                                    </span>
                                </div>
                            </div>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 1 }}>
                                    {currency === 'BRL' ? 'R$' : (currency === 'EUR' ? '€' : '$')}
                                </span>
                                <input
                                    type="number"
                                    value={inputAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setInputAmount(val === '' ? '' : parseFloat(val));
                                    }}
                                    className="calculator-input"
                                    style={{ paddingLeft: '45px', width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Annual Increase */}
                        <div>
                            <label className="input-label" style={{ display: 'block', textAlign: 'left' }}>{t('sats.annual_increase')}</label>
                            <input type="number" value={annualIncrease} onChange={(e) => setAnnualIncrease(parseFloat(e.target.value))} className="calculator-input" />
                        </div>

                        {/* BTC Growth */}
                        <div>
                            <label className="input-label" style={{ display: 'block', textAlign: 'left' }}>{t('sats.btc_growth')}</label>
                            <input type="number" value={btcGrowthRate} onChange={(e) => setBtcGrowthRate(parseFloat(e.target.value))} className="calculator-input" />
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="calc-button"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1.5rem',
                            background: 'var(--bitcoin-orange)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e67e00'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--bitcoin-orange)'}
                    >
                        {t('sats.calculate_btn')}
                    </button>

                    {resultSummary && (
                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontSize: '1.5rem' }}>{t('common.results')}</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ borderRight: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('home.chart.years_until_ret')}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)' }}>{yearsUntilRet} {t('home.chart.years_suffix')}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('home.chart.ret_year')}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{retYear}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1rem', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center' }}>

                                {/* BTC Column */}
                                <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sats.final_btc')}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)' }}>{formatBtc(resultSummary.finalBtc)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sats.final_sats')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{(resultSummary.finalSats).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>
                                    </div>
                                </div>

                                {/* Fiat Column */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sats.projected_value')}</div>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{formatCurrency(resultSummary.valueProjected, currency)}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{(resultSummary.satsPerProjected).toLocaleString('pt-BR', { maximumFractionDigits: (resultSummary.satsPerProjected < 10) ? 1 : 0 })} Sats / {currency}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('sats.current_value')}</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(resultSummary.valueAtCurrent, currency)}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>{(resultSummary.satsPerCurrent).toLocaleString('pt-BR', { maximumFractionDigits: (resultSummary.satsPerCurrent < 10) ? 1 : 0 })} Sats / {currency}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', width: '100%' }}>
                        <a href={`https://twitter.com/intent/tweet?text=Confira%20esta%20calculadora%20de%20aposentadoria%20em%20Satoshis!&url=https://viverdebitcoin.com/calculadora-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            𝕏
                        </a>
                        <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            IG
                        </a>
                        <a href={`https://wa.me/?text=Confira%20esta%20calculadora%20de%20aposentadoria%20em%20Satoshis!%20https://viverdebitcoin.com/calculadora-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            WhatsApp
                        </a>
                    </div>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {t('common.share')}
                    </p>
                </div>

                {/* Results Section */}
                {chartData && (
                    <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', marginTop: '0', fontSize: '1.8rem' }}>{t('sats.results_title')}</h3>



                        {/* Toggle View */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                            <button onClick={() => setViewMode('chart')} style={{ padding: '0.6rem 1.2rem', background: viewMode === 'chart' ? 'var(--primary-green)' : 'transparent', border: '1px solid var(--primary-green)', color: viewMode === 'chart' ? '#fff' : 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('common.chart')}</button>
                            <button onClick={() => setViewMode('table')} style={{ padding: '0.6rem 1.2rem', background: viewMode === 'table' ? 'var(--primary-green)' : 'transparent', border: '1px solid var(--primary-green)', color: viewMode === 'table' ? '#fff' : 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>{t('common.table')}</button>
                        </div>

                        {viewMode === 'chart' ? (
                            <div style={{ height: '350px', width: '100%' }}>
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        interaction: {
                                            mode: 'index' as const,
                                            intersect: false,
                                        },
                                        scales: {
                                            y: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'left' as const,
                                                title: { display: true, text: `${t('sats.projected_value')} (${currency})` }
                                            },
                                            y1: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'right' as const,
                                                grid: { drawOnChartArea: false },
                                                title: { display: true, text: t('sats.final_btc') }
                                            },
                                        },
                                        plugins: {
                                            legend: { position: 'top' as const },
                                            title: { display: false }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', maxHeight: '400px', borderRadius: '12px', border: '1px solid var(--border-color)', marginTop: '1rem', background: 'rgba(255, 255, 255, 0.05)' }}>
                                <table className="about-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: isLightMode ? '#ffffff' : '#262626', borderBottom: '1px solid var(--border-color)' }}>
                                        <tr>
                                            {[
                                                { key: 'age', label: t('home.current_age') },
                                                { key: 'projected', label: `${t('sats.projected_value')} (${currency})` },
                                                { key: 'btc', label: t('sats.final_btc') }
                                            ].map((col) => (
                                                <th
                                                    key={col.key}
                                                    onClick={() => {
                                                        let direction: 'asc' | 'desc' = 'asc';
                                                        if (sortConfig && sortConfig.key === col.key && sortConfig.direction === 'asc') {
                                                            direction = 'desc';
                                                        }
                                                        setSortConfig({ key: col.key, direction });
                                                    }}
                                                    style={{
                                                        cursor: 'pointer',
                                                        userSelect: 'none',
                                                        padding: '12px 15px',
                                                        textAlign: 'left',
                                                        color: 'var(--text-main)',
                                                        backgroundColor: 'inherit' // Inherits from thead
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        {col.label}
                                                        {sortConfig?.key === col.key ? (
                                                            <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                                                        ) : (
                                                            <span style={{ color: 'var(--border-color)', fontSize: '0.8em' }}>⇵</span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const data = chartData.labels.map((label: string, i: number) => ({
                                                label,
                                                age: parseInt(label.replace(/\D/g, '')) || 0,
                                                projected: chartData.datasets[0].data[i],
                                                btc: chartData.datasets[1].data[i]
                                            }));

                                            if (sortConfig) {
                                                data.sort((a: any, b: any) => {
                                                    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
                                                    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                                                    return 0;
                                                });
                                            }

                                            return data.map((row: any, i: number) => (
                                                <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px 15px' }}>{row.label}</td>
                                                    <td style={{ padding: '12px 15px' }}>{formatCurrency(row.projected, currency)}</td>
                                                    <td style={{ padding: '12px 15px' }}>{formatBtc(row.btc)}</td>
                                                </tr>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>{t('sats.disclaimer_small')}</p>
                    </div>
                )}





                {/* Educational Content */}
                <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>{t('sats.edu_title_1')}</h3>
                    <p>{t('sats.edu_text_1')}</p>
                    <p>{t('sats.intro_text')}</p>
                    <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0', borderLeft: '4px solid var(--primary-green)' }}>
                        <p dangerouslySetInnerHTML={{ __html: t('sats.example_text') }}></p>
                    </div>
                </div>

                {/* Educational Content */}
                <h2>{t('sats.edu_title_2')}</h2>
                <p>{t('sats.edu_text_2')}</p>
                <p>{t('sats.edu_text_3')}</p>

                <h2>{t('sats.why_title')}</h2>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>{t('sats.why_li1')}</li>
                    <li>{t('sats.why_li2')}</li>
                    <li>{t('sats.why_li3')}</li>
                    <li>{t('sats.why_li4')}</li>
                    <li>{t('sats.why_li5')}</li>
                </ul>
                <p>{t('sats.why_desc')}</p>

                <h2>{t('sats.plan_title')}</h2>
                <p dangerouslySetInnerHTML={{ __html: t('sats.plan_desc1') }}></p>
                <p>{t('sats.plan_desc2')}</p>

                <h2>{t('sats.rate_title')}</h2>
                <p>{t('sats.rate_desc')}</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li dangerouslySetInnerHTML={{ __html: t('sats.rate_li1') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('sats.rate_li2') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('sats.rate_li3') }}></li>
                    <li dangerouslySetInnerHTML={{ __html: t('sats.rate_li4') }}></li>
                </ul>

                <h2>{t('sats.sec9_title')}</h2>
                <p>{t('sats.sec9_text')}</p>

                <h3>{t('sats.sec9_sub1')}</h3>
                <p>{t('sats.sec9_sub1_text1')}</p>
                <p><em>{t('sats.sec9_sub1_text2')}</em></p>

                <h3>{t('sats.sec9_sub2')}</h3>
                <p dangerouslySetInnerHTML={{ __html: t('sats.sec9_sub2_text1') }}></p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
                    <h4 style={{ color: 'var(--bitcoin-orange)' }}>{t('sats.sec9_box_title')}</h4>
                    <p>{t('sats.sec9_box_text')}</p>
                    <ul style={{ margin: '0.5rem 0 0 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                        <li>{t('sats.sec9_box_li1')}</li>
                        <li>{t('sats.sec9_box_li2')}</li>
                        <li>{t('sats.sec9_box_li3')}</li>
                        <li>{t('sats.sec9_box_li4')}</li>
                    </ul>
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{t('sats.sec9_box_result')}</p>
                </div>
            </div>
        </main >
    );
}
