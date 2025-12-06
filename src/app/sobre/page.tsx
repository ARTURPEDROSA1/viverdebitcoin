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
                <h2>1. O que é Bitcoin?</h2>
                <p>Bitcoin é um dinheiro digital descentralizado, criado para funcionar sem bancos, governos ou intermediários.</p>
                <p>Pode ser enviado para qualquer lugar do mundo, em poucos minutos.</p>
                <div style={{ margin: '1rem 0' }}>
                    <p>🔒 É protegido por criptografia e por milhares de computadores espalhados pelo planeta.</p>
                    <p>🏺 Tem oferta limitada a 21 milhões de unidades, o que faz com que seja chamado de "ouro digital".</p>
                </div>
                <p>Bitcoin é uma mistura de tecnologia + escassez + liberdade financeira.</p>

                <h2>2. Por que o Bitcoin foi criado?</h2>
                <p>Em 2008, em plena crise financeira global, um autor anônimo chamado Satoshi Nakamoto publicou o whitepaper <em>"Bitcoin: A Peer-to-Peer Electronic Cash System"</em>.</p>
                <p>O objetivo era resolver três problemas do dinheiro tradicional:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc' }}>
                    <li><strong>Inflação:</strong> governos podem imprimir moeda sem limite.</li>
                    <li><strong>Dependência de bancos:</strong> você nunca tem controle total do seu dinheiro.</li>
                    <li><strong>Falta de privacidade e censura:</strong> transações podem ser bloqueadas ou rastreadas.</li>
                </ul>
                <p>Bitcoin nasce como uma alternativa: um sistema monetário aberto, transparente e resistente à censura.</p>

                <h2>3. Como o Bitcoin funciona (explicação simples)</h2>
                <p>Imagine um livro-caixa público gigante, que todos podem ver e auditar, mas ninguém consegue apagar ou alterar.</p>
                <p>Esse livro é a <strong>blockchain</strong>.</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
                    <h4 style={{ color: 'var(--bitcoin-orange)', marginTop: 0 }}>Conceitos básicos:</h4>
                    <ul style={{ margin: '0.5rem 0 0 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                        <li><strong>Blockchain:</strong> registro público de todas as transações de Bitcoin.</li>
                        <li><strong>Nós (nodes):</strong> computadores descentralizados que guardam uma cópia da blockchain e validam tudo.</li>
                        <li><strong>Mineradores:</strong> empresas que competem para criar novos blocos e recebem Bitcoin como recompensa.</li>
                        <li><strong>Carteira (wallet):</strong> aplicativo ou dispositivo que guarda suas chaves privadas (seus "acessos" ao BTC).</li>
                        <li><strong>Satoshis:</strong> a menor unidade de Bitcoin. 1 BTC = 100.000.000 satoshis.</li>
                    </ul>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Sats por Bitcoin</h4>
                <div className="table-responsive">
                    <table className="about-table" style={{ width: '100%', textAlign: 'center' }}>
                        <thead>
                            <tr>
                                <th style={{ textAlign: 'center' }}>Sats</th>
                                <th style={{ textAlign: 'center' }}>Bitcoin</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>1 Satoshi</td><td>0.00000001 BTC</td></tr>
                            <tr><td>10 Satoshi</td><td>0.00000010 BTC</td></tr>
                            <tr><td>100 Satoshi</td><td>0.00000100 BTC</td></tr>
                            <tr><td>1.000 Satoshi</td><td>0.00001000 BTC</td></tr>
                            <tr><td>10.000 Satoshi</td><td>0.00010000 BTC</td></tr>
                            <tr><td>100.000 Satoshi</td><td>0.00100000 BTC</td></tr>
                            <tr><td>1.000.000 Satoshi</td><td>0.01000000 BTC</td></tr>
                            <tr><td>10.000.000 Satoshi</td><td>0.10000000 BTC</td></tr>
                            <tr><td>100.000.000 Satoshi</td><td>1.00000000 BTC</td></tr>
                        </tbody>
                    </table>
                </div>

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

                <h2>5. Halving do Bitcoin: o coração da escassez programada</h2>
                <p>O <strong>halving</strong> é um evento que acontece aproximadamente a cada 210.000 blocos, ou cerca de 4 anos, reduzindo pela metade a quantidade de novos Bitcoins que os mineradores recebem por bloco.</p>
                <p>Isso faz com que a oferta nova de BTC diminua com o tempo, aumentando a escassez.</p>

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

                <h3>5.2. Tabela de Halving até o final (aproximado)</h3>
                <p>Abaixo, uma tabela simplificada com todas as reduções de recompensa, até perto do ano em que o último Bitcoin deve ser minerado (por volta de 2140).</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr>
                                <th># Halving</th>
                                <th>Ano aproximado</th>
                                <th>Recompensa (BTC)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>0</td><td>2009</td><td>50,00</td></tr>
                            <tr><td>1</td><td>2012</td><td>25,00</td></tr>
                            <tr><td>2</td><td>2016</td><td>12,50</td></tr>
                            <tr><td>3</td><td>2020</td><td>6,25</td></tr>
                            <tr><td>4</td><td>2024</td><td>3,125</td></tr>
                            <tr><td>5</td><td>2028</td><td>1,5625</td></tr>
                            <tr><td>6</td><td>2032</td><td>0,78125</td></tr>
                            <tr><td>7</td><td>2036</td><td>0,390625</td></tr>
                            <tr><td>8</td><td>2040</td><td>0,1953125</td></tr>
                            <tr><td>9</td><td>2044</td><td>0,09765625</td></tr>
                            <tr><td>10</td><td>2048</td><td>0,04882812</td></tr>
                            <tr><td>11</td><td>2052</td><td>0,02441406</td></tr>
                            <tr><td>12</td><td>2056</td><td>0,01220703</td></tr>
                            <tr><td>13</td><td>2060</td><td>0,00610352</td></tr>
                            <tr><td>14</td><td>2064</td><td>0,00305176</td></tr>
                            <tr><td>15</td><td>2068</td><td>0,00152588</td></tr>
                            <tr><td>16</td><td>2072</td><td>0,00076294</td></tr>
                            <tr><td>17</td><td>2076</td><td>0,00038147</td></tr>
                            <tr><td>18</td><td>2080</td><td>0,00019073</td></tr>
                            <tr><td>19</td><td>2084</td><td>0,00009537</td></tr>
                            <tr><td>20</td><td>2088</td><td>0,00004768</td></tr>
                            <tr><td>21</td><td>2092</td><td>0,00002384</td></tr>
                            <tr><td>22</td><td>2096</td><td>0,00001192</td></tr>
                            <tr><td>23</td><td>2100</td><td>0,00000596</td></tr>
                            <tr><td>24</td><td>2104</td><td>0,00000298</td></tr>
                            <tr><td>25</td><td>2108</td><td>0,00000149</td></tr>
                            <tr><td>26</td><td>2112</td><td>0,00000075</td></tr>
                            <tr><td>27</td><td>2116</td><td>0,00000037</td></tr>
                            <tr><td>28</td><td>2120</td><td>0,00000019</td></tr>
                            <tr><td>29</td><td>2124</td><td>0,00000009</td></tr>
                            <tr><td>30</td><td>2128</td><td>0,00000005</td></tr>
                            <tr><td>31</td><td>2132</td><td>0,00000002</td></tr>
                            <tr><td>32</td><td>2136</td><td>0,00000001</td></tr>
                            <tr><td>33 (final)</td><td>2140</td><td>~0,00000001</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>Depois disso, não existirão novos Bitcoins sendo emitidos. Mineradores serão recompensados apenas pelas taxas de transação.</p>

                <h2>6. Linha do tempo do Bitcoin: do white paper ao último BTC</h2>
                <div style={{ marginLeft: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                    {[
                        { year: '2008', desc: 'Publicação do whitepaper por Satoshi Nakamoto.' },
                        { year: '2009', desc: 'Bloco gênesis, início da rede, recompensa de 50 BTC por bloco.' },
                        { year: '2010', desc: 'Compra das pizzas mais caras do mundo por 10.000 BTC.' },
                        { year: '2012', desc: '1º halving: 25 BTC.' },
                        { year: '2016', desc: '2º halving: 12,5 BTC.' },
                        { year: '2017', desc: 'Bitcoin bate ~US$ 20.000 em seu primeiro grande ciclo de alta.' },
                        { year: '2020', desc: '3º halving: 6,25 BTC. Entrada de empresas listadas em bolsa comprando BTC para tesouraria.' },
                        { year: '2021', desc: 'El Salvador torna o Bitcoin moeda de curso legal.' },
                        { year: '2024', desc: '4º halving: 3,125 BTC.' },
                        { year: '2025+', desc: 'Governos criam reservas estratégicas de Bitcoin, com destaque para EUA, China, Reino Unido, Butão e El Salvador.' },
                        { year: '~2140', desc: 'Último satoshi será minerado. Oferta total de Bitcoin atinge 21 milhões de BTC.' },
                    ].map((item, i) => (
                        <div key={i} style={{ marginBottom: '1rem' }}>
                            <strong style={{ color: 'var(--bitcoin-orange)' }}>{item.year}:</strong> {item.desc}
                        </div>
                    ))}
                </div>

                <h2>7. Bitcoin e governos: quem são os maiores acumuladores?</h2>
                <p>Os números mudam ao longo do tempo, mas com base nos dados mais recentes, vários governos já acumulam Bitcoin em suas reservas.</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr><th>País</th><th>BTC acumulado (aprox.)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>Estados Unidos</td><td>326.588 BTC</td></tr>
                            <tr><td>China</td><td>190.000 BTC</td></tr>
                            <tr><td>Reino Unido</td><td>61.243 BTC</td></tr>
                            <tr><td>Ucrânia</td><td>46.351 BTC</td></tr>
                            <tr><td>El Salvador</td><td>7.485 BTC</td></tr>
                            <tr><td>Emirados Árabes</td><td>6.420 BTC</td></tr>
                            <tr><td>Butão</td><td>6.227 BTC</td></tr>
                            <tr><td>Coreia do Norte</td><td>803 BTC</td></tr>
                            <tr><td>Venezuela</td><td>240 BTC</td></tr>
                            <tr><td>Finlândia</td><td>90 BTC</td></tr>
                            <tr><td>Alemanha</td><td>0,007 BTC</td></tr>
                        </tbody>
                    </table>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Esses valores são aproximados e podem mudar com novas compras, vendas ou confisco de fundos.</p>

                <h2>8. Empresas públicas com maior tesouraria em Bitcoin (Top 10 global)</h2>
                <p>Além dos países, empresas listadas em bolsa também acumulam grandes quantidades de BTC como estratégia de reserva de valor. bitcointreasuries.net</p>
                <div className="table-responsive">
                    <table className="about-table">
                        <thead>
                            <tr><th>#</th><th>Empresa</th><th>BTC em tesouraria (aprox.)</th></tr>
                        </thead>
                        <tbody>
                            {[
                                { name: <a href="https://www.strategy.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Strategy, Inc. (MicroStrategy)</a>, val: '650.000 BTC' },
                                { name: 'Marathon Digital', val: '53.250 BTC' },
                                { name: 'Twenty One (XXI)', val: '43.514 BTC' },
                                { name: 'Metaplanet, Inc.', val: '30.823 BTC' },
                                { name: 'Bitcoin Standard', val: '30.021 BTC' },
                                { name: 'Bullish', val: '24.300 BTC' },
                                { name: 'Riot Platforms, Inc.', val: '19.287 BTC' },
                                { name: 'Trump Media & Technology', val: '15.000 BTC' },
                                { name: 'Coinbase Global', val: '14.548 BTC' },
                                { name: 'CleanSpark Inc', val: '13.011 BTC' },
                            ].map((row, i) => (
                                <tr key={i}><td>{i + 1}</td><td>{row.name}</td><td>{row.val}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <h2>9. Treasury companies do Brasil: OBTC3 e CASH3</h2>
                <p>O Brasil já possui suas próprias Bitcoin Treasury Companies, seguindo o modelo da MicroStrategy.</p>

                <h3>9.1. OBTC3 – <a href="https://www.oranjebtc.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>OranjeBTC</a></h3>
                <p>A OranjeBTC (OBTC3) tem como foco ser uma grande tesouraria de Bitcoin da América Latina, mantendo a maior parte de seus ativos em BTC. De acordo com o painel oficial da empresa, a tesouraria possui cerca de:</p>
                <p><strong>≈ 3.720 BTC em reservas.</strong></p>

                <h3>9.2. CASH3 – <a href="https://ri.meliuz.com.br/default.aspx?linguagem=pt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Méliuz</a></h3>
                <p>A Méliuz (CASH3) adotou Bitcoin como estratégia oficial de tesouraria em 2025 e se tornou a primeira "Bitcoin Treasury Company" do Brasil.</p>
                <p>Segundo reportagens recentes, a companhia já acumula aproximadamente:</p>
                <p><strong>≈ 595,67 BTC em tesouraria.</strong></p>

                <div className="table-responsive">
                    <table className="about-table">
                        <thead><tr><th>Ticker</th><th>Empresa</th><th>BTC em tesouraria (aprox.)</th></tr></thead>
                        <tbody>
                            <tr><td>OBTC3</td><td><a href="https://www.oranjebtc.com/dashboard" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>OranjeBTC</a></td><td>~3.720 BTC</td></tr>
                            <tr><td>CASH3</td><td><a href="https://ri.meliuz.com.br/default.aspx?linguagem=pt" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--bitcoin-orange)' }}>Méliuz</a></td><td>~595,67 BTC</td></tr>
                        </tbody>
                    </table>
                </div>

                <h2>10. Por que isso tudo importa?</h2>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>Bitcoin é escasso: halving garantido até cerca de 2140, máximo de 21 milhões de BTC.</li>
                    <li>Governos e empresas estão acumulando Bitcoin como reserva estratégica de valor.</li>
                    <li>Blocos a cada 10 minutos hoje geram cerca de R$ 1,52 milhão em novos BTC, mas essa emissão vai caindo ao longo das décadas.</li>
                    <li>Tesourarias internacionais e brasileiras reforçam a narrativa de Bitcoin como ativo de reserva global.</li>
                </ul>
                <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '1.5rem', borderLeft: '4px solid var(--primary-green)' }}>
                    <p style={{ fontWeight: 'bold' }}>Tudo isso cria uma tese simples para o leitor leigo:</p>
                    <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"Se governos, grandes empresas e tesourarias estão comprando Bitcoin para o longo prazo, talvez valha a pena estudar, entender e considerar uma pequena exposição."</p>
                </div>
            </div>
        </main>
    );
}
