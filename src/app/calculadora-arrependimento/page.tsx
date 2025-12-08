import Calculator from '@/components/Calculator';
import type { Metadata } from 'next';
import CalculadoraArrependimentoAbout from '@/components/CalculadoraArrependimentoAbout';

export const metadata: Metadata = {
    title: 'Calculadora Bitcoin (ROI) - Viver de Bitcoin',
    description: 'Calcule o retorno sobre investimento (ROI) histórico do Bitcoin. Veja quanto você teria hoje se tivesse investido no passado. Ferramenta gratuita.',
    keywords: ['bitcoin', 'calculadora bitcoin', 'roi bitcoin', 'investimento bitcoin', 'histórico bitcoin'],
    openGraph: {
        title: 'Calculadora Bitcoin (ROI) - Viver de Bitcoin',
        description: 'Descubra quanto você teria lucrado investindo em Bitcoin.',
        url: 'https://viverdebitcoin.com/calculadora-arrependimento',
        siteName: 'Viver de Bitcoin',
        locale: 'pt_BR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com/calculadora-arrependimento',
    },
};

export default function CalculadoraArrependimentoPage() {
    return (
        <main>
            <section className="calculator-section" id="calculator">
                <Calculator />


            </section>

            <CalculadoraArrependimentoAbout />

        </main >
    );
}
