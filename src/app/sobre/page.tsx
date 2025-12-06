'use client';
import { useEffect, useState } from 'react';
import HalvingCountdown from '@/components/HalvingCountdown';

export default function AboutPage() {
    const [priceBRL, setPriceBRL] = useState<number | null>(null);

    useEffect(() => {
        const fetchPrice = async () => {
            try {
                const res = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                const data = await res.json();
                setPriceBRL(parseFloat(data.BTCBRL.bid));
            } catch (e) { console.error(e); }
        };
        fetchPrice();
        const interval = setInterval(fetchPrice, 30000);
        return () => clearInterval(interval);
    }, []);

    const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtMillions = (v: number) => `R$ ${(v / 1000000).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} milhões`;

    return (
        <main className="about-section">
            <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Sobre o Bitcoin</h1>
            <div className="about-content">
                <p><strong>Bitcoin</strong> não é apenas uma moeda digital; é a maior revolução financeira da nossa era.</p>
                <p>Diferente do dinheiro que usamos no dia a dia (Real, Dólar), que é emitido e controlado por governos (Bancos Centrais), o Bitcoin é <strong>descentralizado</strong>. Isso significa que não existe um "dono" ou uma autoridade central que possa imprimir mais moedas, bloquear sua conta ou confiscar seu dinheiro arbitrariamente.</p>

                <h2>1. A verdadeira inovação: Blockchain</h2>
                <p>Muitos acham que a inovação é a moeda, mas a verdadeira genialidade está na tecnologia por trás dela: a <strong>Blockchain</strong>.</p>
                <p>Imagine um livro-razão (um caderno de contabilidade) público, onde todas as transações ficam registradas para sempre. Ninguém pode apagar ou alterar o que foi escrito. Cada página desse caderno é um "bloco", e todos os blocos são conectados numa corrente inquebrável.</p>

                <h2>2. Escassez Absoluta: Só existirão 21 milhões</h2>
                <p>Ao contrário dos Bancos Centrais, que podem imprimir dinheiro infinito (gerando inflação), o Bitcoin tem um limite matemático rígido.</p>
                <p><strong>Nunca haverá mais que 21.000.000 de Bitcoins.</strong></p>
                <p>Hoje, cerca de 19 milhões já foram minerados. Os últimos 2 milhões levarão mais de 100 anos para serem criados.</p>

                {/* Pizza Section */}
                <h2>4. A transação histórica das pizzas — as pizzas mais caras do mundo</h2>
                <p>Em 2010, aconteceu a primeira compra real com Bitcoin: um programador pagou <strong>10.000 BTC</strong> por duas pizzas. Na época, era apenas uma curiosidade.</p>

                <div className="highlight-box">
                    <p>Se atualizarmos para a cotação de hoje, se 1 BTC = {priceBRL ? fmt(priceBRL) : 'Carregando...'}, esses 10.000 BTC valeriam:</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        10.000 × {priceBRL ? fmt(priceBRL) : '...'} = {priceBRL ? fmt(priceBRL * 10000) : 'Carregando...'}
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        Ou seja: <strong>{priceBRL ? `R$ ${((priceBRL * 10000) / 1000000000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} bilhões` : '...'}</strong> em duas pizzas.
                    </p>
                </div>
                <p>Por isso, essa compra ficou conhecida como as pizzas mais caras do mundo.</p>

                {/* Halving Section */}
                <h2>5. Halving do Bitcoin: o coração da escassez programada</h2>
                <p>O <strong>halving</strong> é um evento que acontece aproximadamente a cada 210.000 blocos, ou cerca de 4 anos, reduzindo pela metade a quantidade de novos Bitcoins que os mineradores recebem por bloco.</p>

                <h3>5.1. Bloco a cada 10 minutos e receita atual</h3>
                <p>A rede foi desenhada para que, em média, um bloco seja minerado a cada 10 minutos.</p>
                <p>Após o halving de 2024, a recompensa atual é de: <strong>3,125 BTC por bloco</strong></p>

                <div className="highlight-box">
                    <p>Usando a cotação atual:</p>
                    <p><strong>1 BTC = {priceBRL ? fmt(priceBRL) : 'Carregando...'}</strong></p>

                    <p style={{ marginTop: '1rem' }}>Receita por bloco (a cada 10 minutos) para os mineradores:</p>
                    <p>3,125 × {priceBRL ? fmt(priceBRL) : '...'} ≈ <strong>{priceBRL ? fmt(priceBRL * 3.125) : 'Carregando...'}</strong> a cada 10 minutos.</p>

                    <p style={{ marginTop: '0.5rem' }}>Ou seja, cerca de <strong>{priceBRL ? fmtMillions(priceBRL * 3.125) : '...'}</strong> em novos Bitcoins é emitido em média a cada 10 minutos hoje (sem contar taxas de transação).</p>
                </div>

                <HalvingCountdown />

                <h3>5.2. Tabela de Halving</h3>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr>
                                <th># Halving</th>
                                <th>Ano aproximado</th>
                                <th>Recompensa por bloco (BTC)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>0</td><td>2009</td><td>50,00</td></tr>
                            <tr><td>1</td><td>2012</td><td>25,00</td></tr>
                            <tr><td>2</td><td>2016</td><td>12,50</td></tr>
                            <tr><td>3</td><td>2020</td><td>6,25</td></tr>
                            <tr><td>4</td><td>2024</td><td>3,125</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>8. Empresas públicas com maior tesouraria em Bitcoin</h2>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr><th>#</th><th>Empresa</th><th>BTC em tesouraria (aprox.)</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td><a href="https://www.strategy.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Strategy, Inc. (MicroStrategy)</a></td>
                                <td>650.000+ BTC</td>
                            </tr>
                            <tr><td>2</td><td>Marathon Digital</td><td>26.000+ BTC</td></tr>
                            <tr><td>3</td><td>Tesla</td><td>9.700+ BTC</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
