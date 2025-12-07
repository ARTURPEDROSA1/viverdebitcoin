import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    return (
        <header className="main-header">
            <div className="logo-container">
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/ViverdeBitcoinLogo.png" alt="Viver de Bitcoin" className="brand-logo" />
                    <div className="brand-name">Viver de <span className="highlight">Bitcoin</span></div>
                </Link>
            </div>
            <nav className="main-nav" style={{ marginLeft: '3rem' }}>
                <div className="dropdown">
                    <span className="nav-item" style={{ cursor: 'pointer' }}>Calculadoras ▾</span>
                    <div className="dropdown-content">
                        <Link href="/calculadora-arrependimento" className="nav-item">Bitcoin (ROI)</Link>
                        <Link href="/calculadora-sats" className="nav-item">Aposentadoria Sats</Link>
                        <Link href="/" className="nav-item">Planejador Macro</Link>
                    </div>
                </div>
                <Link href="/sobre" className="nav-item">Sobre</Link>
            </nav>
            <ThemeToggle />
        </header>
    );
}
