import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Viver de Bitcoin - Ferramentas e Calculadoras',
    template: '%s | Viver de Bitcoin',
  },
  description: 'Aprenda sobre Bitcoin, use nossas calculadoras de investimento e aposentadoria (Sats), e entenda o mercado de criptomoedas.',
  metadataBase: new URL('https://viverdebitcoin.com'),
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Header />
        <MarketTicker />
        {children}
        <Footer />
      </body>
    </html>
  );
}
