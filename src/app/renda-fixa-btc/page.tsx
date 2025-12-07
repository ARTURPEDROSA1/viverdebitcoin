import type { Metadata } from 'next';
import RendaFixaCalculator from '@/components/RendaFixaCalculator';
import StrcChart from '@/components/StrcChart';

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

                {/* About / Methodology Section - Matching Home Page Design */}
                <div className="about-content" style={{ maxWidth: '800px', marginInline: 'auto', fontSize: '0.9rem', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', marginTop: '3rem', border: '1px solid var(--border-color)' }}>
                    <h2 style={{ color: 'var(--primary-green)', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                        📘 O que é a Calculadora STRC?
                    </h2>

                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        A Calculadora STRC foi criada para ajudar investidores a entender, mês a mês, quanto podem receber de renda em dólar ao investir nas ações preferenciais <strong>STRC (Stretch Preferred)</strong> da Strategy.
                    </p>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Ela mostra os dividendos históricos, projeta dividendos futuros com base no preço da STRC, permite simular aportes recorrentes e calcula o retorno total considerando valorização, desvalorização e reinvestimento automático dos dividendos.
                    </p>

                    <h2 style={{ color: 'var(--bitcoin-orange)', marginBottom: '1rem', fontSize: '1.4rem', fontWeight: 'bold' }}>
                        🇧🇷 Vantagens para Investidores Brasileiros
                    </h2>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                1️⃣ Renda mensal em dólar — a moeda mais forte do mundo
                            </h4>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li>Proteção contra inflação do real</li>
                                <li>Aumento do poder de compra global</li>
                                <li>Diversificação cambial sem complicações</li>
                            </ul>
                            <p style={{ marginTop: '0.5rem', color: '#27ae60', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                "É literalmente transformar parte do seu patrimônio em uma máquina de gerar dólar."
                            </p>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                2️⃣ Não é evento tributável no Brasil enquanto você não vender
                            </h4>
                            <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                Os pagamentos são classificados como <strong>Retorno de Capital</strong>.
                            </p>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li>Não há imposto devido no Brasil enquanto você não vender suas ações</li>
                                <li>Você pode acumular renda em dólar por anos</li>
                                <li>Tributação só ocorre se, no futuro, você vender suas ações com ganho</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                3️⃣ Sem dores de cabeça com custódia
                            </h4>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li>Muitos brasileiros temem a autocustódia ou riscos operacionais</li>
                                <li>A STRC oferece exposição ao Bitcoin de forma profissional e auditada</li>
                                <li>Sem necessidade de hard wallets ou seed phrases</li>
                            </ul>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                4️⃣ Proteção pelo ativo mais escasso da história
                            </h4>
                            <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                <li>O mais duro do planeta com oferta limitada</li>
                                <li>Alta resistência à inflação monetária</li>
                                <li>A reserva de valor mais crescente dos últimos 15 anos</li>
                            </ul>
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(39, 174, 96, 0.1)', borderLeft: '4px solid #27ae60', borderRadius: '8px', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#27ae60', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                            🚀 Comece Agora
                        </h4>
                        <p style={{ marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Construa hoje sua renda internacional protegida em Bitcoin — sem complicação, sem tributação antecipada e com total controle sobre seus aportes.
                        </p>
                    </div>

                    {/* Disclaimer Box matching the reference */}
                    <div style={{ padding: '1.5rem', background: 'rgba(231, 76, 60, 0.1)', borderLeft: '4px solid #e74c3c', borderRadius: '8px' }}>
                        <h4 style={{ color: '#e74c3c', marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 'bold' }}>Aviso Importante (Disclaimer)</h4>
                        <p style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            Esta calculadora é uma ferramenta educacional de planejamento financeiro e não constitui recomendação de investimento, consultoria financeira ou garantia de resultados futuros.
                        </p>
                        <p style={{ marginBottom: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            O Bitcoin é um ativo volátil e todos os cenários são simulações hipotéticas. Sempre revise suas decisões com um profissional qualificado.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
