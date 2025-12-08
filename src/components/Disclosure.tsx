'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function DisclosureComponent() {
    const { t } = useSettings();

    return (
        <div className="about-content">
            <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('aff.title')}</h1>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('aff.subtitle')}</h3>

            <p>{t('aff.text1')}</p>
            <p>{t('aff.text2')}</p>

            <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid var(--primary-green)' }}>
                <p style={{ fontWeight: 'bold' }}>{t('aff.note')}</p>
            </div>
        </div>
    );
}
