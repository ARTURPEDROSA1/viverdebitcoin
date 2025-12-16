'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function Bitcoin24Model() {
    const { t, isLightMode } = useSettings();

    // Strategy Labels
    const strategies = [
        t('modelo24.bar_normie'),
        t('modelo24.bar_btc10'),
        t('modelo24.bar_btc_maxi'),
        t('modelo24.bar_double_maxi'),
        t('modelo24.bar_triple_maxi')
    ];

    return (
        <section className="calculator-section" id="modelo-bitcoin24">
            <div className="calculator-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        marginBottom: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '15px',
                        color: isLightMode ? '#000' : '#fff'
                    }}>
                        BITCOIN24
                        <span style={{ fontSize: '2.5rem' }}>₿</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: isLightMode ? '#444' : '#ccc' }}>
                        {t('modelo24.header_sub')}
                    </p>
                </div>

                {/* Main Content Area */}
                <div style={{ background: isLightMode ? '#fff' : '#1e1e1e', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>

                    {/* Sub-header */}
                    <div style={{ padding: '15px', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                            {t('modelo24.forecast_title')}
                        </h3>
                    </div>

                    {/* Orange Bar */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        background: '#f7931a',
                        borderTop: '2px solid #ccc',
                        borderBottom: '2px solid #ccc',
                        marginBottom: '20px'
                    }}>
                        {strategies.map((strat, index) => (
                            <div key={index} style={{
                                padding: '10px 5px',
                                textAlign: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                borderRight: index < 4 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {strat}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '20px' }}>

                        {/* Pink Box */}
                        <div style={{
                            background: '#ffe4e1',
                            color: '#000',
                            padding: '20px',
                            border: '1px solid #ffb6c1',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            {t('modelo24.pink_box')}
                        </div>

                        {/* Yellow Box */}
                        <div style={{
                            background: '#fffacd',
                            color: '#000',
                            padding: '20px',
                            border: '1px solid #f0e68c',
                            borderRadius: '4px',
                            marginBottom: '20px',
                            fontSize: '0.95rem',
                            lineHeight: '1.6'
                        }}>
                            {t('modelo24.yellow_box')}
                        </div>

                        {/* Contributors */}
                        <div style={{
                            background: '#ffefd5',
                            color: '#000',
                            padding: '10px',
                            border: '1px solid #ffdab9',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '20px',
                            fontSize: '0.9rem',
                            marginBottom: '30px'
                        }}>
                            <span style={{ textDecoration: 'underline' }}>{t('modelo24.contributors')}:</span>
                            <span style={{ fontStyle: 'italic' }}>Michael J. Saylor</span>
                            <span>|</span>
                            <span style={{ fontStyle: 'italic' }}>Shirish Jajodia</span>
                            <span>|</span>
                            <span style={{ fontStyle: 'italic' }}>Chaitanya Jain (CJ)</span>
                        </div>

                        {/* Quote */}
                        <div style={{
                            textAlign: 'center',
                            fontStyle: 'italic',
                            color: isLightMode ? '#555' : '#aaa',
                            margin: '40px 0',
                            padding: '0 20px',
                            fontSize: '0.95rem'
                        }}>
                            {t('modelo24.quote')}
                        </div>

                        {/* Disclaimer */}
                        <div style={{
                            fontSize: '0.8rem',
                            color: isLightMode ? '#666' : '#888',
                            borderTop: '1px solid rgba(0,0,0,0.1)',
                            paddingTop: '20px',
                            textAlign: 'justify'
                        }}>
                            <strong>{t('modelo24.disclaimer_title')}</strong> {t('modelo24.disclaimer_text')}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
