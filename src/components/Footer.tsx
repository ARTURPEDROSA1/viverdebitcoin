'use client';
import { useSettings } from '@/contexts/SettingsContext';
import Link from 'next/link';

export default function Footer() {
    const { t } = useSettings();
    return (
        <footer>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <Link href="/aviso-legal" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.legal_notice')}</Link>
                    <Link href="/termos-de-uso" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.terms')}</Link>
                    <Link href="/politica-de-privacidade" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.privacy')}</Link>
                    <Link href="/politica-de-cookies" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.cookies')}</Link>
                    <Link href="/disclosure-afiliados" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>{t('footer.disclosure')}</Link>
                </div>
            </div>
        </footer>
    );
}
