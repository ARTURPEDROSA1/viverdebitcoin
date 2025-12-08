'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const navLinks = [
        { name: 'Aposentadoria BTC', href: '/' },
        { name: 'Aposentadoria Sats', href: '/calculadora-sats' },
        { name: 'Bitcoin DCA', href: '/calculadora-dca' },
        { name: 'Bitcoin ROI', href: '/calculadora-arrependimento' },
        { name: 'Renda Fixa BTC', href: '/renda-fixa-btc' },
        { name: 'Conversor Sats', href: '/conversor-sats' },
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
                        Sobre
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <ThemeToggle />
                </div>
            </aside>
        </>
    );
}
