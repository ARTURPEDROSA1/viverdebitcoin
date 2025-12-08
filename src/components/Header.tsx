'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { useSettings } from '@/contexts/SettingsContext';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { language, setLanguage, currency, setCurrency, t } = useSettings();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: t('nav.aposentadoria_btc'), href: '/' },
        { name: t('nav.aposentadoria_sats'), href: '/calculadora-sats' },
        { name: t('nav.bitcoin_dca'), href: '/calculadora-dca' },
        { name: t('nav.bitcoin_roi'), href: '/calculadora-arrependimento' },
        { name: t('nav.renda_fixa_btc'), href: '/renda-fixa-btc' },
        { name: t('nav.conversor_sats'), href: '/conversor-sats' },
    ];

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="mobile-topbar">
                <div className="logo-container-mobile">
                    <Link href="/" className="logo-link">
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
                    <Link href="/" className="logo-link-desktop">
                        <div className="brand-name">Viverde<span className="highlight">bitcoin</span></div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/ViverdeBitcoinfavicon.png" alt="Viver de Bitcoin" style={{ height: '28px', width: 'auto', marginLeft: '10px' }} />
                    </Link>
                    <button className="close-sidebar-btn" onClick={() => setIsOpen(false)}>✕</button>
                </div>

                <nav className="sidebar-nav">

                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`sidebar-nav-item ${pathname === link.href ? 'active' : ''}`}
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="nav-divider" />

                    <Link href="/sobre" className={`sidebar-nav-item ${pathname === '/sobre' ? 'active' : ''}`}>
                        {t('nav.sobre')}
                    </Link>
                </nav>

                <div className="sidebar-footer" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>

                    {/* Language Selector */}
                    <div style={{ position: 'relative' }}>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as any)}
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
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value as any)}
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

                    {/* Theme Toggle - Auto margin left to push it to the right slightly if needed, or just part of the flow */}
                    <div style={{ marginLeft: 'auto' }}>
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
}
