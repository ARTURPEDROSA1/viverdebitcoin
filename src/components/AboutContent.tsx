'use client';

import React, { useEffect, useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import HalvingCountdown from '@/components/HalvingCountdown';

export default function AboutContent() {
    const { t, currency } = useSettings();
    const [price, setPrice] = useState<number | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                // Fetch price based on selected currency
                let url = '';
                if (currency === 'BRL') url = 'https://economia.awesomeapi.com.br/last/BTC-BRL';
                else if (currency === 'EUR') url = 'https://economia.awesomeapi.com.br/last/BTC-EUR';
                else url = 'https://economia.awesomeapi.com.br/last/BTC-USD'; // Default to USD

                const res = await fetch(url);
                const data = await res.json();

                // key depends on currency, e.g. BTCBRL, BTCUSD, BTCEUR
                const key = `BTC${currency}`;
                if (data[key]) {
                    setPrice(parseFloat(data[key].bid));
                }
            } catch (e) {
                console.error("Error fetching price, using fallback:", e);
                // Fallback values
                if (currency === 'BRL') setPrice(466000);
                else if (currency === 'EUR') setPrice(90000);
                else setPrice(96000); // USD
            }
        };

        fetchPrice();
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, [currency]);

    const formatCurrency = (val: number) => {
        return val.toLocaleString(
            currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US',
            { style: 'currency', currency: currency }
        );
    };

    const formatMillions = (val: number) => {
        const millions = val / 1000000;
        const locale = currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US';
        return `${formatCurrency(val / 1000000).replace(currency, '').trim()} ${t('about.millions')}`;
    };

    const formatBillions = (val: number) => {
        const billions = val / 1000000000;
        const locale = currency === 'BRL' ? 'pt-BR' : currency === 'EUR' ? 'de-DE' : 'en-US';
        return `${formatCurrency(val / 1000000000).replace(currency, '').trim()} ${t('about.billions')}`;
    }

    return (
        <main className="about-section">
            <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>{t('about.hero_title')}</h1>
            <div className="about-content">
                <h2>{t('about.sec1_title')}</h2>
                <p>{t('about.sec1_p1')}</p>
                <p>{t('about.sec1_p2')}</p>
                <div style={{ margin: '1rem 0' }}>
                    <p>{t('about.sec1_p3')}</p>
                    <p>{t('about.sec1_p4')}</p>
                </div>
                <p>{t('about.sec1_p5')}</p>

                <h2>{t('about.sec2_title')}</h2>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec2_p1') }} />
                <p>{t('about.sec2_list_intro')}</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc' }}>
                    <li dangerouslySetInnerHTML={{ __html: t('about.sec2_li1') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('about.sec2_li2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t('about.sec2_li3') }} />
                </ul>
                <p>{t('about.sec2_p2')}</p>

                <h2>{t('about.sec3_title')}</h2>
                <p>{t('about.sec3_p1')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec3_p2') }} />
                <div style={{ background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ color: 'var(--bitcoin-orange)', marginTop: 0 }}>{t('about.sec3_box_title')}</h4>
                    <ul style={{ margin: '0.5rem 0 0 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                        <li dangerouslySetInnerHTML={{ __html: t('about.sec3_li1') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('about.sec3_li2') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('about.sec3_li3') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('about.sec3_li4') }} />
                        <li dangerouslySetInnerHTML={{ __html: t('about.sec3_li5') }} />
                    </ul>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('about.table_sats_title')}</h4>
                <div className="table-responsive">
                    <table className="about-table" style={{ width: '100%', textAlign: 'center' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>{t('about.table_sats_col1')}</th>
                                <th style={{ textAlign: 'center' }}>{t('about.table_sats_col2')}</th>
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

                <h2>{t('about.sec4_title')}</h2>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec4_p1') }} />

                <div className="highlight-box">
                    <p>{t('about.sec4_box_p1').replace('{price}', price ? formatCurrency(price) : '...')}</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        10.000 × {price ? formatCurrency(price) : '...'} = {price ? formatCurrency(price * 10000) : '...'}
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        {t('about.sec4_box_p2_prefix')} <strong>{price ? formatBillions(price * 10000) : '...'}</strong> {t('about.sec4_box_p2_suffix')}
                    </p>
                </div>
                <p>{t('about.sec4_p2')}</p>

                <h2>{t('about.sec5_title')}</h2>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec5_p1') }} />
                <p>{t('about.sec5_p2')}</p>

                <h3>{t('about.sec5_sub1_title')}</h3>
                <p>{t('about.sec5_sub1_p1')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec5_sub1_p2') }} />

                <div className="highlight-box">
                    <p>{t('about.sec5_box_intro')}</p>
                    <p><strong>1 BTC = {price ? formatCurrency(price) : '...'}</strong></p>
                    <p style={{ marginTop: '1rem' }}>{t('about.sec5_box_revenue_label')}</p>
                    <p>3,125 × {price ? formatCurrency(price) : '...'} ≈ <strong>{price ? formatCurrency(price * 3.125) : '...'}</strong> {t('about.sec5_box_per_block')}</p>
                    <p style={{ marginTop: '0.5rem' }}>{t('about.sec5_box_total_intro')} <strong>{price ? formatMillions(price * 3.125) : '...'}</strong> {t('about.sec5_box_total_suffix')}</p>
                </div>

                <HalvingCountdown />

                <h3>{t('about.sec5_sub2_title')}</h3>
                <p>{t('about.sec5_sub2_p1')}</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr>
                                <th>{t('about.table_halving_col1')}</th>
                                <th>{t('about.table_halving_col2')}</th>
                                <th>{t('about.table_halving_col3')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>0</td><td>2009</td><td>50,00</td></tr>
                            <tr><td>1</td><td>2012</td><td>25,00</td></tr>
                            <tr><td>2</td><td>2016</td><td>12,50</td></tr>
                            <tr><td>3</td><td>2020</td><td>6,25</td></tr>
                            <tr><td>4</td><td>2024</td><td>3,125</td></tr>
                            <tr><td>5</td><td>2028</td><td>1,5625</td></tr>
                            <tr><td>6</td><td>2032</td><td>0,78125</td></tr>
                            <tr><td>7</td><td>2036</td><td>0,390625</td></tr>
                            <tr><td>8</td><td>2040</td><td>0,1953125</td></tr>
                            <tr><td>9</td><td>2044</td><td>0,09765625</td></tr>
                            <tr><td>10</td><td>2048</td><td>0,04882812</td></tr>
                            <tr><td>11</td><td>2052</td><td>0,02441406</td></tr>
                            <tr><td>12</td><td>2056</td><td>0,01220703</td></tr>
                            <tr><td>13</td><td>2060</td><td>0,00610352</td></tr>
                            <tr><td>14</td><td>2064</td><td>0,00305176</td></tr>
                            <tr><td>15</td><td>2068</td><td>0,00152588</td></tr>
                            <tr><td>16</td><td>2072</td><td>0,00076294</td></tr>
                            <tr><td>17</td><td>2076</td><td>0,00038147</td></tr>
                            <tr><td>18</td><td>2080</td><td>0,00019073</td></tr>
                            <tr><td>19</td><td>2084</td><td>0,00009537</td></tr>
                            <tr><td>20</td><td>2088</td><td>0,00004768</td></tr>
                            <tr><td>21</td><td>2092</td><td>0,00002384</td></tr>
                            <tr><td>22</td><td>2096</td><td>0,00001192</td></tr>
                            <tr><td>23</td><td>2100</td><td>0,00000596</td></tr>
                            <tr><td>24</td><td>2104</td><td>0,00000298</td></tr>
                            <tr><td>25</td><td>2108</td><td>0,00000149</td></tr>
                            <tr><td>26</td><td>2112</td><td>0,00000075</td></tr>
                            <tr><td>27</td><td>2116</td><td>0,00000037</td></tr>
                            <tr><td>28</td><td>2120</td><td>0,00000019</td></tr>
                            <tr><td>29</td><td>2124</td><td>0,00000009</td></tr>
                            <tr><td>30</td><td>2128</td><td>0,00000005</td></tr>
                            <tr><td>31</td><td>2132</td><td>0,00000002</td></tr>
                            <tr><td>32</td><td>2136</td><td>0,00000001</td></tr>
                            <tr><td>33 (final)</td><td>2140</td><td>~0,00000001</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>{t('about.sec5_p3')}</p>

                <h2>{t('about.sec6_title')}</h2>
                <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                    {[
                        { year: '2008', desc: t('about.timeline_2008') },
                        { year: '2009', desc: t('about.timeline_2009') },
                        { year: '2010', desc: t('about.timeline_2010') },
                        { year: '2012', desc: t('about.timeline_2012') },
                        { year: '2016', desc: t('about.timeline_2016') },
                        { year: '2017', desc: t('about.timeline_2017') },
                        { year: '2020', desc: t('about.timeline_2020') },
                        { year: '2021', desc: t('about.timeline_2021') },
                        { year: '2024', desc: t('about.timeline_2024') },
                        { year: '2025+', desc: t('about.timeline_2025') },
                        { year: '~2140', desc: t('about.timeline_2140') },
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: 'var(--bitcoin-orange)' }}>{item.year}:</strong> {item.desc}
                        </div>
                    ))}
                </div>

                <h2>{t('about.sec7_title')}</h2>
                <p>{t('about.sec7_p1')}</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr><th>{t('about.table_countries_col1')}</th><th>{t('about.table_countries_col2')}</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>{t('countries.usa')}</td><td>326.588 BTC</td></tr>
                            <tr><td>{t('countries.china')}</td><td>190.000 BTC</td></tr>
                            <tr><td>{t('countries.uk')}</td><td>61.243 BTC</td></tr>
                            <tr><td>{t('countries.ukraine')}</td><td>46.351 BTC</td></tr>
                            <tr><td>{t('countries.elsalvador')}</td><td>7.485 BTC</td></tr>
                            <tr><td>{t('countries.uae')}</td><td>6.420 BTC</td></tr>
                            <tr><td>{t('countries.bhutan')}</td><td>6.227 BTC</td></tr>
                            <tr><td>{t('countries.northkorea')}</td><td>803 BTC</td></tr>
                            <tr><td>{t('countries.venezuela')}</td><td>240 BTC</td></tr>
                            <tr><td>{t('countries.finland')}</td><td>90 BTC</td></tr>
                            <tr><td>{t('countries.germany')}</td><td>0,007 BTC</td></tr>
                        </tbody>
                    </table>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('about.sec7_note')}</p>

                <h2>{t('about.sec8_title')}</h2>
                <p>{t('about.sec8_p1')}</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr><th>#</th><th>{t('about.table_companies_col2')}</th><th>{t('about.table_companies_col3')}</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { name: <a href="https://www.strategy.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Strategy, Inc. (MicroStrategy)</a>, val: '650.000 BTC' },
                                { name: 'Marathon Digital', val: '53.250 BTC' },
                                { name: 'Twenty One (XXI)', val: '43.514 BTC' },
                                { name: 'Metaplanet, Inc.', val: '30.823 BTC' },
                                { name: 'Bitcoin Standard', val: '30.021 BTC' },
                                { name: 'Bullish', val: '24.300 BTC' },
                                { name: 'Riot Platforms, Inc.', val: '19.287 BTC' },
                                { name: 'Trump Media & Technology', val: '15.000 BTC' },
                                { name: 'Coinbase Global', val: '14.548 BTC' },
                                { name: 'CleanSpark Inc', val: '13.011 BTC' },
                            ].map((row, i) => (
                                <tr key={i}><td>{i + 1}</td><td>{row.name}</td><td>{row.val}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2>{t('about.sec9_title')}</h2>
                <p>{t('about.sec9_p1')}</p>

                <h3>{t('about.sec9_sub1_title')} – <a href="https://www.oranjebtc.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>OranjeBTC</a></h3>
                <p>{t('about.sec9_sub1_p1')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec9_sub1_p2') }} />

                <h3>{t('about.sec9_sub2_title')} – <a href="https://ri.meliuz.com.br/default.aspx?linguagem=pt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Méliuz</a></h3>
                <p>{t('about.sec9_sub2_p1')}</p>
                <p>{t('about.sec9_sub2_p2')}</p>
                <p dangerouslySetInnerHTML={{ __html: t('about.sec9_sub2_p3') }} />

                <div className="table-responsive">
                    <table className="about-table">
                        <thead><tr><th>Ticker</th><th>{t('about.table_companies_col2')}</th><th>{t('about.table_companies_col3')}</th></tr></thead>
                        <tbody>
                            <tr><td>OBTC3</td><td><a href="https://www.oranjebtc.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>OranjeBTC</a></td><td>~3.720 BTC</td></tr>
                            <tr><td>CASH3</td><td><a href="https://ri.meliuz.com.br/default.aspx?linguagem=pt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Méliuz</a></td><td>~595,67 BTC</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>{t('about.sec10_title')}</h2>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>{t('about.sec10_li1')}</li>
                    <li>{t('about.sec10_li2')}</li>
                    <li>{t('about.sec10_li3')}</li>
                    <li>{t('about.sec10_li4')}</li>
                </ul>
                <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem', borderLeft: '4px solid var(--primary-green)' }}>
                    <p style={{ fontWeight: 'bold' }}>{t('about.sec10_box_p1')}</p>
                    <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{t('about.sec10_box_p2')}"</p>
                </div>
            </div>
        </main>
    );
}
