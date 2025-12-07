import DcaCalculator from '@/components/DcaCalculator';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculadora DCA Bitcoin - Dollar Cost Averaging | Viver de Bitcoin',
    description: 'Simule seus investimentos recorrentes em Bitcoin (DCA). Veja como compras semanais ou mensais teriam performado historicamente.',
    keywords: ['bitcoin', 'dca', 'dollar cost averaging', 'investimento recorrente', 'calculadora bitcoin'],
    openGraph: {
        title: 'Calculadora DCA Bitcoin',
        description: 'Simule compras recorrentes de Bitcoin e veja o poder do DCA.',
        url: 'https://viverdebitcoin.com/calculadora-dca',
        siteName: 'Viver de Bitcoin',
        locale: 'pt_BR',
        type: 'website',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com/calculadora-dca',
    },
};

export default function DcaPage() {
    return (
        <main>
            <section className="calculator-section" id="dca-calculator">
                <DcaCalculator />
            </section>

            <section className="about-section">
                <h2 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1.8rem' }}>O que é Dollar Cost Averaging (DCA)?</h2>
                <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
                    <strong>Dollar Cost Averaging (DCA)</strong> é uma estratégia de investimento onde você compra uma quantia fixa de um ativo (como Bitcoin) em intervalos regulares, independentemente do preço.
                </p>
                <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
                    O objetivo é reduzir o impacto da volatilidade e evitar o erro de tentar acertar o "momento certo" (timing the market). Com o DCA, você compra mais Bitcoin quando o preço está baixo e menos quando está alto, resultando em um preço médio de compra equilibrado ao longo do tempo.
                </p>

                <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>Por que fazer DCA no Bitcoin?</h3>
                <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    <li><strong>Reduz o Estresse:</strong> Você não precisa acompanhar gráficos o dia todo.</li>
                    <li><strong>Disciplina:</strong> Cria o hábito de poupar e investir regularmente.</li>
                    <li><strong>Mitiga Riscos:</strong> Evita comprar tudo no topo do mercado.</li>
                    <li><strong>Acumulação de Longo Prazo:</strong> Foca na quantidade de Satoshis acumulados, não no preço de curto prazo.</li>
                </ul>
            </section>
        </main>
    );
}
