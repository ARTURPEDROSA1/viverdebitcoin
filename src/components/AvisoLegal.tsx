'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function AvisoLegal() {
    const { t } = useSettings();

    return (
        <div className="about-content">
            <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('legal.title')}</h1>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('legal.subtitle')}</h3>

            <p>{t('legal.text1')}</p>

            <p>{t('legal.text2')}</p>

            <p>{t('legal.text3')}</p>

            <p>{t('legal.text4')}</p>

            <div style={{ background: 'rgba(231, 76, 60, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid #e74c3c' }}>
                <p style={{ fontWeight: 'bold' }}>{t('legal.warning')}</p>
            </div>
        </div>
    );
}
