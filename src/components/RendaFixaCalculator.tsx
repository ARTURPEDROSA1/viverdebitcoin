'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData
} from 'chart.js';
import { Line, Bar, Chart } from 'react-chartjs-2';
import historyData from '@/data/strc-history.json';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

type Frequency = 'none' | 'weekly' | 'monthly' | 'annual';
type ContributionType = 'fixed_amount' | 'fixed_shares';
type Scenario = 'base' | 'bear' | 'bull';

interface ForecastRow {
    monthIndex: number;
    dateLabel: string;
    price: number;
    dividendPerShare: number;
    startShares: number;
    newSharesContrib: number;
    newSharesReinvest: number;
    endShares: number;
    dividendIncome: number;
    portfolioValue: number;
    totalCostBasis: number;
    year: number;
}

export default function RendaFixaCalculator() {
    // --- Inputs State ---
    const [inputs, setInputs] = useState(() => {
        const start = new Date('2025-08-15');
        const now = new Date();
        // Calculate months diff
        const diff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        // Default horizon: diff + 1 to include current month if needed, or just diff.
        // Let's settle on diff (approx 4 months from Aug to Dec).
        const horizon = Math.max(1, diff);

        return {
            initialShares: 1,
            horizonMonths: horizon,
            contribFreq: 'monthly' as Frequency,
            contribType: 'fixed_shares' as ContributionType,
            contribValue: 1,
            reinvest: false,
            exitPrice: 99.5,
            scenario: 'base' as Scenario,
            startDate: '2025-08-15'
        };
    });

    // --- Active State (Triggered by Simulate) ---
    const [activeInputs, setActiveInputs] = useState<typeof inputs | null>(null);
    const [showResults, setShowResults] = useState(false);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [tableFreq, setTableFreq] = useState<'monthly' | 'annual'>('monthly');
    const [sortConfig, setSortConfig] = useState<{ key: keyof ForecastRow | 'dateLabel', direction: 'asc' | 'desc' } | null>(null);

    // --- Historical Data ---
    const historical = useMemo(() => {
        return historyData.data.map(d => ({
            ...d,
            dateObj: new Date(d.date)
        })).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    }, []);

    const lastHistoryItem = historical[historical.length - 1];
    const lastPrice = lastHistoryItem?.price || 100;
    const lastDividend = lastHistoryItem?.dividend || 0.8;

    // --- Handlers ---
    // Helper state for "Até Hoje" logic
    const monthsToToday = (() => {
        if (!inputs.startDate) return 1;
        const [y, m, d] = inputs.startDate.split('-').map(Number);
        const start = new Date(y, m - 1, d);
        const now = new Date();
        const diff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        return Math.max(1, diff);
    })();

    const standardOptions = [6, 12, 24, 36];
    const isUntilToday = !standardOptions.includes(monthsToToday) && inputs.horizonMonths === monthsToToday;

    // Sync horizonMonths when Date changes IF the current horizon is non-standard (implying "Até Hoje")
    useEffect(() => {
        if (!standardOptions.includes(inputs.horizonMonths) && inputs.horizonMonths !== monthsToToday) {
            setInputs(prev => ({ ...prev, horizonMonths: monthsToToday }));
        }
    }, [monthsToToday, inputs.horizonMonths]);

    const handleChange = (field: keyof typeof inputs, value: any) => {
        if (field === 'scenario') {
            let newExit = 100;
            if (value === 'bull') newExit = 102.5;
            if (value === 'bear') newExit = 97.5;
            setInputs(prev => ({ ...prev, scenario: value, exitPrice: newExit }));
        } else {
            setInputs(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSimulate = () => {
        setActiveInputs({ ...inputs });
        setShowResults(true);
        setTimeout(() => {
            const el = document.getElementById('simulation-results');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // --- Forecast Calculation ---
    const forecast = useMemo(() => {
        if (!activeInputs) return [];

        const { initialShares, horizonMonths, contribFreq, contribType, contribValue, reinvest, exitPrice, startDate } = activeInputs;

        const rows: ForecastRow[] = [];
        let currentShares = initialShares;

        // Find Start Price logic
        // Fix: Parse YYYY-MM-DD as local date to avoid timezone shift
        const [sy, sm, sd] = startDate.split('-').map(Number);
        const startObj = new Date(sy, sm - 1, sd);

        // Determine effective Exit Price
        let effectiveExitPrice = exitPrice;
        const now = new Date();
        const diff = (now.getFullYear() - startObj.getFullYear()) * 12 + (now.getMonth() - startObj.getMonth());
        const activeMonthsToToday = Math.max(1, diff);
        const standardOptions = [6, 12, 24, 36];

        // If the selected horizon matches the "Until Today" duration (and it's not a standard fixed option),
        // override the exit price with the current Last Price.
        if (!standardOptions.includes(activeMonthsToToday) && horizonMonths === activeMonthsToToday) {
            effectiveExitPrice = lastPrice;
        }

        let startPrice = lastPrice;

        // Find exact or closest historical price for start date
        // Note: historyData is sorted.
        if (historical.length > 0) {
            // Find first record >= startDate
            const matchIndex = historical.findIndex(h => h.dateObj >= startObj);

            if (matchIndex !== -1) {
                // If the match is exact or very close, use it.
                // If startDate is 2025-08-15 (Ex-Date), we have data.
                startPrice = historical[matchIndex].price;
            } else {
                // Date is after all history? Use last known.
                if (startObj > historical[historical.length - 1].dateObj) {
                    startPrice = lastPrice;
                } else {
                    // Date is before all history? Use first known.
                    startPrice = historical[0].price;
                }
            }
        }

        let totalCostBasis = initialShares * startPrice;
        let projectionStartPrice = startPrice;
        let projectionStartDividend = lastDividend;

        // Fix: Add months with overflow protection (e.g. Jan 31 + 1mo -> Feb 28, not Mar 3)
        const addMonths = (date: Date, months: number) => {
            const d = new Date(date);
            d.setMonth(d.getMonth() + months);
            if (d.getDate() !== date.getDate()) {
                d.setDate(0);
            }
            return d;
        };

        for (let i = 1; i <= horizonMonths; i++) {
            const targetDate = addMonths(startObj, i);

            // Check if we have real history for this target date
            // We assume history covers up to lastHistoryItem.date
            const isHistorical = lastHistoryItem && targetDate <= lastHistoryItem.dateObj;

            let periodPrice = 0;
            let periodDiv = 0;

            if (isHistorical) {
                // Find closest historical record
                // Simple search
                const closest = historical.reduce((prev, curr) =>
                    Math.abs(curr.dateObj.getTime() - targetDate.getTime()) < Math.abs(prev.dateObj.getTime() - targetDate.getTime()) ? curr : prev
                    , historical[0]);

                periodPrice = closest.price;
                periodDiv = closest.dividend;

                projectionStartPrice = periodPrice;
                projectionStartDividend = periodDiv;
            } else {
                // Future Projection
                // Interpolate from start (or last real) to exit
                const progress = i / horizonMonths;

                periodPrice = startPrice + (effectiveExitPrice - startPrice) * progress;

                // Dividend Logic
                // Strategy: Price < 100 => Increase Dividends. Price > 100 => Decrease Dividends.
                let baseDiv = projectionStartDividend; // defaults to last known

                periodDiv = baseDiv;
                if (periodPrice < 100) {
                    const diff = 100 - periodPrice;
                    // Sensitivity: 1% div increase per $1 drop
                    periodDiv = baseDiv * (1 + (diff * 0.01));
                } else if (periodPrice > 100) {
                    const diff = periodPrice - 100;
                    // Sensitivity: 1% div decrease per $1 rise
                    periodDiv = baseDiv * (1 - (diff * 0.01));
                    if (periodDiv < 0) periodDiv = 0;
                }
            }

            // Contributions
            let contribShares = 0;
            let contribAmountUSD = 0;
            let isContribMonth = false;

            if (contribFreq === 'monthly') isContribMonth = true;
            if (contribFreq === 'annual' && i % 12 === 0) isContribMonth = true;

            if (contribFreq === 'weekly') {
                if (contribType === 'fixed_amount') {
                    contribAmountUSD = contribValue * 4.33;
                    contribShares = contribAmountUSD / periodPrice;
                } else {
                    contribShares = contribValue * 4.33;
                    contribAmountUSD = contribShares * periodPrice;
                }
            } else {
                if (isContribMonth) {
                    if (contribType === 'fixed_amount') {
                        contribAmountUSD = contribValue;
                        contribShares = contribAmountUSD / periodPrice;
                    } else {
                        contribShares = contribValue;
                        contribAmountUSD = contribShares * periodPrice;
                    }
                }
            }

            // Reinvestment
            const dividendIncome = currentShares * periodDiv;
            let reinvestedShares = 0;
            if (reinvest) {
                reinvestedShares = dividendIncome / periodPrice;
            }

            const startShares = currentShares;
            currentShares += contribShares + reinvestedShares;
            totalCostBasis += contribAmountUSD;

            rows.push({
                monthIndex: i,
                dateLabel: targetDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
                price: periodPrice,
                dividendPerShare: periodDiv,
                startShares,
                newSharesContrib: contribShares,
                newSharesReinvest: reinvestedShares,
                endShares: currentShares,
                dividendIncome,
                portfolioValue: currentShares * periodPrice,
                totalCostBasis,
                year: targetDate.getFullYear()
            });
        }

        return rows;
    }, [activeInputs, historical, lastPrice, lastDividend, lastHistoryItem]);

    // --- Metrics ---
    const finalRow = forecast[forecast.length - 1];
    const finalPortfolioValue = finalRow ? finalRow.portfolioValue : 0;
    const totalCashInvested = finalRow ? finalRow.totalCostBasis : 0;
    const totalDividends = forecast.reduce((sum, row) => sum + row.dividendIncome, 0);
    const totalShares = finalRow ? finalRow.endShares : 0;

    const totalWealth = finalPortfolioValue + (activeInputs?.reinvest ? 0 : totalDividends);
    const totalReturnUSD = totalWealth - totalCashInvested;
    const totalReturnPct = totalCashInvested > 0 ? (totalReturnUSD / totalCashInvested) * 100 : 0;

    // Helper: Format Currency pt-BR
    const formatCurrency = (val: number) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- Chart Data ---
    const chartData = useMemo(() => {
        if (!forecast.length) return null;
        return {
            labels: forecast.map(r => r.dateLabel),
            datasets: [
                {
                    type: 'line' as const,
                    label: 'Valor Portfólio ($)',
                    data: forecast.map(r => r.portfolioValue),
                    borderColor: '#f2994a',
                    backgroundColor: 'rgba(242, 153, 74, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true
                },
                {
                    type: 'bar' as const,
                    label: 'Dividendos ($)',
                    data: forecast.map(r => r.dividendIncome),
                    backgroundColor: '#27ae60',
                    yAxisID: 'y1',
                }
            ]
        };
    }, [forecast]);

    // --- Table Data Aggregation ---
    const tableData = useMemo(() => {
        let dataToRender: ForecastRow[];

        if (tableFreq === 'monthly') {
            dataToRender = [...forecast];
        } else {
            // Aggregate by year
            const result: ForecastRow[] = [];
            let currentYearBlock: ForecastRow[] = [];

            forecast.forEach((row) => {
                const lastInBlock = currentYearBlock[currentYearBlock.length - 1];
                if (!lastInBlock || lastInBlock.year === row.year) {
                    currentYearBlock.push(row);
                } else {
                    result.push(aggregateBlock(currentYearBlock));
                    currentYearBlock = [row];
                }
            });
            if (currentYearBlock.length) result.push(aggregateBlock(currentYearBlock));
            dataToRender = result;
        }

        // Sort Data
        if (sortConfig !== null) {
            dataToRender.sort((a, b) => {
                let aValue: any = a[sortConfig.key as keyof ForecastRow];
                let bValue: any = b[sortConfig.key as keyof ForecastRow];

                // Handle dateLabel separately or rely on monthIndex/year for safer sorting if needed
                if (sortConfig.key === 'dateLabel') {
                    // Fallback to monthIndex for correct chronological sorting if sorting by label
                    aValue = a.monthIndex;
                    bValue = b.monthIndex;
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return dataToRender;
    }, [forecast, tableFreq, sortConfig]);

    const handleSort = (key: keyof ForecastRow | 'dateLabel') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    function aggregateBlock(rows: ForecastRow[]): ForecastRow {
        const last = rows[rows.length - 1];
        const sumDiv = rows.reduce((s, r) => s + r.dividendIncome, 0);
        const sumDivPerShare = rows.reduce((s, r) => s + r.dividendPerShare, 0);

        return {
            ...last,
            dateLabel: last.year.toString(),
            dividendIncome: sumDiv,
            dividendPerShare: sumDivPerShare,
        };
    }

    return (
        <div className="calculator-container" style={{ maxWidth: '800px' }}>
            <h2 className="section-title">Calculadora de Renda Fixa Lastreada em Bitcoin (STRC)</h2>
            <p className="section-desc">STRC (Stretch) é um credito de tesouraria da empresa Americana Strategy</p>

            <div className="calculator-card">
                {/* Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', textAlign: 'left', marginBottom: '1.5rem' }}>

                    {/* Start Date Input */}
                    <div className="input-group">
                        <label>Data Inicial</label>
                        <input
                            type="date"
                            value={inputs.startDate}
                            // Min date is the first historical date available
                            min={historical[0]?.date || '2025-08-15'}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={e => handleChange('startDate', e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Cotas Iniciais</label>
                        <input
                            type="number"
                            value={inputs.initialShares}
                            onChange={e => handleChange('initialShares', Number(e.target.value))}
                            placeholder="Ex: 100"
                        />
                    </div>

                    <div className="input-group">
                        <label>Horizonte</label>
                        <select
                            value={inputs.horizonMonths}
                            onChange={e => handleChange('horizonMonths', Number(e.target.value))}
                        >
                            {/* Dynamic "Until Today" Option */}
                            {!standardOptions.includes(monthsToToday) && (
                                <option value={monthsToToday}>Até Hoje ({monthsToToday} Meses)</option>
                            )}

                            <option value={6}>6 Meses</option>
                            <option value={12}>1 Ano</option>
                            <option value={24}>2 Anos</option>
                            <option value={36}>3 Anos</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Frequência Aportes</label>
                        <select
                            value={inputs.contribFreq}
                            onChange={e => handleChange('contribFreq', e.target.value)}
                        >
                            <option value="none">Nenhum</option>
                            <option value="weekly">Semanal</option>
                            <option value="monthly">Mensal</option>
                            <option value="annual">Anual</option>
                        </select>
                    </div>

                    {inputs.contribFreq !== 'none' && (
                        <div className="input-group">
                            <label>Valor Aporte</label>
                            <div className="amount-wrapper">
                                <input
                                    type="number"
                                    value={inputs.contribValue}
                                    onChange={e => handleChange('contribValue', Number(e.target.value))}
                                />
                                <select
                                    value={inputs.contribType}
                                    onChange={e => handleChange('contribType', e.target.value)}
                                    style={{ maxWidth: '80px' }}
                                >
                                    <option value="fixed_amount">$</option>
                                    <option value="fixed_shares">Qtd</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Preço Saída ($)</label>
                        <input
                            type="number"
                            value={isUntilToday ? lastPrice : inputs.exitPrice}
                            onChange={e => handleChange('exitPrice', Number(e.target.value))}
                            step="0.1"
                            disabled={isUntilToday}
                            title={isUntilToday ? "Preço fixado na cotação atual para cálculo 'Até Hoje'" : undefined}
                            style={{ opacity: isUntilToday ? 0.6 : 1, cursor: isUntilToday ? 'not-allowed' : 'default', backgroundColor: isUntilToday ? 'rgba(255,255,255,0.05)' : '' }}
                        />
                    </div>

                    <div className="input-group">
                        <label>Cenário</label>
                        <select
                            value={inputs.scenario}
                            onChange={e => handleChange('scenario', e.target.value)}
                            disabled={isUntilToday}
                            style={{ opacity: isUntilToday ? 0.6 : 1, cursor: isUntilToday ? 'not-allowed' : 'default', backgroundColor: isUntilToday ? 'rgba(255,255,255,0.05)' : '' }}
                        >
                            <option value="base">Base (Estável)</option>
                            <option value="bull">Bull (Preço Alta)</option>
                            <option value="bear">Bear (Preço Baixa)</option>
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', paddingLeft: '4px' }}>
                    <input
                        type="checkbox"
                        checked={inputs.reinvest}
                        onChange={e => handleChange('reinvest', e.target.checked)}
                        id="chk-reinvest"
                        style={{ width: '20px', height: '20px' }}
                        className="accent-[#f2994a]"
                    />
                    <label htmlFor="chk-reinvest" style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>Reinvestir Dividendos Automaticamente</label>
                </div>

                <button className="cta-button" onClick={handleSimulate}>
                    Simular Resultado
                </button>
                {/* Share Buttons */}
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 500 }}>
                        Compartilhe com seus amigos nas redes sociais
                    </p>
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <a href={`https://twitter.com/intent/tweet?text=Simule%20sua%20Renda%20Fixa%20em%20Bitcoin%20com%20a%20calculadora%20STRC!&url=https://viverdebitcoin.com/renda-fixa-btc`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            𝕏
                        </a>
                        <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            IG
                        </a>
                        <a href={`https://wa.me/?text=Simule%20sua%20Renda%20Fixa%20em%20Bitcoin%20com%20a%20calculadora%20STRC!%20https://viverdebitcoin.com/renda-fixa-btc`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {
                showResults && activeInputs && chartData && (
                    <div id="simulation-results" className="result-card fade-in" style={{ display: 'block', marginTop: '2rem' }}>

                        <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Projeção de Rendimentos</h3>

                        {/* Summary Cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px', marginBottom: '2rem' }}>

                            {/* Total Invested */}
                            <div style={{ background: 'rgba(52, 152, 219, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #3498db', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Investido</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#3498db' }}>{formatCurrency(totalCashInvested)}</div>
                            </div>

                            <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid var(--primary-green)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Retorno Total</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-green)' }}>{formatCurrency(totalReturnUSD)}</div>
                                <div style={{ fontSize: '0.9rem', color: '#27ae60' }}>{totalReturnPct.toFixed(2)}% ROI</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Valor Final</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)' }}>{formatCurrency(finalPortfolioValue)}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{totalShares.toFixed(2)} cotas</div>
                            </div>

                            <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Dividendos</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{formatCurrency(totalDividends)}</div>
                            </div>
                        </div>

                        {/* View Switcher */}
                        <div className="view-switcher">
                            <button
                                className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                                onClick={() => setViewMode('chart')}
                            >
                                Gráfico
                            </button>
                            <button
                                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                onClick={() => setViewMode('table')}
                            >
                                Tabela
                            </button>
                        </div>

                        {/* Content */}
                        {
                            viewMode === 'chart' ? (
                                <div className="chart-container" style={{ height: '400px' }}>
                                    <Chart
                                        type="bar"
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            interaction: { mode: 'index', intersect: false },
                                            scales: {
                                                y: {
                                                    position: 'left',
                                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                                    title: { display: true, text: 'Portfolio ($)', color: '#888' },
                                                    ticks: { color: '#888' }
                                                },
                                                y1: {
                                                    position: 'right',
                                                    grid: { drawOnChartArea: false },
                                                    title: { display: true, text: 'Dividendos ($)', color: '#27ae60' },
                                                    ticks: { color: '#27ae60' }
                                                },
                                                x: {
                                                    grid: { color: 'rgba(255,255,255,0.05)' },
                                                    ticks: { color: '#888' }
                                                }
                                            },
                                            plugins: {
                                                legend: { labels: { color: '#888' } },
                                                tooltip: {
                                                    callbacks: {
                                                        label: function (context) {
                                                            let label = context.dataset.label || '';
                                                            if (label) label += ': ';
                                                            if (context.parsed.y !== null) {
                                                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(context.parsed.y);
                                                            }
                                                            return label;
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="table-view-wrapper">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '5px' }}>
                                            <button
                                                onClick={() => setTableFreq('monthly')}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: tableFreq === 'monthly' ? '#f2994a' : 'transparent',
                                                    color: tableFreq === 'monthly' ? '#fff' : 'var(--text-secondary)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Mensal
                                            </button>
                                            <button
                                                onClick={() => setTableFreq('annual')}
                                                style={{
                                                    padding: '6px 16px',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: tableFreq === 'annual' ? '#f2994a' : 'transparent',
                                                    color: tableFreq === 'annual' ? '#fff' : 'var(--text-secondary)',
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Anual
                                            </button>
                                        </div>
                                    </div>

                                    <div className="table-scroll-area" style={{ maxHeight: '400px', overflowY: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <table className="data-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th onClick={() => handleSort('dateLabel')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'left', minWidth: '100px' }}>
                                                        {tableFreq === 'monthly' ? 'Mês' : 'Ano'} {sortConfig?.key === 'dateLabel' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                    <th onClick={() => handleSort('price')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>
                                                        Preço {sortConfig?.key === 'price' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                    <th onClick={() => handleSort('dividendPerShare')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>
                                                        Div/Ação {sortConfig?.key === 'dividendPerShare' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                    <th onClick={() => handleSort('endShares')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>
                                                        Cotas {sortConfig?.key === 'endShares' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                    <th onClick={() => handleSort('dividendIncome')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>
                                                        Renda {sortConfig?.key === 'dividendIncome' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                    <th onClick={() => handleSort('portfolioValue')} style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right' }}>
                                                        Valor Final {sortConfig?.key === 'portfolioValue' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row) => (
                                                    <tr key={row.monthIndex} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '12px', textAlign: 'left' }}>{row.dateLabel}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(row.price)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(row.dividendPerShare)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right' }}>{row.endShares.toFixed(2)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', color: '#27ae60' }}>{formatCurrency(row.dividendIncome)}</td>
                                                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(row.portfolioValue)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )
                        }
                    </div >
                )
            }
        </div >
    );
}
