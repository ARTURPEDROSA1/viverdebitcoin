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
    LineElement,
    PointElement,
    LogarithmicScale,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import Link from 'next/link';
import { useSettings } from '@/contexts/SettingsContext';
import { bitcoinHistoricalData, exchangeRatesHistorical } from '@/lib/historicalData';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LineElement,
    PointElement,
    LogarithmicScale
);

// Register custom tooltip positioner
(Tooltip.positioners as any).fixedTop = function (elements: any[], eventPosition: any) {
    if (!elements.length) {
        return false;
    }
    // Return fixed coordinates
    return {
        x: elements[0].element.x,
        y: 20 // Fixed Y position
    };
};

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
    const [ppChartData, setPpChartData] = useState<any>(null);
    const [satsChartData, setSatsChartData] = useState<any>(null);
    const [volatilityChartData, setVolatilityChartData] = useState<any>(null);
    const [cagrChartData, setCagrChartData] = useState<any>(null);
    const [volatilityStartYear, setVolatilityStartYear] = useState<2011 | 2016>(2011);
    const [currentBtcPrice, setCurrentBtcPrice] = useState<number | null>(null);
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);

    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

    const [scaleType, setScaleType] = useState<'linear' | 'logarithmic'>('linear');
    const [tableData, setTableData] = useState<any[]>([]);

    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

    // Context-aware refs for the sync behavior
    const wageChartRef = useRef<ChartJS<'bar'>>(null);
    const btcChartRef = useRef<ChartJS<'bar'>>(null);
    const ppChartRef = useRef<ChartJS<'line'>>(null);
    const satsChartRef = useRef<ChartJS<'line'>>(null);
    const volChartRef = useRef<ChartJS<'line'>>(null);
    const cagrChartRef = useRef<ChartJS<'line'>>(null);

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
                // Try AwesomeAPI first (Used in other components)
                const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                if (resBRL.ok) {
                    const dataBRL = await resBRL.json();
                    if (dataBRL.BTCBRL && dataBRL.BTCBRL.bid) {
                        setCurrentBtcPrice(parseFloat(dataBRL.BTCBRL.bid));
                        setIsLoadingPrice(false);
                        return;
                    }
                }
                throw new Error('AwesomeAPI failed');
            } catch (error) {
                // Fallback to Binance
                try {
                    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL');
                    const data = await response.json();
                    if (data.price) {
                        setCurrentBtcPrice(parseFloat(data.price));
                    }
                } catch (e2) {
                    console.error('Error fetching BTC price:', error);
                }
            } finally {
                setIsLoadingPrice(false);
            }
        };
        fetchPrice();
    }, []);

    useEffect(() => {
        const processData = () => {
            const processed = wageData.map((item, index) => {
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

                // Use live price for 2025 if available
                if (year === 2025 && currentBtcPrice) {
                    btcPriceBRL = currentBtcPrice;
                }

                const purchasingPower = btcPriceBRL / item.wage;
                const satsPerWage = btcPriceBRL > 0 ? (item.wage / btcPriceBRL) * 100000000 : 0;

                // Calculate Annual Change %
                let wageChangePct = 0;
                let btcChangePct = 0;

                if (index > 0) {
                    const prevWage = wageData[index - 1].wage;
                    wageChangePct = ((item.wage - prevWage) / prevWage) * 100;

                    // For BTC, retrieve previous year's calculated price BRL from previous iteration concept
                    // Since we map simultaneously, we might need a separate pass or look up raw data again.
                    // Simpler: recalculate prev year BRL for comparison.
                    const prevYearItem = wageData[index - 1];
                    // ... (re-implementing prev year logic briefly or accessing from array if we two-pass map? No, map is index based)
                    // Let's settle for 0 on first item.

                    // Actually, let's do a 2-pass approach or just calculate prev BTC here.
                    // Optimization: We can just use the previous value in the reduced array if we used reduce, but map is fine.
                    // We need previous BTC Price BRL.

                    // ... (Logic to get prev BTC Price BRL similar to current) ...
                    // To avoid duplicating logic, let's just use the `btcPriceBRL` which we just calculated, but we need the PREVIOUS one.
                    // Let's store raw BRL prices in a temp array before mapping? 
                    // Or easier: 
                }

                return {
                    year,
                    wage: item.wage,
                    btcPriceBRL,
                    purchasingPower,
                    satsPerWage
                };
            });

            // Filter processed data based on selected start year
            const volProcessed = processed.filter(d => d.year >= volatilityStartYear);

            // Calculate Volatility Data (Pass 2)
            const volatilityData = volProcessed.map((item, index) => {
                if (index === 0) return { year: item.year, wageChange: 0, btcChange: 0 };
                const prev = volProcessed[index - 1];
                const wageChange = ((item.wage - prev.wage) / prev.wage) * 100;

                // Handle potential 0 division or initial data
                const btcChange = prev.btcPriceBRL > 0 ? ((item.btcPriceBRL - prev.btcPriceBRL) / prev.btcPriceBRL) * 100 : 0;

                return {
                    year: item.year,
                    wageChange,
                    btcChange
                };
            }).slice(0); // Keep all years (start year is 0%)

            setTableData(processed);

            // Volatility Chart Data
            setVolatilityChartData({
                labels: volatilityData.map(d => d.year),
                datasets: [
                    {
                        type: 'line' as const,
                        label: t('min_wage.vol_btc_legend'),
                        data: volatilityData.map(d => d.btcChange),
                        borderColor: '#e67e22', // Orange for BTC
                        backgroundColor: 'rgba(230, 126, 34, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.1, // Less smooth to show volatility
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: t('min_wage.vol_wage_legend'),
                        data: volatilityData.map(d => d.wageChange),
                        borderColor: '#3498db', // Blue for Wage
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.1,
                        yAxisID: 'y',
                    }
                ]
            });

            // Calculate Cumulative CAGR (Average Annual Growth) from start
            const cagrData = volProcessed.map((item, index) => {
                const years = index; // 0 for start year, 1 for next...
                if (years < 1) return { year: item.year, btcCAGR: 0, wageCAGR: 0 };

                const startWage = volProcessed[0].wage;
                const startBtc = volProcessed[0].btcPriceBRL;

                const currentWage = item.wage;
                const currentBtc = item.btcPriceBRL;

                const wageCAGR = ((Math.pow(currentWage / startWage, 1 / years) - 1) * 100);
                const btcCAGR = ((Math.pow(currentBtc / startBtc, 1 / years) - 1) * 100);

                return {
                    year: item.year,
                    btcCAGR,
                    wageCAGR
                };
            });

            setCagrChartData({
                labels: cagrData.map(d => d.year),
                datasets: [
                    {
                        type: 'line' as const,
                        label: t('min_wage.cagr_legend_btc'),
                        data: cagrData.map(d => d.btcCAGR),
                        borderColor: '#f1c40f', // Gold
                        backgroundColor: 'rgba(241, 196, 15, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.4,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: t('min_wage.cagr_legend_wage'),
                        data: cagrData.map(d => d.wageCAGR),
                        borderColor: '#3498db', // Blue
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        pointRadius: 3,
                        tension: 0.4,
                        yAxisID: 'y',
                    }
                ]
            });

            // Sats Chart Data
            setSatsChartData({
                labels: processed.map(d => d.year),
                datasets: [
                    {
                        type: 'line' as const,
                        label: t('min_wage.sats_legend'),
                        data: processed.map(d => d.satsPerWage),
                        borderColor: '#27ae60', // Green for hope/accumulation
                        backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(39, 174, 96, 0.5)');
                            gradient.addColorStop(1, 'rgba(39, 174, 96, 0.1)');
                            return gradient;
                        },
                        pointBackgroundColor: '#2ecc71',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#2ecc71',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                    }
                ]
            });

            // PP Chart Data
            setPpChartData({
                labels: processed.map(d => d.year),
                datasets: [
                    {
                        type: 'line' as const,
                        label: t('min_wage.chart_pp_label'),
                        data: processed.map(d => d.purchasingPower),
                        borderColor: '#9b59b6',
                        backgroundColor: (context: any) => {
                            const ctx = context.chart.ctx;
                            const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                            gradient.addColorStop(0, 'rgba(155, 89, 182, 0.5)');
                            gradient.addColorStop(1, 'rgba(142, 68, 173, 0.1)');
                            return gradient;
                        },
                        pointBackgroundColor: '#8e44ad',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: '#8e44ad',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                    },
                    {
                        type: 'line' as const,
                        label: t('min_wage.pp_ref_35y'),
                        data: processed.map(() => 40 * 12), // 480 salaries
                        borderColor: 'rgba(255, 255, 255, 0.4)',
                        borderDash: [6, 6],
                        borderWidth: 1,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        fill: false,
                        yAxisID: 'y',
                    }
                ]
            });

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
        processData();
    }, [t, currentBtcPrice, volatilityStartYear]);

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
    const handleHover = (event: ChartEvent, activeElements: ActiveElement[], otherChartRefs: any[]) => {
        otherChartRefs.forEach(ref => {
            const otherChart = ref.current;
            if (otherChart) {
                if (activeElements.length > 0) {
                    const index = activeElements[0].index;
                    const newActiveElements = otherChart.data.datasets.map((_: any, i: number) => ({
                        datasetIndex: i,
                        index: index
                    }));

                    otherChart.setActiveElements(newActiveElements);
                    if (otherChart.tooltip) {
                        otherChart.tooltip.setActiveElements(newActiveElements, { x: 0, y: 0 });
                    }
                } else {
                    otherChart.setActiveElements([]);
                    if (otherChart.tooltip) {
                        otherChart.tooltip.setActiveElements([], { x: 0, y: 0 });
                    }
                }
                otherChart.update('none'); // Update without animation
            }
        });
    };

    // Chart Options for Wage (Top Chart)
    const wageOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [btcChartRef, ppChartRef, satsChartRef, volChartRef, cagrChartRef]),
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
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
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
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [wageChartRef, ppChartRef, satsChartRef, volChartRef, cagrChartRef]),
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
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
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
                    display: true,
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

    // Chart Options for Purchasing Power (Bottom Chart)
    const ppOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [wageChartRef, btcChartRef, satsChartRef, volChartRef, cagrChartRef]),
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
                    font: { family: "'Inter', sans-serif", size: 12 },
                    padding: 20
                }
            },
            title: { display: false },
            tooltip: {
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const val = context.parsed.y;
                        const years = (val / 12).toFixed(1);
                        return `${context.dataset.label}: ${val.toFixed(2)} (${years} ${t('min_wage.pp_tooltip_years')})`;
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
                type: scaleType,
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: t('min_wage.chart_pp_label'),
                    color: '#9b59b6',
                    font: { family: "'Inter', sans-serif", size: 12, weight: 'bold' as const }
                },
                grid: {
                    color: isLightMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: isLightMode ? '#64748b' : '#94a3b8',
                    font: { family: "'Inter', sans-serif", size: 11 }
                },
                border: { display: false }
            }
        }
    };

    // Chart Options for Sats (New Bottom Chart)
    const satsOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [wageChartRef, btcChartRef, ppChartRef, volChartRef, cagrChartRef]),
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
                    font: { family: "'Inter', sans-serif", size: 12 },
                    padding: 20
                }
            },
            title: { display: false },
            tooltip: {
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const val = context.parsed.y;
                        return `${context.dataset.label}: ${Math.floor(val).toLocaleString('pt-BR')} sats`;
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
                type: 'linear' as const, // Always linear for simplicity as per request
                display: true,
                position: 'left' as const,
                title: {
                    display: true,
                    text: 'Sats',
                    color: '#27ae60',
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
                        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
                        if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
                        return val;
                    }
                },
                border: { display: false }
            }
        }
    };

    // Chart Options for Volatility (New Bottom Chart)
    const volOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [wageChartRef, btcChartRef, ppChartRef, satsChartRef, cagrChartRef]),
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
                    font: { family: "'Inter', sans-serif", size: 12 },
                    padding: 20
                }
            },
            title: { display: false },
            tooltip: {
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const val = context.parsed.y;
                        const label = context.dataset.label;

                        if (val === null || val === undefined) return '';

                        const sign = val >= 0 ? '+' : '';
                        return `${label}: ${sign}${val.toFixed(2)}%`;
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
                    text: t('min_wage.chart_vol_label'),
                    color: '#e74c3c',
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
                        return value + '%';
                    }
                },
                border: { display: false }
            }
        }
    };

    // CAGR Chart Options
    const cagrOptions = {
        responsive: true,
        maintainAspectRatio: false,
        onHover: (event: ChartEvent, elements: ActiveElement[]) => handleHover(event, elements, [wageChartRef, btcChartRef, ppChartRef, satsChartRef, volChartRef]),
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
                    font: { family: "'Inter', sans-serif", size: 12 },
                    padding: 20
                }
            },
            title: { display: false },
            tooltip: {
                position: 'fixedTop' as any,
                yAlign: 'top' as const,
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                titleFont: { family: "'Inter', sans-serif", size: 13 },
                bodyFont: { family: "'Inter', sans-serif", size: 13 },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: function (context: any) {
                        const val = context.parsed.y;
                        const label = context.dataset.label;
                        if (val === null || val === undefined) return '';
                        return `${label}: ${val.toFixed(2)}%`;
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
                    text: 'CAGR (%)',
                    color: '#95a5a6',
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
                        return value + '%';
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
        <div className="calculator-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }} >
            <h1 className="section-title">{t('min_wage.title')}</h1>
            <p className="section-desc">{t('min_wage.subtitle')}</p>

            {
                isLoadingPrice && (
                    <p className="text-sm text-gray-500 animate-pulse mt-1 mb-4 text-center">
                        {t('common.updating')}
                    </p>
                )
            }

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
                        <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isLightMode ? '#333' : '#fff', marginBottom: '4px' }}>
                                {t('min_wage.chart_nominal_title')}
                            </h3>
                            <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                {t('min_wage.chart_nominal_subtitle')}
                            </p>
                        </div>
                        {/* Wage Chart */}
                        <div style={{ marginBottom: '30px' }}>
                            <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginBottom: '16px' }}>{t('min_wage.wage_chart_subtitle')}</p>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {wageChartData && <Bar ref={wageChartRef} options={wageOptions} data={wageChartData} />}
                            </div>
                        </div>

                        {/* BTC Chart */}
                        <div>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {btcChartData && <Bar ref={btcChartRef} options={btcOptions} data={btcChartData} />}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginTop: '16px' }}>{t('min_wage.btc_chart_subtitle')}</p>
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
                                        <th
                                            onClick={() => handleSort('purchasingPower')}
                                            style={{ cursor: 'pointer', position: 'sticky', top: 0, backgroundColor: '#1a1a1a', zIndex: 20, padding: '12px', borderBottom: '2px solid #333', textAlign: 'right', color: '#fff', fontWeight: 'bold' }}
                                        >
                                            {t('min_wage.chart_pp_label')} {sortConfig?.key === 'purchasingPower' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}
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
                                            <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'monospace', color: '#9b59b6' }}>
                                                {row.purchasingPower?.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {
                viewMode === 'chart' && (
                    <>
                        <div className="calculator-card" style={{ background: '#1e1e1e', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginTop: '24px' }}>
                            <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isLightMode ? '#333' : '#fff', marginBottom: '4px' }}>
                                    {t('min_wage.chart_pp_title')}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {t('min_wage.chart_pp_subtitle')}
                                </p>
                            </div>


                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {/* Scale Toggle Overlay */}
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', alignItems: 'center', zIndex: 10, background: 'rgba(30,30,30,0.8)', padding: '4px 8px', borderRadius: '8px' }}>
                                    <button
                                        onClick={() => setScaleType('linear')}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: scaleType === 'linear' ? '#9b59b6' : '#666',
                                            padding: '0',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            fontWeight: scaleType === 'linear' ? 'bold' : 'normal',
                                            textDecoration: scaleType === 'linear' ? 'underline' : 'none',
                                            textUnderlineOffset: '4px'
                                        }}
                                    >
                                        Linear
                                    </button>
                                    <span style={{ color: '#444', fontSize: '0.7rem' }}>/</span>
                                    <button
                                        onClick={() => setScaleType('logarithmic')}
                                        title={t('min_wage.log_tooltip')}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: scaleType === 'logarithmic' ? '#9b59b6' : '#666',
                                            padding: '0',
                                            fontSize: '0.7rem',
                                            cursor: 'pointer',
                                            fontWeight: scaleType === 'logarithmic' ? 'bold' : 'normal',
                                            textDecoration: scaleType === 'logarithmic' ? 'underline' : 'none',
                                            textUnderlineOffset: '4px'
                                        }}
                                    >
                                        Logarítmica
                                    </button>
                                </div>
                                {ppChartData && <Line ref={ppChartRef} options={ppOptions} data={ppChartData} />}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginTop: '16px', marginBottom: '40px' }}>
                                {t('min_wage.chart_pp_note')}
                            </p>

                            {/* Divider */}
                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', width: '100%', marginBottom: '40px' }} />

                            {/* Sats Chart Section */}
                            <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isLightMode ? '#333' : '#fff', marginBottom: '4px' }}>
                                    {t('min_wage.chart_sats_title')}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {t('min_wage.chart_sats_subtitle')}
                                </p>
                            </div>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {satsChartData && <Line ref={satsChartRef} options={satsOptions} data={satsChartData} />}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginTop: '16px' }}>
                                {t('min_wage.chart_sats_note_prefix')}
                                <Link href="/calculadora-sats" style={{ color: '#27ae60', textDecoration: 'underline' }}>
                                    {t('min_wage.chart_sats_note_link')}
                                </Link>
                                {t('min_wage.chart_sats_note_suffix')}
                            </p>
                        </div>

                        {/* Volatility Card */}
                        <div className="calculator-card" style={{ background: '#1e1e1e', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', marginTop: '24px' }}>
                            <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isLightMode ? '#333' : '#fff', marginBottom: '4px' }}>
                                    {t('min_wage.chart_vol_title')}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {t('min_wage.chart_vol_subtitle')}
                                </p>
                            </div>

                            {/* Toggle Start Year */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '20px' }}>
                                <button
                                    onClick={() => setVolatilityStartYear(2011)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: volatilityStartYear === 2011 ? '#f1c40f' : '#666',
                                        padding: '0',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        fontWeight: volatilityStartYear === 2011 ? 'bold' : 'normal',
                                        textDecoration: volatilityStartYear === 2011 ? 'underline' : 'none',
                                        textUnderlineOffset: '4px'
                                    }}
                                >
                                    Desde 2011
                                </button>
                                <span style={{ color: '#444', fontSize: '0.85rem' }}>/</span>
                                <button
                                    onClick={() => setVolatilityStartYear(2016)}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: volatilityStartYear === 2016 ? '#f1c40f' : '#666',
                                        padding: '0',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        fontWeight: volatilityStartYear === 2016 ? 'bold' : 'normal',
                                        textDecoration: volatilityStartYear === 2016 ? 'underline' : 'none',
                                        textUnderlineOffset: '4px'
                                    }}
                                >
                                    Desde 2016
                                </button>
                            </div>

                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {volatilityChartData && <Line ref={volChartRef} options={volOptions} data={volatilityChartData} />}
                            </div>

                            <div style={{ margin: '30px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>

                            {/* CAGR Chart */}
                            <div className="chart-header" style={{ marginBottom: '10px', textAlign: 'center' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: isLightMode ? '#333' : '#fff', marginBottom: '4px' }}>
                                    {t('min_wage.chart_cagr_title')}
                                </h3>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {t('min_wage.chart_cagr_subtitle')}
                                </p>
                            </div>
                            <div className="chart-container" style={{ height: '250px', width: '100%', position: 'relative' }}>
                                {cagrChartData && <Line ref={cagrChartRef} options={cagrOptions} data={cagrChartData} />}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', marginTop: '16px' }}>
                                {t('min_wage.chart_vol_note')}
                            </p>
                        </div>
                    </>
                )
            }
        </div >
    );
}
