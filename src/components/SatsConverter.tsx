'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function SatsConverter() {
    const { t, language } = useSettings();
    const [amount, setAmount] = useState<string>('1');
    const [currency, setCurrency] = useState('BRL');
    const [sats, setSats] = useState<string>('0');
    const [livePriceUSD, setLivePriceUSD] = useState<number | null>(null);
    const [livePriceBRL, setLivePriceBRL] = useState<number | null>(null);
    const [livePriceEUR, setLivePriceEUR] = useState<number | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);

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
                // Hard fallback
                setLivePriceUSD(96000);
                setLivePriceEUR(90000);
            }
        }

        // BRL from AwesomeAPI (Independent)
        try {
            const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
            const dataBRL = await resBRL.json();
            setLivePriceBRL(parseFloat(dataBRL.BTCBRL.bid));
        } catch (e) {
            console.error("Error fetching BRL:", e);
            setLivePriceBRL(466000);
        }
        setLoadingPrice(false);
    };

    useEffect(() => {
        fetchPrices();
        // Update every 30s
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    const calculate = () => {
        if (!amount) {
            setSats('0');
            return;
        }

        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) return;

        let price = livePriceUSD;
        if (currency === 'BRL' && livePriceBRL) price = livePriceBRL;
        else if (currency === 'EUR' && livePriceEUR) price = livePriceEUR;
        else if (currency !== 'USD' && livePriceUSD) {
            // Fallback
            price = livePriceUSD;
        }

        if (!price) return;

        const btcAmount = val / price;
        const satoshis = btcAmount * 100000000;

        // Format
        setSats(Math.floor(satoshis).toLocaleString(language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-ES' : 'en-US'));
    };

    useEffect(() => {
        calculate();
    }, [amount, currency, livePriceUSD, livePriceBRL, livePriceEUR]);

    return (
        <div className="calculator-container">
            <h1 className="section-title">{t('converter.title')}</h1>
            <p className="section-desc">{t('converter.subtitle')}</p>

            <div className="calculator-card">
                <div className="input-group">
                    <label htmlFor="fiat-amount">{t('converter.label')} {currency}</label>
                    <div className="amount-wrapper">
                        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                            <span style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)', zIndex: 1, pointerEvents: 'none' }}>
                                {currency === 'BRL' ? 'R$' : currency === 'USD' ? '$' : '€'}
                            </span>
                            <input
                                type="number"
                                id="fiat-amount"
                                placeholder="Ex: 50"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ paddingLeft: '40px', width: '100%' }}
                            />
                        </div>
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

                <div className="result-card fade-in" style={{ marginTop: '2rem', textAlign: 'center', background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
                    <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {t('converter.result_prefix')}
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)', lineHeight: 1 }}>
                        <span style={{ marginRight: '0.5rem' }}>⚡</span>{sats} <span style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{t('converter.table_col_sats')}</span>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loadingPrice ? (
                            <span>{t('common.updating')}</span>
                        ) : (
                            <>
                                <span>
                                    {t('converter.rate_label')} {currency} {
                                        currency === 'BRL' && livePriceBRL ? livePriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) :
                                            currency === 'EUR' && livePriceEUR ? livePriceEUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) :
                                                livePriceUSD ? livePriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'
                                    }
                                </span>
                                <button
                                    onClick={fetchPrices}
                                    className="refresh-btn"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                                    title={t('common.refresh')}
                                    aria-label={t('common.refresh')}
                                >
                                    🔄
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Share Buttons */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', width: '100%' }}>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('converter.share_text'))}&url=https://viverdebitcoin.com/conversor-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        𝕏
                    </a>
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IG
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(t('converter.share_text'))}%20https://viverdebitcoin.com/conversor-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        WhatsApp
                    </a>
                </div>
            </div>

            <h4 style={{ marginTop: '3rem', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>{t('converter.table_title')}</h4>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                {t('converter.table_subtitle')}
            </p>
            <div className="table-responsive" style={{ maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
                <table className="about-table" style={{ width: '100%', textAlign: 'center', minWidth: 'auto' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>{t('converter.table_col_sats')}</th>
                            <th style={{ textAlign: 'center' }}>{t('converter.table_col_btc')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td>1 Satoshi</td><td>0.00000001 BTC</td></tr>
                        <tr><td>10 Satoshi</td><td>0.00000010 BTC</td></tr>
                        <tr><td>100 Satoshi</td><td>0.00000100 BTC</td></tr>
                        <tr><td>1.000 Satoshi</td><td>0.00001000 BTC</td></tr>
                        <tr><td>10.000 Satoshi</td><td>0.00010000 BTC</td></tr>
                        <tr><td>100.000 Satoshi</td><td>0.00100000 BTC</td></tr>
                        <tr><td>1.000.000 Satoshi</td><td>0.01000000 BTC</td></tr>
                        <tr><td>10.000.000 Satoshi</td><td>0.10000000 BTC</td></tr>
                        <tr><td>100.000.000 Satoshi</td><td>1.00000000 BTC</td></tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
}
