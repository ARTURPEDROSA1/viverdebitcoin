'use client';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';
import { getPath } from '@/lib/routes';

export default function Footer() {
    const { t, language } = useSettings();

    return (
        <footer>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href={getPath(language, 'disclaimer')} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.legal_notice')}</Link>
                    <Link href={getPath(language, 'terms')} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.terms')}</Link>
                    <Link href={getPath(language, 'privacy')} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.privacy')}</Link>
                    <Link href={getPath(language, 'cookies')} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.cookies')}</Link>
                    <Link href={getPath(language, 'affiliate')} style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.disclosure')}</Link>
                </div>
            </div>
        </footer>
    );
}
