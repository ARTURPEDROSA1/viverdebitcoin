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
    title: 'Bitcoin Retirement Calculator',
};

export default function EnLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Viver de Bitcoin",
        "url": "https://viverdebitcoin.com/en",
        "logo": "https://viverdebitcoin.com/ViverdeBitcoinLogo.png",
        "description": "Tools and calculators for Bitcoin investors."
    };

    return (
        <html lang="en">
            <body className={inter.className}>
                <SettingsProvider initialLanguage="en">
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
