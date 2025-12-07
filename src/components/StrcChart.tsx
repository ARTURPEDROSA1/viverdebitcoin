'use client';

import React, { useEffect, useRef, memo, useState } from 'react';

function StrcChart() {
    const container = useRef<HTMLDivElement>(null);
    const [chartType, setChartType] = useState<'area' | 'candlesticks'>('area');

    useEffect(() => {
        if (!container.current) return;

        // Reset container to ensure clean mount
        container.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';

        const script = document.createElement('script');
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "symbols": [
                [
                    "Strategy Inc",
                    "NASDAQ:STRC|1D"
                ]
            ],
            "chartOnly": false,
            "width": "100%",
            "height": "400",
            "locale": "br",
            "colorTheme": "dark",
            "autosize": true,
            "showVolume": false,
            "showMA": false,
            "hideDateRanges": false,
            "hideMarketStatus": false,
            "hideSymbolLogo": false,
            "scalePosition": "right",
            "scaleMode": "Normal",
            "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
            "fontSize": "10",
            "noTimeScale": false,
            "valuesTracking": "1",
            "changeMode": "price-and-percent",
            "chartType": chartType,
            "maLineColor": "#2962FF",
            "maLineWidth": 1,
            "maLength": 9,
            "backgroundColor": "rgba(0, 0, 0, 0)",
            "lineWidth": 2,
            "lineType": 0,
            "dateRanges": [
                "1d|1",
                "1m|30",
                "3m|60",
                "12m|1D",
                "60m|1W",
                "all|1M"
            ],
            "upColor": "#22ab94",
            "downColor": "#f7525f",
            "borderUpColor": "#22ab94",
            "borderDownColor": "#f7525f",
            "wickUpColor": "#22ab94",
            "wickDownColor": "#f7525f"
        });

        container.current.appendChild(script);
    }, [chartType]);

    return (
        <div style={{ maxWidth: '800px', marginInline: 'auto', marginTop: '2rem' }}>
            {/* Style Controls */}
            <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '10px',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={() => setChartType('area')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        background: chartType === 'area' ? 'var(--bitcoin-orange)' : 'rgba(255,255,255,0.05)',
                        color: chartType === 'area' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    Linha
                </button>
                <button
                    onClick={() => setChartType('candlesticks')}
                    style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        background: chartType === 'candlesticks' ? 'var(--bitcoin-orange)' : 'rgba(255,255,255,0.05)',
                        color: chartType === 'candlesticks' ? 'white' : 'var(--text-secondary)',
                        border: 'none',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    Candles
                </button>
            </div>

            <div
                className="tradingview-widget-container"
                ref={container}
                style={{
                    background: 'var(--card-bg, #1a1a1a)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color, #333)'
                }}
            >
                <div className="tradingview-widget-container__widget"></div>
            </div>
        </div>
    );
}

export default memo(StrcChart);
