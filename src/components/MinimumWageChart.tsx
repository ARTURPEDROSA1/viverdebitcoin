'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ActiveElement,
    ChartEvent,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useSettings } from '@/contexts/SettingsContext';
import { bitcoinHistoricalData, exchangeRatesHistorical } from '@/lib/historicalData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const wageData = [
    { year: 2011, wage: 545 },
    { year: 2012, wage: 622 },
    { year: 2013, wage: 678 },
    { year: 2014, wage: 724 },
    { year: 2015, wage: 788 },
    { year: 2016, wage: 880 },
    { year: 2017, wage: 937 },
    { year: 2018, wage: 954 },
    { year: 2019, wage: 998 },
    { year: 2020, wage: 1045 },
    { year: 2021, wage: 1100 },
    { year: 2022, wage: 1212 },
    { year: 2023, wage: 1320 },
    { year: 2024, wage: 1412 },
    { year: 2025, wage: 1518 }, // Projeção
];

export default function MinimumWageChart() {
    const { t } = useSettings();
    const [isLightMode, setIsLightMode] = useState(false);
    const [chartData, setChartData] = useState<any>(null);
    const [currentBtcPrice, setCurrentBtcPrice] = useState<number | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [tableData, setTableData] = useState<any[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Context-aware refs for the sync behavior
    const wageChartRef = useRef<ChartJS<'bar'>>(null);
    const btcChartRef = useRef<ChartJS<'bar'>>(null);

    useEffect(() => {
        // Theme Observer
        const checkTheme = () => setIsLightMode(document.body.classList.contains('light-mode'));
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    // Fetch live BTC price
    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL');
                const data = await response.json();
                if (data.price) {
                    setCurrentBtcPrice(parseFloat(data.price));
                }
            } catch (error) {
                console.error('Error fetching BTC price:', error);
            } finally {
                setIsLoadingPrice(false);
            }
        };
        fetchPrice();
    }, []);

    useEffect(() => {
        const processData = () => {
            const processed = wageData.map(item => {
                const year = item.year;
                let dateStr = `${year}-12-31`;
                let btcPriceUSD = (bitcoinHistoricalData as any)[dateStr];

                // Fallback dates
                if (!btcPriceUSD) btcPriceUSD = (bitcoinHistoricalData as any)[`${year}-12-30`];
                if (!btcPriceUSD) btcPriceUSD = (bitcoinHistoricalData as any)[`${year}-12-29`];
                if (!btcPriceUSD) btcPriceUSD = (bitcoinHistoricalData as any)[`${year}-12-28`];

                // Manual overrides for early years (Heatmap Source)
                if (year === 2011) btcPriceUSD = 4.72;
                if (year === 2012) btcPriceUSD = 13.45;
                if (year === 2013) btcPriceUSD = 732;

                // Get Exchange Rate
                // @ts-ignore
                let rate = exchangeRatesHistorical.BRL ? exchangeRatesHistorical.BRL[dateStr] : null;

                // Fallback rate logic
                if (!rate && exchangeRatesHistorical.BRL) {
                    // @ts-ignore
                    rate = exchangeRatesHistorical.BRL[`${year}-12-30`] || exchangeRatesHistorical.BRL[`${year}-12-29`];
                }

                // Hardcoded fallback rates
                if (!rate) {
                    if (year === 2010) rate = 1.66;
                    if (year === 2011) rate = 1.87;
                    if (year === 2012) rate = 2.04;
                    if (year === 2013) rate = 2.34;
                }

                if (year === 2025) {
                    rate = 6.10; // Projeção
                }

                // Ensure we have a rate default if still null (shouldn't happen with above, but safe)
                rate = rate || 1;

                let btcPriceBRL = btcPriceUSD ? btcPriceUSD * rate : 0;

                if (year === 2025) {
                    // Fallback for 2025 if historical data is missing/future
                    if (!btcPriceUSD) {
                        btcPriceBRL = 600000; // Approx based on current market (~100k USD)
                    }
                }

                // Use live price for 2025 if available
                if (year === 2025 && currentBtcPrice) {
                    btcPriceBRL = currentBtcPrice;
                }

                return {
                    year,
                    wage: item.wage,
                    btcPriceBRL,
                };
            });

            setTableData(processed);

            setChartData({
                labels: processed.map(d => d.year),
                datasets: [
                    {
                        type: 'bar' as const,
                        label: t('min_wage.chart_wage'),
                        data: processed.map(d => d.wage),
                        backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, '#2ecc71');
                            gradient.addColorStop(1, '#27ae60');
                            return gradient;
                        },
                        borderRadius: 4,
                        borderSkipped: false,
                        yAxisID: 'y',
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    },
                    {
                        type: 'bar' as const,
                        label: t('min_wage.chart_btc_price'),
                        data: processed.map(d => d.btcPriceBRL),
                        backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, '#f1c40f');
                            gradient.addColorStop(1, '#d35400');
                            return gradient;
                        },
                        borderRadius: 4,
                        borderSkipped: false,
                        yAxisID: 'y', // Share the same axis for true comparison
                        barPercentage: 0.6,
                        categoryPercentage: 0.8
                    }
                ]
            });
        };

        processData();
    }, [t, currentBtcPrice]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...tableData].sort((a, b) => {
        if (!sortConfig) return 0;

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    // Currency formatter
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Handle sync hover
    const handleHover = (event: ChartEvent, activeElements: ActiveElement[], otherChartRef: React.RefObject<ChartJS<'bar'> | null>) => {
        const otherChart = otherChartRef.current;
        if (otherChart) {
            if (activeElements.length > 0) {
                const index = activeElements[0].index;
                const datasetIndex = 0; // Each chart has only 1 dataset at idx 0

                // Sync Active Elements (Highlight)
                otherChart.setActiveElements([{ datasetIndex, index }]);

                // Sync Tooltip
                if (otherChart.tooltip) {
                    // Start the tooltip over the element
                    otherChart.tooltip.setActiveElements([{ datasetIndex, index }], { x: 0, y: 0 });
                }

                otherChart.update('none'); // Update without animation
            } else {
                otherChart.setActiveElements([]);
                if (otherChart.tooltip) {
                    otherChart.tooltip.setActiveElements([], { x: 0, y: 0 });
                }
                otherChart.update('none');
            }
        }
    };

    // Chart Options for Wage (Top Chart)
    const wageOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, btcChartRef),
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            },
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { display: false } // Hide X labels for top chart
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: t('min_wage.chart_wage'),
                    color: '#2ecc71',
                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const }
                },
                grid: {
                    color: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: isLightMode ? '#64748b' : '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 11 },
                    callback: function (value: any) { return 'R$ ' + value; }
                },
                border: { display: false }
            }
        }
    };

    // Chart Options for Bitcoin (Bottom Chart)
    const btcOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, wageChartRef),
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'start' as const,
                labels: {
                    usePointStyle: true,
                    boxWidth: 10,
                    font: { family: "'Inter', sans-serif", size: 12 }
                }
            },
            title: { display: false },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: isLightMode ? '#64748b' : '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 11 }
                }
            },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: t('min_wage.chart_btc_price'),
                    color: '#f39c12',
                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const }
                },
                grid: {
                    color: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: isLightMode ? '#64748b' : '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 11 },
                    callback: function (value: any) {
                        const val = Number(value);
                        if (val >= 1000000) return (val / 1000000) + 'M';
                        if (val >= 1000) return (val / 1000) + 'k';
                        return val;
                    }
                },
                border: { display: false }
            }
        }
    };

    // Prepare separate dataset objects
    const wageChartData = chartData ? {
        labels: chartData.labels,
        datasets: [chartData.datasets[0]]
    } : null;

    const btcChartData = chartData ? {
        labels: chartData.labels,
        datasets: [chartData.datasets[1]]
    } : null;

    return (
        <div className="calculator-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <h1 className="section-title">{t('min_wage.title')}</h1>
            <p className="section-desc">{t('min_wage.subtitle')}</p>

            {isLoadingPrice && (
                <p className="text-sm text-gray-500 animate-pulse mt-1 mb-4 text-center">
                    {t('common.updating')}
                </p>
            )}

            {/* View Switcher - Copied directly from RendaFixaCalculator structure */}
            <div className="view-switcher" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '10px' }}>
                <button
                    className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                    onClick={() => setViewMode('chart')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewMode === 'chart' ? '#27ae60' : 'rgba(255,255,255,0.05)',
                        color: viewMode === 'chart' ? '#fff' : '#888',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    Gráfico
                </button>
                <button
                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => setViewMode('table')}
                    style={{
                        padding: '8px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        background: viewMode === 'table' ? '#27ae60' : 'rgba(255,255,255,0.05)',
                        color: viewMode === 'table' ? '#fff' : '#888',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.3s ease'
                    }}
                >
                    Tabela
                </button>
            </div>

            <div className="calculator-card" style={{ background: '#1e1e1e', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                {viewMode === 'chart' ? (
                    <>
                        {/* Wage Chart */}
                        <div style={{ marginBottom: '30px' }}>
                            <p className="text-center text-xs text-gray-500 mb-4 font-medium">{t('min_wage.wage_chart_subtitle')}</p>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {wageChartData && <Bar ref={wageChartRef} options={wageOptions} data={wageChartData} />}
                            </div>
                        </div>

                        {/* BTC Chart */}
                        <div>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {btcChartData && <Bar ref={btcChartRef} options={btcOptions} data={btcChartData} />}
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-4 font-medium">{t('min_wage.btc_chart_subtitle')}</p>
                        </div>
                    </>
                ) : (
                    <div className="table-view-wrapper">
                        <div className="table-scroll-area" style={{ maxHeight: '500px', overflowY: 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <table className="data-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th
                                            onClick={() => handleSort('year')}
                                            style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'left', color: '#fff', fontWeight: 'bold' }}
                                        >
                                            {t('min_wage.table_year')} {sortConfig?.key === 'year' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th
                                            onClick={() => handleSort('wage')}
                                            style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}
                                        >
                                            {t('min_wage.table_wage')} {sortConfig?.key === 'wage' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                        <th
                                            onClick={() => handleSort('btcPriceBRL')}
                                            style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}
                                        >
                                            {t('min_wage.table_btc_price')} {sortConfig?.key === 'btcPriceBRL' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData.map((row) => (
                                        <tr key={row.year} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px', textAlign: 'left', color: '#e0e0e0' }}>{row.year}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', color: '#ccc' }}>
                                                {formatCurrency(row.wage)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#f2994a' }}>
                                                {formatCurrency(row.btcPriceBRL)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
