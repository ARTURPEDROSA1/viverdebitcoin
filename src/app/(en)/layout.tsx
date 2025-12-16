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
        default: 'Bitcoin Retirement Calculator | Simulate your Future (FIRE)',
        template: '%s | Viver de Bitcoin',
    },
    description: 'Plan your financial independence with Bitcoin. Simulate Base, Bull, and Bear scenarios, adjust inflation and withdrawal strategies to live off income.',
    keywords: ['bitcoin', 'retirement', 'fire', 'calculator', 'btc', 'investment', 'long term', 'hold', 'custody', 'live off bitcoin'],
    openGraph: {
        title: 'Bitcoin Retirement Calculator | Viver de Bitcoin',
        description: 'How much BTC do you need to retire? Run detailed simulations with our macro scenario calculator.',
        url: 'https://viverdebitcoin.com/en',
        siteName: 'Viver de Bitcoin',
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Bitcoin Retirement Calculator (FIRE)',
        description: 'Simulate your future with Bitcoin. Price trajectories, inflation, and withdrawal strategies.',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com/en',
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
            <head>
                <link rel="preconnect" href="https://api.coindesk.com" />
                <link rel="preconnect" href="https://api.coingecko.com" />
                <link rel="preconnect" href="https://economia.awesomeapi.com.br" />
            </head>
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
