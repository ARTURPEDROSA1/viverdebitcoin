'use client';
import { useSettings } from '@/contexts/SettingsContext';

export default function DcaAbout() {
    const { t } = useSettings();
    return (
        <section className="about-section">
            <h2 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1.8rem' }}>
                {t('dca.about.title')}
            </h2>
            <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
                <strong>{t('dca.about.what_is_bold')}</strong>
                {t('dca.about.what_is_text')}
            </p>
            <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
                {t('dca.about.goal')}
            </p>
            <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>
                {t('dca.about.why_title')}
            </h3>
            <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                <li><strong>{t('dca.about.why_stress_bold')}</strong> {t('dca.about.why_stress')}</li>
                <li><strong>{t('dca.about.why_discipline_bold')}</strong> {t('dca.about.why_discipline')}</li>
                <li><strong>{t('dca.about.why_risk_bold')}</strong> {t('dca.about.why_risk')}</li>
                <li><strong>{t('dca.about.why_long_term_bold')}</strong> {t('dca.about.why_long_term')}</li>
            </ul>
        </section>
    );
}
