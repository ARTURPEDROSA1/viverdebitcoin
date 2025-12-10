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
    // We can let page metadata override this
    title: 'Calculadora de Jubilación Bitcoin',
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
