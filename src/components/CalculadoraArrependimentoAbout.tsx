'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function CalculadoraArrependimentoAbout() {
    const { t } = useSettings();

    return (
        <section className="about-section">
            <h2 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1.8rem' }}>
                {t('roi.about.title')}
            </h2>

            <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }} dangerouslySetInnerHTML={{ __html: t('roi.about.desc1') }} />

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
                {t('roi.about.desc2')}
            </p>

            <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>
                {t('roi.about.how_title')}
            </h3>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                <li dangerouslySetInnerHTML={{ __html: t('roi.about.how_li1') }} />
                <li dangerouslySetInnerHTML={{ __html: t('roi.about.how_li2') }} />
                <li dangerouslySetInnerHTML={{ __html: t('roi.about.how_li3') }} />
                <li dangerouslySetInnerHTML={{ __html: t('roi.about.how_li4') }} />
            </ul>

            <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('roi.about.result_label')}</p>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                <li>{t('roi.about.result_li1')}</li>
                <li>{t('roi.about.result_li2')}</li>
                <li>{t('roi.about.result_li3')}</li>
            </ul>

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
                {t('roi.about.ideal_desc')}
            </p>

            <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>
                {t('roi.about.why_title')}
            </h3>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                <li>{t('roi.about.why_li1')}</li>
                <li>{t('roi.about.why_li2')}</li>
                <li>{t('roi.about.why_li3')}</li>
                <li>{t('roi.about.why_li4')}</li>
            </ul>

            <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
                {t('roi.about.help_desc')}
            </p>

            <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--text-secondary)' }}>
                <h4 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '0.5rem' }}>{t('roi.about.disclaimer_title')}</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {t('roi.about.disclaimer_text')}
                </p>
            </div>
        </section>
    );
}
