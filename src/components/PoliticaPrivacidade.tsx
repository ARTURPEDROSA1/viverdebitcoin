'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function PoliticaPrivacidade() {
    const { t } = useSettings();

    return (
        <div className="about-content">
            <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>{t('privacy.title')}</h1>

            <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{t('privacy.subtitle')}</h3>

            <p>{t('privacy.intro')}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('privacy.sec1.title')}</h4>
            <p>{t('privacy.sec1.text')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('privacy.sec1.li1')}</li>
                <li>{t('privacy.sec1.li2')}</li>
                <li>{t('privacy.sec1.li3')}</li>
            </ul>
            <p>{t('privacy.sec1.note')}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('privacy.sec2.title')}</h4>
            <p>{t('privacy.sec2.text')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('privacy.sec2.li1')}</li>
                <li>{t('privacy.sec2.li2')}</li>
                <li>{t('privacy.sec2.li3')}</li>
            </ul>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('privacy.sec3.title')}</h4>
            <p>{t('privacy.sec3.text')}</p>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('privacy.sec4.title')}</h4>
            <p>{t('privacy.sec4.text')}</p>
            <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                <li>{t('privacy.sec4.li1')}</li>
                <li>{t('privacy.sec4.li2')}</li>
                <li>{t('privacy.sec4.li3')}</li>
                <li>{t('privacy.sec4.li4')}</li>
            </ul>
            <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid var(--primary-green)' }}>
                <p>{t('privacy.sec4.email')} <a href="mailto:contato@viverdebitcoin.com" style={{ color: 'var(--bitcoin-orange)' }}>contato@viverdebitcoin.com</a></p>
            </div>

            <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>{t('privacy.sec5.title')}</h4>
            <p>{t('privacy.sec5.text')}</p>

        </div>
    );
}
