'use client';

import { useState, useEffect } from 'react';

export default function SatsConverter() {
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
            }
        }

        // BRL from AwesomeAPI (Independent)
        try {
            const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
            const dataBRL = await resBRL.json();
            setLivePriceBRL(parseFloat(dataBRL.BTCBRL.bid));
        } catch (e) {
            console.error("Error fetching BRL:", e);
        }
        setLoadingPrice(false);
    };

    useEffect(() => {
        fetchPrices();
        // Update every 30s
        const interval = setInterval(fetchPrices, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        calculate();
    }, [amount, currency, livePriceUSD, livePriceBRL, livePriceEUR]);

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
        setSats(Math.floor(satoshis).toLocaleString('pt-BR'));
    };

    return (
        <div className="calculator-container">
            <h2 className="section-title">Conversor Sats</h2>
            <p className="section-desc">Converta valor Fiat para Satoshis instantaneamente</p>

            <div className="calculator-card">
                <div className="input-group">
                    <label htmlFor="fiat-amount">Valor em {currency}</label>
                    <div className="amount-wrapper">
                        <input
                            type="number"
                            id="fiat-amount"
                            placeholder="Ex: 50"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
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
                        Você receberia aproximadamente
                    </div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--bitcoin-orange)', lineHeight: 1 }}>
                        {sats} <span style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>Sats</span>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {loadingPrice ? (
                            <span>Atualizando cotação...</span>
                        ) : (
                            <>
                                <span>
                                    Cotação: {currency} {
                                        currency === 'BRL' && livePriceBRL ? livePriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) :
                                            currency === 'EUR' && livePriceEUR ? livePriceEUR.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) :
                                                livePriceUSD ? livePriceUSD.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '...'
                                    }
                                </span>
                                <button
                                    onClick={fetchPrices}
                                    className="refresh-btn"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: 0 }}
                                    title="Atualizar Cotação"
                                    aria-label="Atualizar Cotação"
                                >
                                    🔄
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Share Buttons */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '10px', width: '100%' }}>
                    <a href={`https://twitter.com/intent/tweet?text=Converta%20Fiat%20para%20Sats%20agora!&url=https://viverdebitcoin.com/conversor-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        𝕏
                    </a>
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        IG
                    </a>
                    <a href={`https://wa.me/?text=Converta%20Fiat%20para%20Sats%20agora!%20https://viverdebitcoin.com/conversor-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        WhatsApp
                    </a>
                </div>
            </div>

            <h4 style={{ marginTop: '3rem', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>Sats por Bitcoin</h4>
            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Entenda a relação entre Satoshis e Bitcoin. 1 Bitcoin = 100 milhões de Sats.
            </p>
            <div className="table-responsive" style={{ maxWidth: '600px', margin: '0 auto', overflowX: 'hidden' }}>
                <table className="about-table" style={{ width: '100%', textAlign: 'center', minWidth: 'auto' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'center' }}>Sats</th>
                            <th style={{ textAlign: 'center' }}>Bitcoin</th>
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
