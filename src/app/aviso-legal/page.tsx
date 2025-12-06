
export const metadata = {
    title: 'Aviso Legal - Viver de Bitcoin',
    description: 'Aviso legal e termos de uso do site Viver de Bitcoin.',
};

export default function AvisoLegalPage() {
    return (
        <main className="about-section">
            <div className="about-content">
                <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Aviso Legal (Disclaimer)</h1>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Aviso Legal — Viver de Bitcoin</h3>

                <p>O conteúdo disponibilizado no site ViverDeBitcoin.com tem caráter educacional e informativo. Nada do que publicamos deve ser interpretado como recomendação de investimento, consultoria financeira, contábil, jurídica ou fiscal.</p>

                <p>Bitcoin é um ativo volátil e envolve riscos. Cada usuário é responsável por realizar suas próprias análises antes de tomar qualquer decisão financeira.</p>

                <p>O Viver de Bitcoin não garante resultados, não promete retornos e não se responsabiliza por perdas decorrentes do uso das informações, calculadoras ou ferramentas disponibilizadas no site.</p>

                <p>Eventuais referências a empresas, produtos, serviços, exchanges, carteiras ou plataformas não representam endosso ou recomendação.</p>

                <div style={{ background: 'rgba(231, 76, 60, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid #e74c3c' }}>
                    <p style={{ fontWeight: 'bold' }}>Ao utilizar o site, você concorda que faz isso por sua conta e risco.</p>
                </div>
            </div>
        </main>
    );
}
