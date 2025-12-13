'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { bitcoinHistoricalData } from '@/lib/historicalData';
import { heatmapTranslations } from '@/data/heatmapTranslations';

// Color scale function
const getColor = (value: number | null) => {
    if (value === null) return 'transparent';
    if (value === 0) return '#f3f4f6'; // Grayish for 0

    // Green for positive
    if (value > 0) {
        if (value < 5) return 'rgba(39, 174, 96, 0.2)';
        if (value < 10) return 'rgba(39, 174, 96, 0.4)';
        if (value < 20) return 'rgba(39, 174, 96, 0.6)';
        if (value < 40) return 'rgba(39, 174, 96, 0.8)';
        return 'rgba(39, 174, 96, 1)'; // Deep green
    }

    // Red for negative
    const abs = Math.abs(value);
    if (abs < 5) return 'rgba(220, 38, 38, 0.2)';
    if (abs < 10) return 'rgba(220, 38, 38, 0.4)';
    if (abs < 20) return 'rgba(220, 38, 38, 0.6)';
    if (abs < 40) return 'rgba(220, 38, 38, 0.8)';
    return 'rgba(220, 38, 38, 1)'; // Deep red
};

const getTextColor = (value: number | null) => {
    if (value === null) return 'inherit';
    const abs = Math.abs(value);
    // If background is dark (high opacity), use white text
    if (abs >= 20) return '#fff';
    return 'var(--text-main)';
};

// Explicit monthly data [Year] -> [Month 0-11] -> {open, close}
const MANUAL_MONTHLY_DATA: { [year: number]: { [month: number]: { open: number, close: number } } } = {
    2011: {
        0: { open: 0.30, close: 0.96 }, // Jan
        1: { open: 0.96, close: 0.91 }, // Feb (Parity dip)
        2: { open: 0.91, close: 0.83 }, // Mar
        3: { open: 0.83, close: 3.50 }, // Apr
        4: { open: 3.50, close: 8.89 }, // May
        5: { open: 8.89, close: 16.10 }, // Jun
        6: { open: 16.10, close: 13.40 }, // Jul
        7: { open: 13.40, close: 8.20 }, // Aug
        8: { open: 8.20, close: 4.80 }, // Sep
        9: { open: 4.80, close: 3.25 }, // Oct
        10: { open: 3.25, close: 2.98 }, // Nov
        11: { open: 2.98, close: 4.72 }  // Dec (Ended ~4.70)
    },
    2012: {
        0: { open: 4.72, close: 5.50 }, // Jan
        1: { open: 5.50, close: 4.90 }, // Feb (matches user direction)
        2: { open: 4.90, close: 4.85 }, // Mar
        3: { open: 4.85, close: 4.95 }, // Apr
        4: { open: 4.95, close: 5.15 }, // May
        5: { open: 5.15, close: 6.50 }, // Jun
        6: { open: 6.50, close: 9.20 }, // Jul
        7: { open: 9.20, close: 10.10 }, // Aug
        8: { open: 10.10, close: 12.30 }, // Sep
        9: { open: 12.30, close: 11.10 }, // Oct
        10: { open: 11.10, close: 12.50 }, // Nov
        11: { open: 12.50, close: 13.45 }  // Dec
    },
    2013: {
        0: { open: 13, close: 20 },
        1: { open: 20, close: 33 },
        2: { open: 35, close: 96 },
        3: { open: 105, close: 140 },
        4: { open: 117, close: 128 },
        5: { open: 129, close: 89 },
        6: { open: 84, close: 98 },
        7: { open: 97, close: 128 },
        8: { open: 131, close: 126 },
        9: { open: 127, close: 203 },
        10: { open: 203, close: 1118 },
        11: { open: 1118, close: 732 } // Adjusted Open 953 -> 1118 per standard logic? No, use User data: 953
    },
    2014: {
        0: { open: 753, close: 803 },
        1: { open: 813, close: 553 },
        2: { open: 567, close: 457 },
        3: { open: 479, close: 447 },
        4: { open: 461, close: 627 },
        5: { open: 630, close: 639 },
        6: { open: 639, close: 582 },
        7: { open: 598, close: 479 }
    }
};

// Correction for 2013-Dec based on user input check: "2013 Dec 953 732"
MANUAL_MONTHLY_DATA[2013][11].open = 953;

export default function BitcoinHeatmap() {
    const { t, language } = useSettings();
    const [livePrice, setLivePrice] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Type definition for cell data
    type CellData = { percent: number; open: number; close: number };
    type AnnualData = { percent: number; open: number; close: number };

    // State now holds objects with full data instead of just percentages
    const [monthlyReturns, setMonthlyReturns] = useState<{ [year: number]: { [month: number]: CellData, annual: AnnualData } }>({});

    // Tooltip state
    const [hoverData, setHoverData] = useState<{ x: number, y: number, open: number, close: number } | null>(null);

    // Fetch Live Price
    const fetchLivePrice = async () => {
        try {
            const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
            const data = await res.json();
            if (data.bpi && data.bpi.USD) {
                setLivePrice(data.bpi.USD.rate_float);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error("Error fetching live price:", e);
        }
    };

    useEffect(() => {
        fetchLivePrice();
        const interval = setInterval(fetchLivePrice, 300000);
        return () => clearInterval(interval);
    }, []);

    // Process Historical Data
    useEffect(() => {
        const calculateReturns = () => {
            const data = bitcoinHistoricalData as { [date: string]: number };
            const dates = Object.keys(data).sort(); // Ascending "YYYY-MM-DD"

            if (dates.length === 0) return;

            const returns: { [year: number]: { [month: number]: CellData, annual?: AnnualData } } = {};

            // Helper to get price
            const getPrice = (dateStr: string): number | null => {
                if (data[dateStr]) return data[dateStr];
                for (let i = dates.length - 1; i >= 0; i--) {
                    if (dates[i] <= dateStr) return data[dates[i]];
                }
                return null;
            };

            const startYear = 2011;
            const endYear = new Date().getFullYear();

            for (let year = startYear; year <= endYear; year++) {
                if (!returns[year]) returns[year] = {} as any;

                let annualOpen: number | null = null;
                let annualClose: number | null = null;

                // Determine Annual Open/Close
                if (MANUAL_MONTHLY_DATA[year]) {
                    if (MANUAL_MONTHLY_DATA[year][0]) annualOpen = MANUAL_MONTHLY_DATA[year][0].open;
                    const months = Object.keys(MANUAL_MONTHLY_DATA[year]).map(Number).sort((a, b) => b - a);
                    if (months.length > 0) annualClose = MANUAL_MONTHLY_DATA[year][months[0]].close;
                }

                // Fallback / Overwrite with historical data if not in manual (or if manual ended early like 2014)
                if (!annualOpen) annualOpen = getPrice(`${year - 1}-12-31`);
                if ((!MANUAL_MONTHLY_DATA[year] || year > 2014) && !annualClose) {
                    annualClose = getPrice(`${year}-12-31`);
                }

                if (year === new Date().getFullYear() && livePrice) {
                    annualClose = livePrice;
                }

                for (let month = 0; month < 12; month++) {
                    let open: number | null = null;
                    let close: number | null = null;

                    // 1. Check Manual Data
                    if (MANUAL_MONTHLY_DATA[year] && MANUAL_MONTHLY_DATA[year][month]) {
                        open = MANUAL_MONTHLY_DATA[year][month].open;
                        close = MANUAL_MONTHLY_DATA[year][month].close;
                    } else {
                        // 2. Standard Calculation
                        let prevMonthY = year;
                        let prevMonthM = month - 1;
                        if (prevMonthM < 0) {
                            prevMonthM = 11;
                            prevMonthY = year - 1;
                        }
                        const lastDayPrevMonth = new Date(prevMonthY, prevMonthM + 1, 0);
                        const lastDayPrevStr = lastDayPrevMonth.toISOString().split('T')[0];
                        const lastDayCurrMonth = new Date(year, month + 1, 0);
                        const lastDayCurrStr = lastDayCurrMonth.toISOString().split('T')[0];

                        open = getPrice(lastDayPrevStr);
                        close = getPrice(lastDayCurrStr);
                    }

                    // 3. Current Month Live Override
                    const today = new Date();
                    if (year === today.getFullYear() && month === today.getMonth() && livePrice) {
                        close = livePrice;
                        if (!open) {
                            // If no open found (e.g. current month just started and no data file update yet)
                            const prevM = new Date(year, month, 0).toISOString().split('T')[0];
                            open = getPrice(prevM);
                        }
                    }

                    if (open && close) {
                        returns[year][month] = {
                            percent: ((close - open) / open) * 100,
                            open: open,
                            close: close
                        };
                    }
                }

                if (annualOpen && annualClose) {
                    returns[year]['annual'] = {
                        percent: ((annualClose - annualOpen) / annualOpen) * 100,
                        open: annualOpen,
                        close: annualClose
                    };
                }
            }
            // @ts-ignore
            setMonthlyReturns(returns);
        };

        calculateReturns();
    }, [livePrice]);

    // Sort years descending, excluding years with no return data
    const years = Object.keys(monthlyReturns)
        .map(Number)
        .filter(year => Object.keys(monthlyReturns[year]).length > 0)
        .sort((a, b) => b - a);

    const handleMouseEnter = (e: React.MouseEvent, open: number, close: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setHoverData({
            x: rect.left + rect.width / 2, // Center horizontally relative to cell
            y: rect.top, // Above cell
            open,
            close
        });
    };

    const handleMouseLeave = () => {
        setHoverData(null);
    };

    return (
        <div className="heatmap-container" style={{ width: '100%', overflowX: 'auto', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="section-title" style={{ fontSize: '1.8rem', textAlign: 'left', marginBottom: '0.5rem' }}>{t('heatmap.title')}</h1>
                    <p className="section-desc" style={{ textAlign: 'left', marginBottom: 0 }}>
                        {t('heatmap.subtitle').replace('{{year}}', new Date().getFullYear().toString())}
                    </p>
                </div>
                {lastUpdated && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>{t('heatmap.last_updated')}</strong> {Math.floor((new Date().getTime() - lastUpdated.getTime()) / 3600000) > 0 ?
                            `${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 3600000)} ${t('heatmap.hours_ago')}` :
                            `${Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000)} min ago`
                        }
                    </div>
                )}
            </div>

            <table className="heatmap-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                    <tr>
                        <th style={{
                            padding: '10px',
                            textAlign: 'left',
                            color: 'var(--text-secondary)',
                            position: 'sticky',
                            left: 0,
                            top: 0,
                            zIndex: 30, // Top-left corner on top of everything
                            background: 'var(--dark-bg)',
                            minWidth: '70px',
                            maxWidth: '70px',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            {t('heatmap.year')}
                        </th>
                        <th style={{
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            color: 'var(--text-main)',
                            position: 'sticky',
                            left: '70px',
                            top: 0,
                            zIndex: 30, // Top-left corner on top of everything
                            background: 'var(--dark-bg)',
                            borderRight: '2px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            minWidth: '90px',
                            maxWidth: '90px',
                            boxShadow: '4px 0 8px -4px rgba(0,0,0,0.3)'
                        }}>
                            {t('heatmap.annual')}
                        </th>
                        {[
                            t('heatmap.jan'), t('heatmap.feb'), t('heatmap.mar'), t('heatmap.apr'),
                            t('heatmap.may'), t('heatmap.jun'), t('heatmap.jul'), t('heatmap.aug'),
                            t('heatmap.sep'), t('heatmap.oct'), t('heatmap.nov'), t('heatmap.dec')
                        ].map(m => (
                            <th key={m} style={{
                                padding: '10px',
                                textAlign: 'center',
                                color: 'var(--text-secondary)',
                                minWidth: '70px',
                                position: 'sticky',
                                top: 0,
                                zIndex: 20, // Header row on top of body rows
                                background: 'var(--dark-bg)',
                                borderBottom: '1px solid var(--border-color)'
                            }}>
                                {m}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {years.map(year => (
                        <tr key={year} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{
                                padding: '10px',
                                fontWeight: 'bold',
                                color: 'var(--text-main)',
                                position: 'sticky',
                                left: 0,
                                zIndex: 10,
                                background: 'var(--dark-bg)',
                                minWidth: '70px',
                                maxWidth: '70px'
                            }}>
                                {year}
                            </td>
                            {/* Annual Cell with composite background for opacity + tint */}
                            {(() => {
                                const annualData = monthlyReturns[year].annual;
                                const val = annualData?.percent;
                                return (
                                    <td
                                        onMouseEnter={(e) => annualData && handleMouseEnter(e, annualData.open, annualData.close)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{
                                            padding: '12px 8px',
                                            textAlign: 'center',
                                            backgroundColor: 'var(--dark-bg)', // Opaque base
                                            backgroundImage: `linear-gradient(${getColor(val)}, ${getColor(val)})`, // Tint overlay
                                            color: getTextColor(val),
                                            fontWeight: 'bold',
                                            position: 'sticky',
                                            left: '70px',
                                            zIndex: 10,
                                            borderRight: '2px solid var(--border-color)', // Divider
                                            minWidth: '90px',
                                            maxWidth: '90px',
                                            cursor: 'pointer',
                                            boxShadow: '4px 0 8px -4px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '-'}
                                    </td>
                                );
                            })()}

                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(month => {
                                const data = monthlyReturns[year][month];
                                // Access percent if data exists, otherwise undefined
                                const val = data?.percent;
                                const isCurrentMonth = year === new Date().getFullYear() && month === new Date().getMonth();
                                return (
                                    <td
                                        key={month}
                                        onMouseEnter={(e) => data && handleMouseEnter(e, data.open, data.close)}
                                        onMouseLeave={handleMouseLeave}
                                        style={{
                                            padding: '12px 8px',
                                            textAlign: 'center',
                                            backgroundColor: getColor(val),
                                            color: getTextColor(val),
                                            fontWeight: isCurrentMonth ? 'bold' : 'normal',
                                            border: isCurrentMonth ? '2px solid #fff' : 'none', // Highlight current
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        title={isCurrentMonth ? t('heatmap.current_month') : undefined}
                                    >
                                        {val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '-'}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Tooltip Popup */}
            {hoverData && (
                <div style={{
                    position: 'fixed',
                    top: hoverData.y - 10, // Slightly above
                    left: hoverData.x,
                    transform: 'translate(-50%, -100%)', // Centered and above
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    zIndex: 100,
                    pointerEvents: 'none',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ marginBottom: '2px' }}>Open: <span style={{ fontWeight: 'bold' }}>${hoverData.open.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></div>
                    <div>Close: <span style={{ fontWeight: 'bold' }}>${hoverData.close.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span></div>
                    {/* Small arrow at bottom */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid rgba(0, 0, 0, 0.9)',
                    }}></div>
                </div>
            )}



            {/* Description Text */}
            <div style={{ padding: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6', fontSize: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#22c55e' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_title || heatmapTranslations['pt'].description_title}
                </h2>

                <p style={{ marginBottom: '1rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p1 || heatmapTranslations['pt'].description_p1}
                </p>

                <p style={{ marginBottom: '0.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p2 || heatmapTranslations['pt'].description_p2}
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list1_item1 || heatmapTranslations['pt'].description_list1_item1}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list1_item2 || heatmapTranslations['pt'].description_list1_item2}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list1_item3 || heatmapTranslations['pt'].description_list1_item3}</li>
                </ul>

                <p style={{ marginBottom: '1.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p3 || heatmapTranslations['pt'].description_p3}
                </p>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#f97316' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_subtitle1 || heatmapTranslations['pt'].description_subtitle1}
                </h3>
                <p style={{ marginBottom: '1rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p4 || heatmapTranslations['pt'].description_p4}
                </p>
                <p style={{ marginBottom: '1rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p5 || heatmapTranslations['pt'].description_p5}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p6 || heatmapTranslations['pt'].description_p6}
                </p>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list2_item1 || heatmapTranslations['pt'].description_list2_item1}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list2_item2 || heatmapTranslations['pt'].description_list2_item2}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list2_item3 || heatmapTranslations['pt'].description_list2_item3}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list2_item4 || heatmapTranslations['pt'].description_list2_item4}</li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p7 || heatmapTranslations['pt'].description_p7}
                </p>

                {/* Disclaimer Box */}
                <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderLeft: '4px solid #ef4444',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    marginBottom: '1.5rem'
                }}>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#ef4444', marginTop: 0 }}>
                        {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_subtitle2 || heatmapTranslations['pt'].description_subtitle2}
                    </h3>
                    <p style={{ marginBottom: '1rem' }}>
                        {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p8 || heatmapTranslations['pt'].description_p8}
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list3_item1 || heatmapTranslations['pt'].description_list3_item1}</li>
                        <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list3_item2 || heatmapTranslations['pt'].description_list3_item2}</li>
                        <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list3_item3 || heatmapTranslations['pt'].description_list3_item3}</li>
                    </ul>
                    <p style={{ marginBottom: 0 }}>
                        {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p9 || heatmapTranslations['pt'].description_p9}
                    </p>
                </div>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#f97316' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_subtitle3 || heatmapTranslations['pt'].description_subtitle3}
                </h3>
                <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list4_item1 || heatmapTranslations['pt'].description_list4_item1}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list4_item2 || heatmapTranslations['pt'].description_list4_item2}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list4_item3 || heatmapTranslations['pt'].description_list4_item3}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list4_item4 || heatmapTranslations['pt'].description_list4_item4}</li>
                    <li>{heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_list4_item5 || heatmapTranslations['pt'].description_list4_item5}</li>
                </ul>
                <p style={{ marginBottom: '1.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p10 || heatmapTranslations['pt'].description_p10}
                </p>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#f97316' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_subtitle4 || heatmapTranslations['pt'].description_subtitle4}
                </h3>
                <p style={{ marginBottom: '1.5rem' }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_p11 || heatmapTranslations['pt'].description_p11}
                </p>

                {/* Legal Disclaimer Footer */}
                <p style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2rem',
                    fontStyle: 'italic',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem'
                }}>
                    {heatmapTranslations[language as keyof typeof heatmapTranslations]?.description_footer || heatmapTranslations['pt'].description_footer}
                </p>
            </div>
        </div>
    );
}
