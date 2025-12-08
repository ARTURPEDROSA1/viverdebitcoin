'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function PoliticaCookies() {
    const { t } = useSettings();

    return (
        <div className="about-content">
            <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('cookies.title')}</h1>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('cookies.subtitle')}</h3>

            <p>{t('cookies.intro')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('cookies.li1')}</li>
                <li>{t('cookies.li2')}</li>
                <li>{t('cookies.li3')}</li>
            </ul>

            <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid var(--primary-green)' }}>
                <p>{t('cookies.note')}</p>
            </div>
        </div>
    );
}
