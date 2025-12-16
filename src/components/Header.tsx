'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { getPath, getPageIdFromSlug, PageId } from '@/lib/routes';
import { useSettings, Currency } from '@/contexts/SettingsContext';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { language, currency, setCurrency, t } = useSettings();

    const toggleMenu = () => setIsOpen(!isOpen);

    // Dynamic Navigation Links
    const navLinks = [
        { name: t('nav.aposentadoria_btc'), id: 'home' as PageId },
        { name: t('nav.aposentadoria_sats'), id: 'sats-calculator' as PageId },
        { name: t('nav.modelo_bitcoin24'), id: 'modelo-bitcoin24' as PageId },
        { name: t('nav.bitcoin_dca'), id: 'dca-calculator' as PageId },
        { name: t('nav.bitcoin_roi'), id: 'regret-calculator' as PageId },

        { name: t('nav.conversor_btc'), id: 'btc-converter' as PageId },
        { name: t('nav.conversor_sats'), id: 'sats-converter' as PageId },
        { name: t('nav.renda_fixa_btc'), id: 'fixed-income' as PageId },
        { name: t('nav.heatmap'), id: 'heatmap' as PageId },
        { name: t('nav.minimum_wage'), id: 'minimum-wage' as PageId },
    ];

    const currentPath = (id: PageId) => getPath(language, id);

    const handleLanguageChange = (newLang: string) => {
        // Find current page ID from pathname
        let currentPageId: PageId = 'home';
        let detectedLang = 'pt';

        // Simple detection strategy
        if (pathname.startsWith('/en')) {
            detectedLang = 'en';
        } else if (pathname.startsWith('/es')) {
            detectedLang = 'es';
        } else {
            detectedLang = 'pt';
        }

        // Extract slug
        let slug = '';
        if (detectedLang === 'en') slug = pathname.replace('/en', '').replace(/^\//, '');
        else if (detectedLang === 'es') slug = pathname.replace('/es', '').replace(/^\//, '');
        else slug = pathname.replace(/^\//, '');

        const identifiedId = getPageIdFromSlug(detectedLang, slug);
        if (identifiedId) {
            currentPageId = identifiedId;
        }

        // Determine new path
        const newPath = getPath(newLang, currentPageId);

        // Navigate
        router.push(newPath);
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="mobile-topbar">
                <div className="logo-container-mobile">
                    <Link href={getPath(language, 'home')} className="logo-link">
                        <span className="brand-name-mobile" style={{ color: 'var(--primary-green)' }}>Viverde<span className="highlight">bitcoin</span></span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ViverdeBitcoinfavicon.png" alt="Viver de Bitcoin" style={{ height: '24px', width: 'auto', marginLeft: '8px' }} />
                    </Link>
                </div>
                <button className="hamburger-btn" onClick={toggleMenu} aria-label="Menu">
                    ☰
                </button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)} />

            {/* Sidebar */}
            <aside className={`main-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link href={getPath(language, 'home')} className="logo-link-desktop" onClick={() => setIsOpen(false)}>
                        <div className="brand-name">Viverde<span className="highlight">bitcoin</span></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ViverdeBitcoinfavicon.png" alt="Viver de Bitcoin" style={{ height: '28px', width: 'auto', marginLeft: '10px' }} />
                    </Link>
                    <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                <nav className="sidebar-nav">

                    {navLinks.map((link) => {
                        const href = currentPath(link.id);
                        return (
                            <Link
                                key={link.id}
                                href={href}
                                className={`sidebar-nav-item ${pathname === href ? 'active' : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        );
                    })}

                    <div className="nav-divider" />

                    <Link
                        href={getPath(language, 'about')}
                        className={`sidebar-nav-item ${pathname === getPath(language, 'about') ? 'active' : ''}`}
                        onClick={() => setIsOpen(false)}
                    >
                        {t('nav.sobre')}
                    </Link>
                </nav>

                <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>

                    {/* Language Selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            aria-label="Selecionar idioma"
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={{
                                appearance: 'none',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-main)',
                                padding: '6px 24px 6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                width: 'auto',
                                minWidth: '60px'
                            }}
                        >
                            <option value="pt">PT</option>
                            <option value="en">EN</option>
                            <option value="es">ES</option>
                        </select>
                        <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            ▼
                        </div>
                    </div>

                    {/* Currency Selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            aria-label="Selecionar moeda"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as Currency)}
                            style={{
                                appearance: 'none',
                                background: 'transparent',
                                border: '1px solid var(--border-color)',
                                color: 'var(--bitcoin-orange)',
                                padding: '6px 24px 6px 10px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                width: 'auto',
                                minWidth: '65px'
                            }}
                        >
                            <option value="BRL">BRL (R$)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                        </select>
                        <div style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            ▼
                        </div>
                    </div>

                    {/* Theme Toggle */}
                    <div style={{ marginLeft: 'auto' }}>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
}
