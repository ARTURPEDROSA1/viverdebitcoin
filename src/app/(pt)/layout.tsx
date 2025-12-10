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
        default: 'Calculadora de Aposentadoria Bitcoin | Simule seu Futuro (FIRE)',
        template: '%s | Viver de Bitcoin',
    },
    description: 'Planeje sua independência financeira com Bitcoin. Simule cenários Base, Bull e Bear, ajuste inflação e estratégias de saque para viver de renda.',
    keywords: ['bitcoin', 'aposentadoria', 'fire', 'calculadora', 'btc', 'investimento', 'longo prazo', 'hold', 'custódia', 'viver de bitcoin'],
    openGraph: {
        title: 'Calculadora de Aposentadoria Bitcoin | Viver de Bitcoin',
        description: 'Quantos BTC você precisa para se aposentar? Faça simulações detalhadas com nossa calculadora de cenários macro.',
        url: 'https://viverdebitcoin.com',
        siteName: 'Viver de Bitcoin',
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Calculadora de Aposentadoria Bitcoin (FIRE)',
        description: 'Simule seu futuro com Bitcoin. Trajetórias de preço, inflação e estratégias de saque.',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com',
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
    icons: {
        icon: '/ViverdeBitcoinfavicon.png',
        shortcut: '/ViverdeBitcoinfavicon.png',
        apple: '/ViverdeBitcoinfavicon.png',
    },
};

export default function PtLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Viver de Bitcoin",
        "url": "https://viverdebitcoin.com",
        "logo": "https://viverdebitcoin.com/ViverdeBitcoinLogo.png",
        "description": "Ferramentas e calculadoras para investidores de Bitcoin."
    };

    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <SettingsProvider initialLanguage="pt">
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
