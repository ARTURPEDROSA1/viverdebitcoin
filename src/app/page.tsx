import Calculator from '@/components/Calculator';
import MarketTicker from '@/components/MarketTicker';

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <h1 className="hero-title">Calculadora do <br />Arrependimento Bitcoin</h1>
        <p className="hero-subtitle">Simule ganhos passados e veja porque o melhor momento para plantar uma árvore foi há 10 anos. O segundo melhor é agora.</p>
      </section>

      <MarketTicker />

      <section className="calculator-section" id="calculator">
        <Calculator />
      </section>

      <section className="about-section">
        <h4 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '0.5rem' }}>Como funciona a Calculadora do Arrependimento Bitcoin</h4>
        <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem' }}>
          <li><strong>Insira o valor investido:</strong> Digite quanto você teria aplicado em Bitcoin (BRL, USD e EUR).</li>
          <li><strong>Selecione a data do investimento:</strong> Escolha o dia exato em que o investimento hipotético teria sido realizado.</li>
          <li><strong>Personalize a moeda:</strong> Para brasileiros no exterior, é possível visualizar valores em diferentes moedas.</li>
          <li><strong>Clique em “Calcular Resultado”:</strong> A ferramenta pesquisa o preço histórico do Bitcoin, calcula quantos BTC teriam sido comprados, e compara com o preço atual do Bitcoin.</li>
        </ul>

        <p style={{ marginBottom: '0.5rem' }}><strong>O resultado mostra:</strong></p>
        <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem' }}>
          <li>Lucro ou prejuízo potencial;</li>
          <li>Quantidade de Bitcoin adquirida na época;</li>
          <li>Valor atualizado desse Bitcoin hoje.</li>
        </ul>
      </section>
    </main>
  );
}
