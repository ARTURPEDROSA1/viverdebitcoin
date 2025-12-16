import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';
import JsonLd from '@/components/JsonLd';
import { SettingsProvider } from '@/contexts/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://viverdebitcoin.com'),
    title: {
        default: 'Calculadora de Jubilación Bitcoin | Simula tu Futuro (FIRE)',
        template: '%s | Viver de Bitcoin',
    },
    description: 'Planifica tu independencia financiera con Bitcoin. Simula escenarios Base, Bull y Bear, ajusta inflación y estrategias de retiro para vivir de rentas.',
    keywords: ['bitcoin', 'jubilación', 'fire', 'calculadora', 'btc', 'inversión', 'largo plazo', 'hold', 'custodia', 'vivir de bitcoin'],
    openGraph: {
        title: 'Calculadora de Jubilación Bitcoin | Viver de Bitcoin',
        description: '¿Cuánto BTC necesitas para retirarte? Haz simulaciones detalladas con nuestra calculadora de escenarios macro.',
        url: 'https://viverdebitcoin.com/es',
        siteName: 'Viver de Bitcoin',
        locale: 'es_ES',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Calculadora de Jubilación Bitcoin (FIRE)',
        description: 'Simula tu futuro con Bitcoin. Trayectorias de precio, inflación y estrategias de retiro.',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com/es',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function EsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Viver de Bitcoin",
        "url": "https://viverdebitcoin.com/es",
        "logo": "https://viverdebitcoin.com/ViverdeBitcoinLogo.png",
        "description": "Herramientas y calculadoras para inversores de Bitcoin."
    };

    return (
        <html lang="es">
            <body className={inter.className}>
                <SettingsProvider initialLanguage="es">
                    <JsonLd data={jsonLdData} />
                    <Header />
                    <div className="main-content-wrapper">
                        <MarketTicker />
                        {children}
                        <Footer />
                    </div>
                </SettingsProvider>
            </body>
        </html>
    );
}
