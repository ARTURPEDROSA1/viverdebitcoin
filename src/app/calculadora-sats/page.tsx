"use client";
import { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SatoshiCalculatorPage() {
    // State definitions
    const [inputAmount, setInputAmount] = useState<number>(100);
    const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
    const [annualIncrease, setAnnualIncrease] = useState<number>(5);
    const [currentAge, setCurrentAge] = useState<number>(25);
    const [retirementAge, setRetirementAge] = useState<number>(45);
    const [btcGrowthRate, setBtcGrowthRate] = useState<number>(20);

    // Prices
    const [prices, setPrices] = useState<{ BRL: number, USD: number, EUR: number } | null>(null);

    // Chart Data State
    const [chartData, setChartData] = useState<any>(null);
    const [calculatedSats, setCalculatedSats] = useState<number>(0);
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [resultSummary, setResultSummary] = useState<any>(null);

    // Fetch BTC prices
    const [loadingPrice, setLoadingPrice] = useState<boolean>(false);

    // Fetch BTC prices
    const fetchPrices = async () => {
        setLoadingPrice(true);
        try {
            const newPrices = { BRL: 0, USD: 0, EUR: 0 };

            // USD & EUR (CoinDesk with CoinGecko fallback)
            try {
                const res = await fetch('https://api.coindesk.com/v1/bpi/currentprice.json');
                const data = await res.json();

                if (data.bpi && data.bpi.USD) {
                    newPrices.USD = data.bpi.USD.rate_float;
                }
                if (data.bpi && data.bpi.EUR) {
                    newPrices.EUR = data.bpi.EUR.rate_float;
                }
            } catch (e) {
                console.error("Error fetching USD/EUR from CoinDesk:", e);
                // Fallback to CoinGecko
                try {
                    const resCoingecko = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur');
                    const dataCoingecko = await resCoingecko.json();
                    newPrices.USD = dataCoingecko.bitcoin.usd;
                    newPrices.EUR = dataCoingecko.bitcoin.eur;
                } catch (e2) {
                    console.error("Error fetching USD/EUR from CoinGecko:", e2);
                }
            }

            // BRL from AwesomeAPI (Independent)
            try {
                const resBRL = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
                const dataBRL = await resBRL.json();
                newPrices.BRL = parseFloat(dataBRL.BTCBRL.bid);
            } catch (e) {
                console.error("Error fetching BRL:", e);
            }

            // Update state safely (only if values differ significantly or if completely missing)
            setPrices(prev => ({
                BRL: newPrices.BRL || (prev?.BRL ?? 0),
                USD: newPrices.USD || (prev?.USD ?? 0),
                EUR: newPrices.EUR || (prev?.EUR ?? 0),
            }));

        } catch (error) {
            console.error("Erro geral ao buscar preços BTC:", error);
        } finally {
            setLoadingPrice(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const handleCalculate = () => {
        if (!prices) return;

        const currentPrice = prices[currency];
        const yearsToInvest = retirementAge - currentAge;

        if (yearsToInvest <= 0) {
            setChartData(null);
            setResultSummary(null);
            return;
        }

        // Convert Input Amount to Sats
        // Formula: (Amount / BitcoinPrice) * 100,000,000
        const monthlySats = (inputAmount / currentPrice) * 100000000;
        setCalculatedSats(monthlySats);

        const labels = [];
        const patrimonyBrl = [];
        const totalBtcAccumulated = [];

        let currentSatsMonthly = monthlySats;
        let accumulatedSats = 0;
        // Projection uses current price as baseline
        let projectedBtcPrice = currentPrice;

        for (let year = 1; year <= yearsToInvest; year++) {
            // Annual Contribution in Sats
            const annualSatsContribution = currentSatsMonthly * 12;
            accumulatedSats += annualSatsContribution;

            // Increase monthly sats for next year
            currentSatsMonthly = currentSatsMonthly * (1 + annualIncrease / 100);

            // Project BTC Price
            projectedBtcPrice = projectedBtcPrice * (1 + btcGrowthRate / 100);

            // Calculate Patrimony in Selected Currency
            const accumulatedBtc = accumulatedSats / 100000000;
            const patrimonyValue = accumulatedBtc * projectedBtcPrice;

            labels.push(`Idade ${currentAge + year}`);
            patrimonyBrl.push(patrimonyValue);
            totalBtcAccumulated.push(accumulatedBtc);
        }

        const finalBtcVal = totalBtcAccumulated[totalBtcAccumulated.length - 1];
        const finalPatrimonyVal = patrimonyBrl[patrimonyBrl.length - 1];

        setResultSummary({
            finalBtc: finalBtcVal,
            finalSats: finalBtcVal * 100000000,
            valueAtCurrent: finalBtcVal * currentPrice,
            satsPerCurrent: 100000000 / currentPrice, // Sats per 1 unit of currency
            valueProjected: finalPatrimonyVal,
            satsPerProjected: 100000000 / projectedBtcPrice
        });

        setChartData({
            labels,
            datasets: [
                {
                    label: `Patrimônio Projetado (${currency})`,
                    data: patrimonyBrl,
                    borderColor: '#f7931a',
                    backgroundColor: 'rgba(247, 147, 26, 0.2)',
                    yAxisID: 'y',
                    fill: true,
                },
                {
                    label: 'BTC Acumulado',
                    data: totalBtcAccumulated,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.2)',
                    yAxisID: 'y1',
                    fill: false,
                }
            ]
        });
        setViewMode('chart');
    };

    const formatCurrency = (val: number, cur: string) => val.toLocaleString('pt-BR', { style: 'currency', currency: cur });
    const formatBtc = (val: number) => val.toLocaleString('pt-BR', { minimumFractionDigits: 8, maximumFractionDigits: 8 });

    // Latest results for summary
    const finalBtc = chartData ? chartData.datasets[1].data[chartData.datasets[1].data.length - 1] : 0;
    const finalPatrimony = chartData ? chartData.datasets[0].data[chartData.datasets[0].data.length - 1] : 0;


    return (
        <main className="about-section">
            <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Calculadora de Aposentadoria em Satoshis</h1>

            <div className="about-content">
                {/* Calculator Inputs */}
                <div className="calculator-container" style={{ margin: '2rem auto', padding: '2rem', background: 'var(--card-bg)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--bitcoin-orange)' }}>Seus Dados de Planejamento</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="input-label">Valor do Aporte Mensal</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input type="number" value={inputAmount} onChange={(e) => setInputAmount(parseFloat(e.target.value))} className="calculator-input" />
                                <select value={currency} onChange={(e: any) => setCurrency(e.target.value)} className="calculator-input" style={{ width: '80px', flexShrink: 0 }}>
                                    <option value="BRL">BRL</option>
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Aumento anual do aporte (%)</label>
                            <input type="number" value={annualIncrease} onChange={(e) => setAnnualIncrease(parseFloat(e.target.value))} className="calculator-input" />
                        </div>
                        <div>
                            <label className="input-label">Idade Atual</label>
                            <input type="number" value={currentAge} onChange={(e) => setCurrentAge(parseFloat(e.target.value))} className="calculator-input" />
                        </div>
                        <div>
                            <label className="input-label">Idade de Aposentadoria</label>
                            <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(parseFloat(e.target.value))} className="calculator-input" />
                        </div>
                        <div>
                            <label className="input-label">Crescimento anual do BTC (%)</label>
                            <input type="number" value={btcGrowthRate} onChange={(e) => setBtcGrowthRate(parseFloat(e.target.value))} className="calculator-input" />
                        </div>
                        <div>
                            <label className="input-label">Preço Atual BTC ({currency})</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={prices && prices[currency] ? formatCurrency(prices[currency], currency) : (loadingPrice ? 'Atualizando...' : 'Carregando...')}
                                    disabled
                                    className="calculator-input"
                                    style={{ background: 'rgba(0,0,0,0.1)', flex: 1 }}
                                />
                                <button
                                    onClick={fetchPrices}
                                    disabled={loadingPrice}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: loadingPrice ? 'not-allowed' : 'pointer',
                                        fontSize: '1.2rem',
                                        padding: '4px',
                                        opacity: loadingPrice ? 0.5 : 1
                                    }}
                                    title="Atualizar Preço"
                                    aria-label="Atualizar Preço"
                                >
                                    🔄
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleCalculate}
                        className="calc-button"
                        style={{
                            width: '100%',
                            padding: '1rem',
                            marginTop: '1.5rem',
                            background: 'var(--bitcoin-orange)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#e67e00'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'var(--bitcoin-orange)'}
                    >
                        Calcular Aposentadoria em Sats
                    </button>

                    {resultSummary && (
                        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.95rem' }}>
                                <div><strong>BTC Acumulado:</strong> <span style={{ color: 'var(--bitcoin-orange)' }}>{formatBtc(resultSummary.finalBtc)}</span></div>
                                <div><strong>Sats Acumulados:</strong> {(resultSummary.finalSats).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</div>

                                <div><strong>Valor Atual Acumulado:</strong> {formatCurrency(resultSummary.valueAtCurrent, currency)}</div>
                                <div><strong>Sats/{currency} (Hoje):</strong> {Math.round(resultSummary.satsPerCurrent).toLocaleString('pt-BR')}</div>

                                <div><strong>Valor Projetado:</strong> <span style={{ color: 'var(--primary-green)' }}>{formatCurrency(resultSummary.valueProjected, currency)}</span></div>
                                <div><strong>Sats/{currency} (Projetado):</strong> {Math.round(resultSummary.satsPerProjected).toLocaleString('pt-BR')}</div>
                            </div>
                        </div>
                    )}

                    {/* Share Buttons */}
                    <div style={{ marginTop: '2rem', display: 'flex', gap: '10px', width: '100%' }}>
                        <a href={`https://twitter.com/intent/tweet?text=Confira%20esta%20calculadora%20de%20aposentadoria%20em%20Satoshis!&url=https://viverdebitcoin.com/calculadora-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            𝕏
                        </a>
                        <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            IG
                        </a>
                        <a href={`https://wa.me/?text=Confira%20esta%20calculadora%20de%20aposentadoria%20em%20Satoshis!%20https://viverdebitcoin.com/calculadora-sats`} target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: '#fff', padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            WhatsApp
                        </a>
                    </div>
                    <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Compartilhe nas suas redes sociais :)
                    </p>
                </div>

                {/* Results Section */}
                {chartData && (
                    <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1rem', marginTop: '0', fontSize: '1.8rem' }}>Resultados do seu Planejamento</h3>



                        {/* Toggle View */}
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                            <button onClick={() => setViewMode('chart')} style={{ padding: '0.6rem 1.2rem', background: viewMode === 'chart' ? 'var(--primary-green)' : 'transparent', border: '1px solid var(--primary-green)', color: viewMode === 'chart' ? '#fff' : 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Gráfico</button>
                            <button onClick={() => setViewMode('table')} style={{ padding: '0.6rem 1.2rem', background: viewMode === 'table' ? 'var(--primary-green)' : 'transparent', border: '1px solid var(--primary-green)', color: viewMode === 'table' ? '#fff' : 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Tabela</button>
                        </div>

                        {viewMode === 'chart' ? (
                            <div style={{ height: '350px', width: '100%' }}>
                                <Line
                                    data={chartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        interaction: {
                                            mode: 'index' as const,
                                            intersect: false,
                                        },
                                        scales: {
                                            y: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'left' as const,
                                                title: { display: true, text: `Patrimônio (${currency})` }
                                            },
                                            y1: {
                                                type: 'linear' as const,
                                                display: true,
                                                position: 'right' as const,
                                                grid: { drawOnChartArea: false },
                                                title: { display: true, text: 'BTC Acumulado' }
                                            },
                                        },
                                        plugins: {
                                            legend: { position: 'top' as const },
                                            title: { display: false }
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="about-table" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Idade</th>
                                            <th>Patrimônio ({currency})</th>
                                            <th>BTC Acumulado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {chartData.labels.map((label: string, i: number) => (
                                            <tr key={i}>
                                                <td>{label}</td>
                                                <td>{formatCurrency(chartData.datasets[0].data[i], currency)}</td>
                                                <td>{formatBtc(chartData.datasets[1].data[i])}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>* A projeção é educacional e não representa garantia financeira.</p>
                    </div>
                )}





                {/* Educational Content */}
                <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                    <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Descubra Quando Você Pode Parar de Trabalhar Guardando Bitcoin</h3>
                    <p>A Calculadora de Aposentadoria em Satoshis é uma ferramenta simples e poderosa criada para ajudar você a visualizar como pequenas economias mensais em Bitcoin podem crescer ao longo dos anos.</p>
                    <p>Ao informar quanto você guarda por mês (em reais, dólares ou euros), configurar um aumento recorrente dos aportes e definir a data desejada para aposentadoria, o sistema projeta quanto BTC você terá acumulado.</p>
                    <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0', borderLeft: '4px solid var(--primary-green)' }}>
                        <p><strong>Por exemplo:</strong> Alguém que começa a poupar aos 25 anos, mantendo contribuições regulares e assumindo um crescimento moderado do Bitcoin, pode potencialmente atingir liberdade financeira perto dos 45 anos.</p>
                    </div>
                </div>

                {/* Educational Content */}
                <h2>1. O que é um Satoshi?</h2>
                <p>Um satoshi é a menor unidade do Bitcoin: <strong>1 BTC = 100.000.000 sats</strong>.</p>
                <p>Isso torna possível que qualquer pessoa comece a economizar em Bitcoin, mesmo com pouco dinheiro.</p>

                <h2>2. Por que economizar em Bitcoin?</h2>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>Crescimento relevante no longo prazo</li>
                    <li>Oferta limitada e política monetária imutável</li>
                    <li>Proteção contra inflação e desvalorização de moedas locais</li>
                    <li>Adoção crescente por empresas, instituições e governos</li>
                    <li>Acesso global, sem controle estatal ou bancário</li>
                </ul>
                <p>Bitcoin é visto por muitos como uma reserva de valor superior, especialmente para quem pensa em aposentadoria.</p>

                <h2>3. Planejamento de aposentadoria com Bitcoin</h2>
                <p>Enquanto calculadoras tradicionais projetam renda fixa, ações e juros compostos em moeda fiduciária, a <strong>Calculadora de Aposentadoria em Satoshis</strong> considera o acúmulo mensal de satoshis, o aporte crescente e a conversão futura do patrimônio para BRL.</p>
                <p>Ideal para quem acredita que Bitcoin pode ser a base da sua liberdade financeira.</p>

                <h2>7. Por que a taxa de crescimento do Bitcoin é importante</h2>
                <p>A taxa escolhida define o cenário da projeção.</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li><strong>10% a.a.</strong> → conservador</li>
                    <li><strong>15–20% a.a.</strong> → moderado, historicamente razoável</li>
                    <li><strong>25–30% a.a.</strong> → otimista</li>
                    <li><strong>40%+ a.a.</strong> → altamente especulativo</li>
                </ul>

                <h2>9. BOAS PRÁTICAS DE SEGURANÇA — AUTOCUSTÓDIA E ENDEREÇOS ANUAIS DIFERENTES</h2>
                <p>A segurança no armazenamento do Bitcoin é fundamental, especialmente para quem pensa em aposentadoria ou acumulação de longo prazo. Por isso, é altamente recomendado:</p>

                <h3>→ Guardar os sats acumulados em autocustódia (self-custody)</h3>
                <p>Isso significa não deixar o Bitcoin em corretoras, utilizar uma carteira fria (cold wallet) e controlar suas próprias chaves privadas.</p>
                <p><em>“Not your keys, not your coins.”</em></p>

                <h3>→ Usar um endereço Bitcoin diferente para cada ano de economia</h3>
                <p>Isso é uma prática avançada, mas extremamente importante para <strong>PRIVACIDADE E SEGURANÇA FINANCEIRA</strong>.</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '8px', margin: '1.5rem 0' }}>
                    <h4 style={{ color: 'var(--bitcoin-orange)', marginTop: 0 }}>🛡️ Por que usar um endereço por ano?</h4>
                    <p>Porque assim cada ano de economia fica isolado em um endereço diferente.</p>
                    <ul style={{ margin: '0.5rem 0 0 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                        <li>Quando você gastar os sats de um ano específico, somente aquele saldo será exposto publicamente.</li>
                        <li>O restante do seu patrimônio permanece invisível e protegido.</li>
                        <li>Ajuda a manter uma boa higiene de privacidade na blockchain.</li>
                        <li>Reduz o risco de ataque baseado em análises avançadas de chaves públicas no futuro.</li>
                    </ul>
                    <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>🎯 Resultado: Você divide sua aposentadoria em "caixinhas" anuais de BTC, onde cada caixa possui seu próprio endereço na sua cold wallet.</p>
                </div>
            </div>
        </main>
    );
}
