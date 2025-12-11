'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function RendaFixaAbout() {
    const { t } = useSettings();

    return (
        <div className="about-content" style={{ maxWidth: '800px', marginInline: 'auto', fontSize: '0.9rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', marginTop: '3rem', border: '1px solid var(--border-color)' }}>
            <p style={{ marginBottom: '2rem', color: 'var(--text-main)', lineHeight: 1.6, fontSize: '1rem' }} dangerouslySetInnerHTML={{ __html: t('rf.about.intro') }} />

            <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                {t('rf.about.title')}
            </h2>

            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: t('rf.about.desc1') }} />
            <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t('rf.about.desc2')}
            </p>

            <h2 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                {t('rf.about.adv_title')}
            </h2>

            <div style={{ marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {t('rf.about.adv1_title')}
                    </h4>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li>{t('rf.about.adv1_li1')}</li>
                        <li>{t('rf.about.adv1_li2')}</li>
                        <li>{t('rf.about.adv1_li3')}</li>
                    </ul>
                    <p style={{ marginTop: '0.5rem', color: '#27ae60', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        "{t('rf.about.adv1_quote')}"
                    </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {t('rf.about.adv2_title')}
                    </h4>
                    <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: t('rf.about.adv2_sub') }} />
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li>{t('rf.about.adv2_li1')}</li>
                        <li>{t('rf.about.adv2_li2')}</li>
                        <li>{t('rf.about.adv2_li3')}</li>
                    </ul>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {t('rf.about.adv3_title')}
                    </h4>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li>{t('rf.about.adv3_li1')}</li>
                        <li>{t('rf.about.adv3_li2')}</li>
                        <li>{t('rf.about.adv3_li3')}</li>
                    </ul>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                        {t('rf.about.adv4_title')}
                    </h4>
                    <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        <li>{t('rf.about.adv4_li1')}</li>
                        <li>{t('rf.about.adv4_li2')}</li>
                        <li>{t('rf.about.adv4_li3')}</li>
                    </ul>
                </div>
            </div>

            <div style={{ padding: '1.5rem', background: 'rgba(39, 174, 96, 0.1)', borderLeft: '4px solid #27ae60', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <h4 style={{ color: '#27ae60', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    {t('rf.about.cta_title')}
                </h4>
                <p style={{ marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t('rf.about.cta_text')}
                </p>
            </div>

            {/* Disclaimer Box */}
            <div style={{ padding: '1.5rem', background: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c', borderRadius: '8px' }}>
                <h4 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>{t('rf.about.disclaimer_title')}</h4>
                <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t('rf.about.disclaimer_text1')}
                </p>
                <p style={{ marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {t('rf.about.disclaimer_text2')}
                </p>
            </div>
        </div>
    );
}
