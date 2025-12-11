"use client";
import React, { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// --- Types & Interfaces ---

type MacroEventId =
    | 'etf_flows'
    | 'reg_clarity'
    | 'sovereign'
    | 'mining'
    | 'liquidity_global'
    | 'tight_liquidity'
    | 'hostile_reg'
    | 'recession'
    | 'protocol_fail';

interface MacroEvent {
    id: MacroEventId;
    type: 'bull' | 'bear';
    icon: string;
    impact: number; // Multiplier impact (e.g., 1.10 for +10%)
}

const MACRO_EVENTS: MacroEvent[] = [
    { id: 'etf_flows', type: 'bull', icon: '📈', impact: 1.15 },
    { id: 'reg_clarity', type: 'bull', icon: '⚖️', impact: 1.10 },
    { id: 'sovereign', type: 'bull', icon: '🏛️', impact: 1.25 },
    { id: 'mining', type: 'bull', icon: '⚡', impact: 1.05 },
    { id: 'liquidity_global', type: 'bull', icon: '🌊', impact: 1.15 },
    { id: 'tight_liquidity', type: 'bear', icon: '📉', impact: 0.85 },
    { id: 'hostile_reg', type: 'bear', icon: '🚫', impact: 0.70 },
    { id: 'recession', type: 'bear', icon: '🧊', impact: 0.80 },
    { id: 'protocol_fail', type: 'bear', icon: '🐛', impact: 0.10 }, // Catastrophic
];

// Anchors for Scenarios (USD)
const PRICE_ANCHORS_BASE = [
    { year: 2028, price: 225000 },
    { year: 2033, price: 425000 },
    { year: 2040, price: 800000 },
    { year: 2050, price: 1900000 },
    { year: 2075, price: 3000000 },
];

const PRICE_ANCHORS_BULL = [
    { year: 2028, price: 450000 },
    { year: 2033, price: 1050000 },
    { year: 2040, price: 3250000 },
    { year: 2050, price: 10000000 },
    { year: 2075, price: 30000000 },
];

const PRICE_ANCHORS_BEAR = [
    { year: 2028, price: 115000 },
    { year: 2033, price: 185000 },
    { year: 2040, price: 350000 },
    { year: 2050, price: 650000 },
    { year: 2075, price: 550000 },
];

const DEFAULT_BTC_PRICE_BRL = 610000;
const DEFAULT_BTC_PRICE_USD = 103000;

export default function BitcoinRetirementCalculator() {
    const { currency, setCurrency, t } = useSettings();

    // --- State: User Inputs ---
    const [currentAge, setCurrentAge] = useState<number>(30);
    const [retirementAge, setRetirementAge] = useState<number>(60);
    const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);

    // Contribution in BTC or SATS
    const [monthlyContribution, setMonthlyContribution] = useState<number>(0.012);
    const [contributionUnit, setContributionUnit] = useState<'BTC' | 'SATS'>('BTC');
    const [contributionFrequency, setContributionFrequency] = useState<'monthly' | 'annual'>('annual');

    const [targetAnnualIncome, setTargetAnnualIncome] = useState<number>(10000); // Annual
    const [annualInflation, setAnnualInflation] = useState<number>(5);
    const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4);
    const [btcAccumulated, setBtcAccumulated] = useState<number>(0.5);

    // --- State: Market Data ---
    const [btcPrice, setBtcPrice] = useState<number>(0);
    const [exchangeRate, setExchangeRate] = useState<number>(1);
    const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

    // --- State: Macro Events Selection ---
    const [selectedMacros, setSelectedMacros] = useState<Record<MacroEventId, boolean>>({
        etf_flows: true,
        reg_clarity: true,
        sovereign: false,
        mining: false,
        liquidity_global: false,
        tight_liquidity: false,
        hostile_reg: false,
        recession: false,
        protocol_fail: false,
    });

    // --- State: Results ---
    const [showResults, setShowResults] = useState<boolean>(false);
    const [finalSummary, setFinalSummary] = useState<any>(null);

    // --- State: Chart Controls ---
    const [chartMode, setChartMode] = useState<'fiat' | 'btc'>('fiat');
    const [projectionView, setProjectionView] = useState<'chart' | 'table'>('chart');
    const [visibleScenarios, setVisibleScenarios] = useState({
        base: true,
        bull: false,
        bear: false
    });

    // --- State: Table Sorting ---
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);




    // --- State: UI ---
    const [isIncomeFocused, setIsIncomeFocused] = useState(false);
    const [isFiatContributionFocused, setIsFiatContributionFocused] = useState(false);
    const [localFiatContribution, setLocalFiatContribution] = useState('');

    // --- Effects: Fetch Price & Exchange Rate ---
    useEffect(() => {
        const fetchPrices = async () => {
            setLoadingPrice(true);
            try {
                let price = currency === 'BRL' ? DEFAULT_BTC_PRICE_BRL : DEFAULT_BTC_PRICE_USD;
                let rate = 1;

                try {
                    const btcPair = `BTC-${currency}`;
                    const btcKey = `BTC${currency}`;

                    const resBtc = await fetch(`https://economia.awesomeapi.com.br/last/${btcPair}`);
                    if (resBtc.ok) {
                        const data = await resBtc.json();
                        if (data[btcKey]?.bid) {
                            price = parseFloat(data[btcKey].bid);
                        }
                    }

                    if (currency !== 'USD') {
                        const fiatPair = `USD-${currency}`;
                        const fiatKey = `USD${currency}`;
                        const resFiat = await fetch(`https://economia.awesomeapi.com.br/last/${fiatPair}`);
                        if (resFiat.ok) {
                            const data = await resFiat.json();
                            if (data[fiatKey]?.bid) {
                                rate = parseFloat(data[fiatKey].bid);
                            }
                        }
                    } else {
                        rate = 1;
                    }

                    if (currency === 'EUR') {
                        const fiatPair = `USD-EUR`;
                        const fiatKey = `USDEUR`;
                        const resFiat = await fetch(`https://economia.awesomeapi.com.br/last/${fiatPair}`);
                        if (resFiat.ok) {
                            const data = await resFiat.json();
                            if (data[fiatKey]?.bid) {
                                rate = parseFloat(data[fiatKey].bid);
                            }
                        }
                    }

                } catch (e) {
                    console.warn(`AwesomeAPI fetch failed for ${currency}, trying backup...`, e);
                }

                if ((currency === 'USD' || currency === 'EUR') && (!btcPrice || btcPrice === 0)) {
                    try {
                        const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                        if (res.ok) {
                            const data = await res.json();
                            if (currency === 'EUR' && data.bpi.EUR) {
                                price = data.bpi.EUR.rate_float;
                                rate = data.bpi.EUR.rate_float / data.bpi.USD.rate_float;
                            }
                            else if (data.bpi.USD) {
                                price = data.bpi.USD.rate_float;
                                rate = 1;
                            }
                        }
                    } catch (e) {
                        console.error('Coindesk backup fetch failed', e);
                    }
                }

                setBtcPrice(price);
                setExchangeRate(rate);

            } finally {
                setLoadingPrice(false);
            }
        };
        fetchPrices();
    }, [currency]);

    // --- Calculation Engine ---
    const getProjectedUsdPrice = (
        targetYear: number,
        macros: number,
        anchors: { year: number, price: number }[],
        currentUsdPrice: number
    ) => {
        let startAnchor: { year: number, price: number };
        let endAnchor: { year: number, price: number };

        const currentYear = new Date().getFullYear();

        if (targetYear < anchors[0].year) {
            startAnchor = { year: currentYear, price: currentUsdPrice };
            endAnchor = anchors[0];
        } else {
            startAnchor = anchors[anchors.length - 2];
            endAnchor = anchors[anchors.length - 1];

            for (let i = 0; i < anchors.length - 1; i++) {
                if (targetYear >= anchors[i].year && targetYear < anchors[i + 1].year) {
                    startAnchor = anchors[i];
                    endAnchor = anchors[i + 1];
                    break;
                }
            }
        }

        const t1 = startAnchor.year;
        const p1 = startAnchor.price;
        const t2 = endAnchor.year;
        const p2 = endAnchor.price;

        if (t2 <= t1) return p1 * macros;

        const cagr = Math.pow((p2 / p1), 1 / (t2 - t1)) - 1;
        const yearsFromAnchor = targetYear - t1;

        const projectedUsd = p1 * Math.pow(1 + cagr, yearsFromAnchor);

        return projectedUsd * macros;
    };

    const calculate = () => {
        if (!btcPrice) return;

        const currentYear = new Date().getFullYear();
        const yearsAccumulating = retirementAge - currentAge;
        const retirementYear = currentYear + yearsAccumulating;
        const yearsRetirement = lifeExpectancy - retirementAge;

        if (yearsAccumulating <= 0) return;

        let macroMultiplier = 1.0;
        MACRO_EVENTS.forEach(event => {
            if (selectedMacros[event.id]) {
                macroMultiplier *= event.impact;
            }
        });

        const inflationMultiplier = Math.pow(1 + (annualInflation / 100), yearsAccumulating);

        let rawContribution = monthlyContribution;
        if (contributionUnit === 'SATS') {
            rawContribution = rawContribution / 100000000;
        }

        let monthlyContribBtc = rawContribution;
        if (contributionFrequency === 'annual') {
            monthlyContribBtc = rawContribution / 12;
        }

        let currentBtcHoldings = btcAccumulated;

        const totalBtcContrib = monthlyContribBtc * 12 * yearsAccumulating;
        const finalBtc = currentBtcHoldings + totalBtcContrib;
        const validExchangeRate = exchangeRate || (currency === 'BRL' ? 6 : 1);

        const currentUsdPrice = (currency === 'USD') ? btcPrice : (btcPrice / validExchangeRate);

        // --- Helper to Compute Metrics for a Scenario ---
        const computeMetrics = (anchors: { year: number, price: number }[]) => {
            const projectedUsd = getProjectedUsdPrice(retirementYear, macroMultiplier, anchors, currentUsdPrice);
            const projectedPrice = projectedUsd * validExchangeRate;
            const finalPatrimony = finalBtc * projectedPrice;

            // Income
            const incomeNominal = contributionFrequency === 'annual'
                ? (finalPatrimony * (safeWithdrawalRate / 100))
                : (finalPatrimony * (safeWithdrawalRate / 100)) / 12;
            const incomeReal = incomeNominal / inflationMultiplier;

            // Fixed Slices
            const totalPeriodsRetirement = contributionFrequency === 'annual' ? yearsRetirement : yearsRetirement * 12;
            const btcWithdrawal = finalBtc / totalPeriodsRetirement;
            const incomeFixedNominal = btcWithdrawal * projectedPrice;
            const incomeFixedReal = incomeFixedNominal / inflationMultiplier;

            // Goal Check
            const targetIncomeComp = contributionFrequency === 'annual'
                ? targetAnnualIncome
                : targetAnnualIncome / 12;

            const metGoal = incomeReal >= targetIncomeComp;

            // BTC Requirements (Gap Analysis)
            const targetAnnualNominal = targetAnnualIncome * inflationMultiplier;

            const requiredCapitalSWR = targetAnnualNominal / (safeWithdrawalRate / 100);
            const requiredBtcSWR = requiredCapitalSWR / projectedPrice;

            const requiredCapitalSlices = targetAnnualNominal * yearsRetirement;
            const requiredBtcSlices = requiredCapitalSlices / projectedPrice;

            const maxRequired = Math.max(requiredBtcSWR, requiredBtcSlices);
            const gapBtc = maxRequired - finalBtc;

            return {
                patrimony: finalPatrimony,
                btc: finalBtc,
                projectedPrice,
                income: incomeNominal,
                incomeReal,
                incomeFixedNominal,
                incomeFixedReal,
                btcFixed: btcWithdrawal,
                metGoal,
                analysis: {
                    requiredBtcSWR,
                    requiredBtcSlices,
                    gapBtc
                }
            };
        };

        const baseMetrics = computeMetrics(PRICE_ANCHORS_BASE);
        const bullMetrics = computeMetrics(PRICE_ANCHORS_BULL);
        const bearMetrics = computeMetrics(PRICE_ANCHORS_BEAR);

        // --- Chart Data Generation ---
        const historyEnd = retirementYear + yearsRetirement;
        const simulationData = [];

        const annualContribBtc = monthlyContribBtc * 12;

        let btcBalBase = btcAccumulated;
        let btcBalBull = btcAccumulated;
        let btcBalBear = btcAccumulated;

        let drawdownBase = 0;
        let drawdownBull = 0;
        let drawdownBear = 0;

        for (let y = currentYear; y <= historyEnd; y++) {
            const isAccumulation = y < retirementYear;
            const prices = {
                base: getProjectedUsdPrice(y, macroMultiplier, PRICE_ANCHORS_BASE, currentUsdPrice) * validExchangeRate,
                bull: getProjectedUsdPrice(y, macroMultiplier, PRICE_ANCHORS_BULL, currentUsdPrice) * validExchangeRate,
                bear: getProjectedUsdPrice(y, macroMultiplier, PRICE_ANCHORS_BEAR, currentUsdPrice) * validExchangeRate,
            };

            if (y > currentYear && isAccumulation) {
                btcBalBase += annualContribBtc;
                btcBalBull += annualContribBtc;
                btcBalBear += annualContribBtc;
            }

            if (y === retirementYear) {
                drawdownBase = btcBalBase / yearsRetirement;
                drawdownBull = btcBalBull / yearsRetirement;
                drawdownBear = btcBalBear / yearsRetirement;
            }

            if (y >= retirementYear) {
                if (y > retirementYear) {
                    btcBalBase = Math.max(0, btcBalBase - drawdownBase);
                    btcBalBull = Math.max(0, btcBalBull - drawdownBull);
                    btcBalBear = Math.max(0, btcBalBear - drawdownBear);
                }
            }

            simulationData.push({
                year: y,
                base: { btc: btcBalBase, fiat: btcBalBase * prices.base },
                bull: { btc: btcBalBull, fiat: btcBalBull * prices.bull },
                bear: { btc: btcBalBear, fiat: btcBalBear * prices.bear }
            });
        }

        const targetIncomeForComparison = contributionFrequency === 'annual'
            ? targetAnnualIncome
            : targetAnnualIncome / 12;

        setFinalSummary({
            targetIncome: targetIncomeForComparison,
            yearsRetirement,
            yearsAccumulating,
            retirementYear,
            frequency: contributionFrequency,
            base: baseMetrics,
            bull: bullMetrics,
            bear: bearMetrics,
            simulation: simulationData
        });

        setShowResults(true);
    };

    const toggleMacro = (id: MacroEventId) => {
        setSelectedMacros(prev => ({ ...prev, [id]: !prev[id] }));
    };


    const formatMoney = (val: number) => {
        let locale = 'pt-BR';
        if (currency === 'USD') locale = 'en-US';
        if (currency === 'EUR') locale = 'de-DE';
        return val.toLocaleString(locale, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const currencySymbol = currency === 'BRL' ? 'R$' : currency === 'EUR' ? '€' : '$';

    // Helper to render a scenario card
    const renderCard = (scenario: any, title: string, icon: string, type: 'base' | 'bull' | 'bear') => {
        let borderColor = 'var(--border-color)';
        let titleColor = 'var(--bitcoin-orange)';
        let pillBg = 'rgba(231, 76, 60, 0.2)';
        let pillColor = '#e74c3c';
        let shadow = 'none';

        if (type === 'bull') {
            borderColor = '#27ae60';
            titleColor = '#27ae60';
            shadow = '0 0 20px rgba(39, 174, 96, 0.1)';
        } else if (type === 'bear') {
            borderColor = '#e74c3c';
            titleColor = '#e74c3c';
        }

        if (scenario.metGoal) {
            pillBg = 'rgba(39, 174, 96, 0.2)';
            pillColor = '#27ae60';
        }

        return (
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '16px',
                border: `1px solid ${borderColor}`,
                overflow: 'hidden',
                maxWidth: '900px',
                margin: '0 auto 2rem auto',
                boxShadow: shadow
            }}>
                {/* Card Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                        <h3 style={{ margin: 0, fontSize: '1.4rem', color: titleColor }}>{title}</h3>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block' }}>{t('home.result.price_at_year')} {finalSummary.retirementYear}</span>
                        <strong style={{ color: titleColor, fontSize: '1.2rem' }}>{formatMoney(scenario.projectedPrice)}</strong>
                    </div>

                    <span style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        background: pillBg,
                        color: pillColor,
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}>
                        {scenario.metGoal ? t('home.result.target_met') : t('home.result.under_target')}
                    </span>
                </div>

                <div style={{ padding: '2rem' }}>
                    {/* Row 1: Patrimony */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Patrimony BTC */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.result.patrimony_btc')}</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>
                                {scenario.btc.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 })} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>BTC</span>
                            </p>
                        </div>
                        {/* Patrimony Nominal */}
                        <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.result.patrimony_nominal')}</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0', color: titleColor }}>
                                {formatMoney(scenario.patrimony)}
                            </p>
                        </div>
                    </div>

                    {/* Row 2: Income Methods */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

                        {/* Method 1: 4% Rule */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h4 style={{ margin: 0, color: titleColor, fontSize: '1rem' }}>
                                    {finalSummary.frequency === 'annual' ? t('home.result.income_annual_4rule') : t('home.result.income_monthly_4rule')}
                                </h4>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.nominal')}</span>
                                    <strong style={{ color: 'var(--text-main)' }}>{formatMoney(scenario.income)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.real')}</span>
                                    <strong style={{ color: 'var(--text-main)' }}>{formatMoney(scenario.incomeReal)}</strong>
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '0.8rem 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.slice_btc')}</span>
                                    <span style={{ color: 'var(--text-main)' }}>
                                        {(scenario.btcFixed).toFixed(6)} BTC
                                        <span style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>
                                            /{finalSummary.frequency === 'annual' ? 'ano' : 'mês'}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Method 2: Equal Slices */}
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                <h4 style={{ margin: 0, color: titleColor, fontSize: '1rem' }}>
                                    {finalSummary.frequency === 'annual' ? t('home.result.income_annual_slices') : t('home.result.income_monthly_slices')} ({finalSummary.yearsRetirement} {t('home.chart.years_suffix')})
                                </h4>
                            </div>
                            <div style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.nominal')}</span>
                                    <strong style={{ color: 'var(--text-main)' }}>{formatMoney(scenario.incomeFixedNominal)}</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.real')}</span>
                                    <strong style={{ color: 'var(--text-main)' }}>{formatMoney(scenario.incomeFixedReal)}</strong>
                                </div>
                                <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '0.8rem 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>{t('home.result.slice_btc')}</span>
                                    <span style={{ color: 'var(--text-main)' }}>{(scenario.btcFixed).toFixed(6)} BTC</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: BTC Requirements Analysis (Gap) */}
                    <div style={{ marginTop: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>🎯</span>
                            <h4 style={{ margin: 0, color: 'var(--text-main)', fontSize: '1.1rem' }}>{t('home.result.btc_needed_goal')}</h4>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

                            {/* Required Slices */}
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t('home.result.method_slices')}</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    {scenario.analysis.requiredBtcSlices.toFixed(8)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>BTC</span>
                                </p>
                            </div>

                            {/* Required SWR */}
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Método SWR ({safeWithdrawalRate}%)</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
                                    {scenario.analysis.requiredBtcSWR.toFixed(8)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>BTC</span>
                                </p>
                            </div>

                            {/* Gap */}
                            <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gap vs Seu Plano</p>
                                <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: scenario.analysis.gapBtc > 0 ? '#e74c3c' : '#27ae60' }}>
                                    {Math.abs(scenario.analysis.gapBtc).toFixed(8)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>BTC</span>
                                </p>
                                <small style={{ color: 'var(--text-secondary)' }}>
                                    {scenario.analysis.gapBtc > 0 ? 'BTC Adicional Necessário' : 'Superávit de BTC'}
                                </small>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Footer Banner */}
                <div style={{
                    padding: '1.5rem',
                    background: pillBg,
                    borderTop: `1px solid ${pillColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            background: pillColor,
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: 'white', fontWeight: 'bold' }}>{scenario.metGoal ? '✓' : '✗'}</span>
                        </div>
                        <span style={{ color: pillColor, fontWeight: 'bold' }}>
                            {scenario.metGoal
                                ? `Você excede sua meta ${finalSummary.frequency === 'annual' ? 'anual' : 'mensal'} em ${formatMoney(scenario.incomeReal - finalSummary.targetIncome)}`
                                : `Você está abaixo da sua meta em ${formatMoney(finalSummary.targetIncome - scenario.incomeReal)}`
                            }
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: pillColor }}>
                            {formatMoney(scenario.incomeReal)}
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>/ {finalSummary.frequency === 'annual' ? 'ano' : 'mês'}</span>
                    </div>
                </div>

            </div>
        );
    };

    const getChartData = () => {
        if (!finalSummary?.simulation) return { labels: [], datasets: [] };

        const labels = finalSummary.simulation.map((d: any) => d.year);
        const datasets = [];

        if (visibleScenarios.base) {
            datasets.push({
                label: 'Base',
                data: finalSummary.simulation.map((d: any) => chartMode === 'fiat' ? d.base.fiat : d.base.btc),
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.5)',
                tension: 0.1
            });
        }
        if (visibleScenarios.bull) {
            datasets.push({
                label: 'Bull',
                data: finalSummary.simulation.map((d: any) => chartMode === 'fiat' ? d.bull.fiat : d.bull.btc),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.5)',
                tension: 0.1
            });
        }
        if (visibleScenarios.bear) {
            datasets.push({
                label: 'Bear',
                data: finalSummary.simulation.map((d: any) => chartMode === 'fiat' ? d.bear.fiat : d.bear.btc),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.5)',
                tension: 0.1
            });
        }

        return { labels, datasets };
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { color: '#bdc3c7' }
            },
            title: {
                display: false,
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (chartMode === 'fiat') {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(context.parsed.y);
                            } else {
                                label += context.parsed.y.toFixed(4) + ' BTC';
                            }
                        }
                        return label;
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest' as const,
            axis: 'x' as const,
            intersect: false
        },
        scales: {
            x: {
                ticks: { color: '#7f8c8d' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            y: {
                ticks: { color: '#7f8c8d' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            }
        }
    };

    return (
        <main className="about-section" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    {t('home.title')}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '800px', margin: '0 auto' }}>
                    {t('home.subtitle')}
                </p>
            </div>

            {/* Main Grid: Config vs Macros */}
            <div className="calculator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>

                {/* Left Column: Settings */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Header with Title and Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                            <h3 style={{ margin: 0, color: '#FFFFFF' }}>{t('home.settings')}</h3>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                                <strong style={{ color: 'var(--bitcoin-orange)', fontSize: '1.1rem' }}>
                                    {loadingPrice ? '...' : formatMoney(btcPrice)}
                                </strong>
                                <span style={{ fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => window.location.reload()}>🔄</span>
                            </div>
                            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                1 {currency} ≈ {btcPrice ? Math.floor(100000000 / btcPrice).toLocaleString(currency === 'USD' ? 'en-US' : 'de-DE') : '...'} sats
                            </small>
                        </div>
                    </div>

                    {/* Moeda */}
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('settings.currency')}</label>
                        <select
                            value={currency}
                            onChange={e => setCurrency(e.target.value as any)}
                            className="calculator-input"
                        >
                            <option value="BRL">BRL (Real Brasileiro)</option>
                            <option value="USD">USD (Dólar Americano)</option>
                            <option value="EUR">EUR (Euro)</option>
                        </select>
                    </div>

                    {/* Age Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('home.current_age')}</label>
                            <input
                                type="number"
                                value={currentAge}
                                onChange={e => setCurrentAge(Number(e.target.value))}
                                className="calculator-input"

                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('home.retirement_age')}</label>
                            <input
                                type="number"
                                value={retirementAge}
                                onChange={e => setRetirementAge(Number(e.target.value))}
                                className="calculator-input"

                            />
                        </div>
                    </div>

                    {/* Target Income - ANNUAL */}
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Renda Anual Desejada (Valores de Hoje)</label>
                        <div style={{ position: 'relative' }}>
                            {currency !== 'EUR' && (
                                <span style={{
                                    position: 'absolute',
                                    left: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    zIndex: 10,
                                    pointerEvents: 'none'
                                }}>
                                    {currencySymbol}
                                </span>
                            )}
                            <input
                                type="text"
                                value={isIncomeFocused
                                    ? targetAnnualIncome
                                    : (targetAnnualIncome.toLocaleString(currency === 'BRL' ? 'pt-BR' : (currency === 'EUR' ? 'de-DE' : 'en-US'), { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + (currency === 'EUR' ? ' €' : ''))
                                }
                                onChange={e => {
                                    const val = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                    setTargetAnnualIncome(Number(val));
                                }}
                                onFocus={() => setIsIncomeFocused(true)}
                                onBlur={() => setIsIncomeFocused(false)}
                                className="calculator-input"
                                style={{
                                    paddingLeft: currency === 'EUR' ? '12px' : (currency === 'BRL' ? '40px' : '30px'),
                                }}
                            />
                        </div>
                    </div>

                    {/* Life Expectancy & Inflation Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('home.life_expectancy')}</label>
                            <input
                                type="number"
                                value={lifeExpectancy}
                                onChange={e => setLifeExpectancy(Number(e.target.value))}
                                className="calculator-input"
                            />
                        </div>
                        <div>
                            <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('home.inflation')}</label>
                            <input
                                type="number"
                                value={annualInflation}
                                onChange={e => setAnnualInflation(Number(e.target.value))}
                                className="calculator-input"
                            />
                        </div>
                    </div>

                    {/* Safe Withdrawal Rate */}
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Taxa de Retirada Segura (%)</label>
                        <input
                            type="number"
                            value={safeWithdrawalRate}
                            onChange={e => setSafeWithdrawalRate(Number(e.target.value))}
                            step="0.1"
                            className="calculator-input"

                        />
                    </div>

                    {/* BTC Accumulated */}
                    <div>
                        <label className="input-label" style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{t('home.btc_accumulated')}</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                ₿
                            </span>
                            <input
                                type="number"
                                value={btcAccumulated}
                                onChange={e => setBtcAccumulated(Number(e.target.value))}
                                step="0.0001"
                                className="calculator-input"
                                style={{ paddingLeft: '35px' }}
                            />
                        </div>
                    </div>

                    {/* Monthly Contribution - FIXED BTC/SATS MODE */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <label className="input-label" style={{ color: 'var(--text-secondary)' }}>
                                Aporte ({contributionUnit})
                                <span
                                    style={{ fontSize: '0.8rem', color: 'var(--bitcoin-orange)', cursor: 'pointer', marginLeft: '10px', textDecoration: 'underline' }}
                                    onClick={() => {
                                        if (contributionUnit === 'BTC') {
                                            setMonthlyContribution(prev => Number((prev * 100000000).toFixed(0)));
                                            setContributionUnit('SATS');
                                        } else {
                                            setMonthlyContribution(prev => Number((prev / 100000000).toFixed(8)));
                                            setContributionUnit('BTC');
                                        }
                                    }}
                                >
                                    (Mudar p/ {contributionUnit === 'BTC' ? 'SATS' : 'BTC'})
                                </span>
                            </label>
                            <div style={{ display: 'flex', gap: '5px', fontSize: '0.8rem' }}>
                                <span
                                    style={{
                                        color: contributionFrequency === 'monthly' ? 'var(--bitcoin-orange)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: contributionFrequency === 'monthly' ? 'bold' : 'normal'
                                    }}
                                    onClick={() => setContributionFrequency('monthly')}
                                >
                                    Mensal
                                </span>
                                <span style={{ color: 'var(--border-color)' }}>|</span>
                                <span
                                    style={{
                                        color: contributionFrequency === 'annual' ? 'var(--bitcoin-orange)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: contributionFrequency === 'annual' ? 'bold' : 'normal'
                                    }}
                                    onClick={() => setContributionFrequency('annual')}
                                >
                                    Anual
                                </span>
                            </div>
                        </div>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                {contributionUnit === 'BTC' ? '₿' : '⚡'}
                            </span>
                            <input
                                type="number"
                                value={monthlyContribution}
                                onChange={e => setMonthlyContribution(Number(e.target.value))}
                                step={contributionUnit === 'BTC' ? "0.0001" : "1000"}
                                className="calculator-input"
                                style={{
                                    paddingRight: '140px',
                                    paddingLeft: '35px',
                                }}
                            />
                            <input
                                type="text"
                                value={isFiatContributionFocused
                                    ? localFiatContribution
                                    : `≈ ${formatMoney((contributionUnit === 'BTC' ? monthlyContribution : monthlyContribution / 100000000) * btcPrice)}`}
                                onChange={e => {
                                    // 1. Update local visual state
                                    setLocalFiatContribution(e.target.value);

                                    // 2. Parse and update actual BTC state
                                    const rawVal = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                                    const val = parseFloat(rawVal);

                                    if (!isNaN(val) && btcPrice > 0) {
                                        const btcAmount = val / btcPrice;
                                        if (contributionUnit === 'BTC') {
                                            setMonthlyContribution(btcAmount);
                                        } else {
                                            setMonthlyContribution(btcAmount * 100000000);
                                        }
                                    } else if (rawVal === '') {
                                        setMonthlyContribution(0);
                                    }
                                }}
                                onFocus={() => {
                                    setIsFiatContributionFocused(true);
                                    // Initialize local state with current value to avoid jump
                                    const currentFiat = (contributionUnit === 'BTC' ? monthlyContribution : monthlyContribution / 100000000) * btcPrice;
                                    setLocalFiatContribution(currentFiat.toFixed(2));
                                }}
                                onBlur={() => setIsFiatContributionFocused(false)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.9rem',
                                    background: 'transparent',
                                    border: 'none',
                                    textAlign: 'right',
                                    width: '120px',
                                    outline: 'none',
                                    fontWeight: 500
                                }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={calculate}
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            padding: '1rem',
                            background: 'var(--bitcoin-orange)',
                            color: 'white',
                            border: 'unset',
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(247, 147, 26, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {t('home.simulate_btn')}
                    </button>

                    {/* Share Buttons */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', width: '100%' }}>
                        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Confira este Simulador de Aposentadoria com Bitcoin! 🚀 #Bitcoin #HODL')}&url=${encodeURIComponent('https://viverdebitcoin.com')}`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            𝕏
                        </a>
                        <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            IG
                        </a>
                        <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent('Olha que incrível este Simulador de Aposentadoria com Bitcoin! 🚀 https://viverdebitcoin.com')}`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            WhatsApp
                        </a>
                    </div>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {t('common.share')}
                    </p>
                </div>

                {/* Right Column: Macro Events */}
                <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>🌐</span>
                        <h3 style={{ margin: 0 }}>{t('home.macro_events')}</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {MACRO_EVENTS.map(event => (
                            <div
                                key={event.id}
                                onClick={() => toggleMacro(event.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '10px',
                                    background: selectedMacros[event.id]
                                        ? (event.type === 'bull' ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)')
                                        : 'var(--bg-secondary)',
                                    border: `1px solid ${selectedMacros[event.id]
                                        ? (event.type === 'bull' ? '#27ae60' : '#e74c3c')
                                        : 'var(--border-color)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <span style={{ fontSize: '1.5rem', marginRight: '1rem' }}>{event.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong style={{ color: 'var(--text-main)' }}>{t(`home.macro.${event.id.replace('etf_flows', 'etf').replace('liquidity_global', 'risk_on').replace('tight_liquidity', 'tight_liq').replace('protocol_fail', 'protocol').replace('mining', 'miner').replace('hostile_reg', 'adv_reg')}.label` as any) || event.id}</strong>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: event.type === 'bull' ? '#27ae60' : '#e74c3c',
                                            color: 'white',
                                            fontWeight: 'bold'
                                        }}>
                                            {event.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {t(`home.macro.${event.id.replace('etf_flows', 'etf').replace('liquidity_global', 'risk_on').replace('tight_liquidity', 'tight_liq').replace('protocol_fail', 'protocol').replace('mining', 'miner').replace('hostile_reg', 'adv_reg')}.desc` as any)}
                                    </p>
                                </div>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    border: '2px solid var(--text-secondary)',
                                    background: selectedMacros[event.id] ? (event.type === 'bull' ? '#27ae60' : '#e74c3c') : 'transparent',
                                    borderColor: selectedMacros[event.id] ? (event.type === 'bull' ? '#27ae60' : '#e74c3c') : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {selectedMacros[event.id] && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {showResults && finalSummary && (
                <div style={{ marginTop: '4rem', animation: 'fadeIn 0.5s' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{t('common.results')}</h2>

                    {/* Timeline Summary Card */}
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        padding: '1.5rem',
                        marginBottom: '2rem',
                        maxWidth: '900px',
                        margin: '0 auto 2rem auto',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '1rem',
                        textAlign: 'center'
                    }}>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Anos até Aposentadoria</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)' }}>{finalSummary.yearsAccumulating} anos</p>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Ano da Aposentadoria</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{finalSummary.retirementYear}</p>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Anos na Aposentadoria</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#27ae60' }}>{finalSummary.yearsRetirement} anos</p>
                        </div>
                    </div>

                    {/* Scenario Cards */}
                    {renderCard(finalSummary.base, t('home.chart.base'), '⚖️', 'base')}
                    {renderCard(finalSummary.bull, 'Cenário Otimista (Bull)', '🚀', 'bull')}
                    {renderCard(finalSummary.bear, 'Cenário Pessimista (Bear)', '🐻', 'bear')}

                    {/* Patrimony Chart/Table Section */}
                    <div style={{
                        background: 'var(--card-bg)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        padding: '2rem',
                        maxWidth: '900px',
                        margin: '2rem auto'
                    }}>
                        {/* Header: Title and Controls */}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <h3 style={{ margin: 0 }}>{t('home.chart.title')}</h3>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {/* View Toggle: Chart vs Table */}
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <button
                                        onClick={() => setProjectionView('chart')}
                                        style={{
                                            border: 'none',
                                            background: projectionView === 'chart' ? 'var(--bitcoin-orange)' : 'transparent',
                                            color: projectionView === 'chart' ? 'white' : 'var(--text-secondary)',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {t('common.chart')}
                                    </button>
                                    <button
                                        onClick={() => setProjectionView('table')}
                                        style={{
                                            border: 'none',
                                            background: projectionView === 'table' ? 'var(--bitcoin-orange)' : 'transparent',
                                            color: projectionView === 'table' ? 'white' : 'var(--text-secondary)',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {t('common.table')}
                                    </button>
                                </div>

                                {/* Unit Toggle: Fiat vs BTC */}
                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <button
                                        onClick={() => setChartMode('fiat')}
                                        style={{
                                            border: 'none',
                                            background: chartMode === 'fiat' ? 'var(--bitcoin-orange)' : 'transparent',
                                            color: chartMode === 'fiat' ? 'white' : 'var(--text-secondary)',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {currency}
                                    </button>
                                    <button
                                        onClick={() => setChartMode('btc')}
                                        style={{
                                            border: 'none',
                                            background: chartMode === 'btc' ? 'var(--bitcoin-orange)' : 'transparent',
                                            color: chartMode === 'btc' ? 'white' : 'var(--text-secondary)',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        BTC
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Scenario Visibility Toggles (Only for Chart) */}
                        {projectionView === 'chart' && (
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: visibleScenarios.base ? '#f39c12' : 'var(--text-secondary)' }}>
                                    <input
                                        type="checkbox"
                                        checked={visibleScenarios.base}
                                        onChange={(e) => setVisibleScenarios(prev => ({ ...prev, base: e.target.checked }))}
                                    />
                                    Base
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: visibleScenarios.bull ? '#27ae60' : 'var(--text-secondary)' }}>
                                    <input
                                        type="checkbox"
                                        checked={visibleScenarios.bull}
                                        onChange={(e) => setVisibleScenarios(prev => ({ ...prev, bull: e.target.checked }))}
                                    />
                                    Bull
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: visibleScenarios.bear ? '#e74c3c' : 'var(--text-secondary)' }}>
                                    <input
                                        type="checkbox"
                                        checked={visibleScenarios.bear}
                                        onChange={(e) => setVisibleScenarios(prev => ({ ...prev, bear: e.target.checked }))}
                                    />
                                    Bear
                                </label>
                            </div>
                        )}

                        {/* Content: Chart vs Table */}
                        {projectionView === 'chart' ? (
                            <div style={{ height: '400px' }}>
                                <Line data={getChartData()} options={chartOptions} />
                            </div>
                        ) : (
                            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: 'var(--card-bg)', zIndex: 1 }}>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            {[
                                                { key: 'year', label: t('common.year') },
                                                { key: 'age', label: t('home.table.age') },
                                                { key: 'base', label: `${t('home.chart.base')} (${chartMode === 'fiat' ? currency : 'BTC'})` },
                                                { key: 'bull', label: `${t('home.chart.bull')} (${chartMode === 'fiat' ? currency : 'BTC'})` },
                                                { key: 'bear', label: `${t('home.chart.bear')} (${chartMode === 'fiat' ? currency : 'BTC'})` }
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
                                                        padding: '12px',
                                                        textAlign: col.key === 'year' || col.key === 'age' ? 'left' : 'right',
                                                        cursor: 'pointer',
                                                        userSelect: 'none',
                                                        color: col.key === 'base' ? '#f39c12' : col.key === 'bull' ? '#27ae60' : col.key === 'bear' ? '#e74c3c' : 'inherit'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: col.key === 'year' || col.key === 'age' ? 'flex-start' : 'flex-end', gap: '5px' }}>
                                                        {col.label}
                                                        {sortConfig?.key === col.key && (
                                                            <span>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                                                        )}
                                                        {sortConfig?.key !== col.key && (
                                                            <span style={{ color: 'var(--border-color)', fontSize: '0.8em' }}>⇵</span>
                                                        )}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const sortedData = [...finalSummary.simulation];
                                            if (sortConfig) {
                                                sortedData.sort((a, b) => {
                                                    let aVal, bVal;

                                                    if (sortConfig.key === 'year') {
                                                        aVal = a.year;
                                                        bVal = b.year;
                                                    } else if (sortConfig.key === 'age') {
                                                        aVal = currentAge + (a.year - new Date().getFullYear());
                                                        bVal = currentAge + (b.year - new Date().getFullYear());
                                                    } else {
                                                        const mode = chartMode;
                                                        aVal = a[sortConfig.key][mode];
                                                        bVal = b[sortConfig.key][mode];
                                                    }

                                                    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                                                    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                                                    return 0;
                                                });
                                            }

                                            return sortedData.map((row: any, i: number) => {
                                                const age = currentAge + (row.year - new Date().getFullYear());
                                                const isRetirement = row.year >= finalSummary.retirementYear;
                                                return (
                                                    <tr key={row.year} style={{
                                                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                        background: isRetirement ? 'rgba(39, 174, 96, 0.05)' : 'transparent'
                                                    }}>
                                                        <td style={{ padding: '12px', fontWeight: isRetirement ? 'bold' : 'normal' }}>
                                                            {row.year} {isRetirement && sortedData[i - 1] && sortedData[i - 1].year < finalSummary.retirementYear && '🏠'}
                                                        </td>
                                                        <td style={{ padding: '12px' }}>{age}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                                                            {chartMode === 'fiat'
                                                                ? formatMoney(row.base.fiat)
                                                                : row.base.btc.toFixed(4)
                                                            }
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                                                            {chartMode === 'fiat'
                                                                ? formatMoney(row.bull.fiat)
                                                                : row.bull.btc.toFixed(4)
                                                            }
                                                        </td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace' }}>
                                                            {chartMode === 'fiat'
                                                                ? formatMoney(row.bear.fiat)
                                                                : row.bear.btc.toFixed(4)
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            )
            }
        </main >
    );
}
