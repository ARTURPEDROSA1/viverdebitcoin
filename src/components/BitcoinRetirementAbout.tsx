'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function BitcoinRetirementAbout() {
    const { t } = useSettings();

    return (
        <section className="about-section" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <h2 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1.8rem' }}>
                {t('home.info.title')}
            </h2>

            <p style={{ marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.info.desc1')}
            </p>

            <p style={{ marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.info.desc2')}
            </p>

            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                <li>{t('home.info.li1')}</li>
                <li>{t('home.info.li2')}</li>
                <li>{t('home.info.li3')}</li>
                <li>{t('home.info.li4')}</li>
                <li>{t('home.info.li5')}</li>
                <li>{t('home.info.li6')}</li>
            </ul>

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.info.goal')}
            </p>

            <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>
                {t('home.info.expect_title')}
            </h3>

            <p style={{ marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{t('home.info.scenarios_intro')}</p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                <li><strong>{t('home.info.scen_base').split(' – ')[0]}</strong> – {t('home.info.scen_base').split(' – ')[1]}</li>
                <li><strong>{t('home.info.scen_bull').split(' – ')[0]}</strong> – {t('home.info.scen_bull').split(' – ')[1]}</li>
                <li><strong>{t('home.info.scen_bear').split(' – ')[0]}</strong> – {t('home.info.scen_bear').split(' – ')[1]}</li>
            </ul>

            <p style={{ marginBottom: '0.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{t('home.info.report_intro')}</p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                <li>{t('home.info.rep_li1')}</li>
                <li>{t('home.info.rep_li2')}</li>
                <li>{t('home.info.rep_li3')}</li>
                <li>{t('home.info.rep_li4')}</li>
            </ul>

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.info.final_msg')}
            </p>

            {/* Disclaimer Box */}
            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px', borderLeft: '4px solid #e74c3c', marginBottom: '3rem' }}>
                <h4 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{t('home.info.disclaimer_title')}</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {t('home.info.disclaimer_text1')}
                </p>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.6' }}>
                    {t('home.info.disclaimer_text2')}
                </p>
            </div>

            <h3 style={{ color: 'var(--text-main)', marginBottom: '0.8rem', fontSize: '1.4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                {t('home.notes.title')}
            </h3>

            <p style={{ marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.notes.intro')}
            </p>

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                {t('home.notes.intro_bold')}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <h4 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem' }}>{t('home.notes.col1_title')}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                        {t('home.notes.col1_desc1')}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                        {t('home.notes.col1_desc2')}
                    </p>
                    <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        CAGR = (Pt2 / Pt1)^(1/(t2−t1)) − 1<br />
                        Pret = Pt1 · (1 + CAGR)^(ret−t1)
                    </div>
                </div>

                <div>
                    <h4 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem' }}>{t('home.notes.col2_title')}</h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.6' }}>
                        {t('home.notes.col2_desc')}
                    </p>
                    <ul style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginLeft: '15px', listStyleType: 'disc', lineHeight: '1.6' }}>
                        <li>{t('home.notes.col2_li1')}</li>
                        <li>{t('home.notes.col2_li2')}</li>
                        <li>{t('home.notes.col2_li3')}</li>
                        <li>{t('home.notes.col2_li4')}</li>
                        <li>{t('home.notes.col2_li5')}</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem' }}>{t('home.notes.col1_anchors_title')}</h4>
                <div style={{ background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px' }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.8' }}>
                        <li><strong>2028:</strong> Base $225k, Bull $450k, Bear $115k</li>
                        <li><strong>2033:</strong> Base $425k, Bull $1.05M, Bear $185k</li>
                        <li><strong>2040:</strong> Base $800k, Bull $3.25M, Bear $350k</li>
                        <li><strong>2050:</strong> Base $1.9M, Bull $10M, Bear $650k</li>
                        <li><strong>2075:</strong> Base $3M, Bull $30M, Bear $550k</li>
                    </ul>
                </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem' }}>{t('home.notes.col2_math_title')}</h4>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('home.notes.col2_math1')}</p>
                <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>{t('home.notes.col2_math2')}</p>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {t('home.notes.col2_math_note')}
                </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                    {t('home.sources.title')}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', fontSize: '0.9rem' }}>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.emission')}:</strong> Unchained: The 21M supply in code · Bitcoin Magazine: Halving primer.</p>
                        <p><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.swr')}:</strong> Bengen (1994) PDF.</p>
                    </div>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.etfs')}:</strong> SEC Chair statement · CRS explainer.</p>
                        <p><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.s2f')}:</strong> Emerald: dissecting S2F.</p>
                    </div>
                    <div>
                        <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.mining')}:</strong> cPower: miners as flexible load · Duke study summary.</p>
                    </div>
                    <div>
                        <p><strong style={{ color: 'var(--primary-green)' }}>{t('home.sources.flows')}:</strong> BlackRock IBIT facts · CryptoSlate/Bloomberg on 2024 flows.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
