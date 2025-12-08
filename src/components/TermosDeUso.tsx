'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function TermosDeUso() {
    const { t } = useSettings();

    return (
        <div className="about-content">
            <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('terms.title')}</h1>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('terms.subtitle')}</h3>

            <p>{t('terms.intro')}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('terms.sec1.title')}</h4>
            <p>{t('terms.sec1.text')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('terms.sec1.li1')}</li>
                <li>{t('terms.sec1.li2')}</li>
                <li>{t('terms.sec1.li3')}</li>
                <li>{t('terms.sec1.li4')}</li>
            </ul>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('terms.sec2.title')}</h4>
            <p>{t('terms.sec2.text')}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('terms.sec3.title')}</h4>
            <p>{t('terms.sec3.text')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('terms.sec3.li1')}</li>
                <li>{t('terms.sec3.li2')}</li>
                <li>{t('terms.sec3.li3')}</li>
            </ul>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('terms.sec4.title')}</h4>
            <p>{t('terms.sec4.text')}</p>

        </div>
    );
}
