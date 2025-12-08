import type { Metadata } from 'next';
import RendaFixaCalculator from '@/components/RendaFixaCalculator';
import StrcChart from '@/components/StrcChart';
import RendaFixaAbout from '@/components/RendaFixaAbout';

export const metadata: Metadata = {
    title: 'Calculadora Renda Fixa BTC (STRC) | Viver de Bitcoin',
    description: 'Simulador de Renda Fixa Bitcoin baseado na estratégia STRC. Calcule dividendos, reinvestimentos e patrimônio futuro com dados históricos reais.',
    keywords: ['bitcoin', 'renda fixa', 'strc', 'dividendos', 'yield', 'calculadora', 'simulação', 'investimento'],
    openGraph: {
        title: 'Calculadora Renda Fixa BTC (STRC)',
        description: 'Simulador de Renda Fixa Bitcoin baseado na estratégia STRC. Dados históricos, cenários Base/Bull/Bear e projeção de dividendos.',
        url: 'https://viverdebitcoin.com/renda-fixa-btc',
    },
};

export default function RendaFixaBtcPage() {
    return (
        <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-black">
            <div className="max-w-7xl mx-auto">
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <RendaFixaCalculator />
                </div>

                <StrcChart />
                <RendaFixaAbout />
            </div>
        </main>
    );
}
