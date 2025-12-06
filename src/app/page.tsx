import Calculator from '@/components/Calculator';
import MarketTicker from '@/components/MarketTicker';

export default function Home() {
  return (
    <main>


      <MarketTicker />

      <section className="calculator-section" id="calculator">
        <Calculator />
      </section>

      <section className="about-section">
        <h2 style={{ color: 'var(--primary-green)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1.8rem' }}>Calculadora do Arrependimento Bitcoin – Descubra Quanto Você Teria Lucrado</h2>

        <p style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
          A <strong>Calculadora do Arrependimento Bitcoin</strong> é uma ferramenta desenvolvida para ajudar você a descobrir quanto dinheiro teria hoje se tivesse comprado Bitcoin no passado.
          Com base no preço histórico do Bitcoin, ela permite visualizar o custo de oportunidade de não ter começado a investir antes — algo extremamente útil para investidores, iniciantes e entusiastas que desejam entender o desempenho real do BTC ao longo dos anos.
        </p>

        <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
          Devido à volatilidade do Bitcoin, muitas oportunidades surgem ao longo do tempo. Por isso, esta calculadora funciona como um recurso rápido e preciso para analisar a valorização do BTC desde uma data específica até o preço atual.
        </p>

        <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>Como funciona a Calculadora do Arrependimento Bitcoin</h3>
        <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          <li><strong>Insira o valor investido:</strong> Digite quanto você teria aplicado em Bitcoin (BRL, USD e EUR).</li>
          <li><strong>Selecione a data do investimento:</strong> Escolha o dia exato em que o investimento hipotético teria sido realizado.</li>
          <li><strong>Personalize a moeda:</strong> Para brasileiros no exterior, é possível visualizar valores em diferentes moedas.</li>
          <li><strong>Clique em “Calcular Resultado”:</strong> A ferramenta pesquisa o preço histórico do Bitcoin, calcula quantos BTC teriam sido comprados, e compara com o preço atual do Bitcoin.</li>
        </ul>

        <p style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>O resultado mostra:</p>
        <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          <li>Lucro ou prejuízo potencial;</li>
          <li>Quantidade de Bitcoin adquirida na época;</li>
          <li>Valor atualizado desse Bitcoin hoje.</li>
        </ul>

        <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
          Essa análise é ideal para quem busca entender o real impacto financeiro de um investimento passado em Bitcoin e avaliar como o BTC se comportou ao longo do tempo.
        </p>

        <h3 style={{ color: 'var(--bitcoin-orange)', marginBottom: '0.8rem', fontSize: '1.4rem' }}>Por que usar uma Calculadora de Custo de Oportunidade em Bitcoin?</h3>
        <ul style={{ marginLeft: '20px', listStyleType: 'disc', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          <li>Para descobrir quanto você teria hoje se tivesse comprado Bitcoin anos atrás.</li>
          <li>Para visualizar de forma clara a valorização histórica do Bitcoin.</li>
          <li>Para entender se comprar Bitcoin mais cedo teria sido mais lucrativo.</li>
          <li>Para educar novos investidores sobre a importância da constância e do longo prazo no mercado de criptomoedas.</li>
        </ul>

        <p style={{ marginBottom: '2rem', color: 'var(--text-main)' }}>
          Ferramentas assim ajudam a reduzir arrependimentos futuros e a entender melhor as dinâmicas de preço do principal ativo digital do mundo.
        </p>

        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--text-secondary)' }}>
          <h4 style={{ color: 'var(--text-main)', marginTop: 0, marginBottom: '0.5rem' }}>Disclaimer (Aviso Legal)</h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            As informações apresentadas nesta página são educacionais e podem conter variações ou imprecisões históricas.
            Esta ferramenta não constitui recomendação de investimento, análise financeira ou garantia de resultados.
            Antes de investir em Bitcoin ou qualquer outro ativo, faça sua própria pesquisa (DYOR) e consulte profissionais especializados, se necessário.
          </p>
        </div>
      </section>
    </main>
  );
}
