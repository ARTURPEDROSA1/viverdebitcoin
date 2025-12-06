import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketTicker from '@/components/MarketTicker';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Viver de Bitcoin - Calculadora do Arrependimento',
  description: 'Descubra quanto você teria hoje se tivesse investido antes.',
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
