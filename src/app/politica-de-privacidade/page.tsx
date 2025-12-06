
export const metadata = {
    title: 'Política de Privacidade - Viver de Bitcoin',
    description: 'Política de privacidade e tratamento de dados (LGPD) do site Viver de Bitcoin.',
};

export default function PoliticaPrivacidadePage() {
    return (
        <main className="about-section">
            <div className="about-content">
                <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Política de Privacidade (LGPD)</h1>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Política de Privacidade — Viver de Bitcoin</h3>

                <p>Esta política explica como tratamos dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).</p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>1. Quais dados coletamos?</h4>
                <p>Coletamos:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>dados técnicos (IP, tipo de navegador, dispositivo)</li>
                    <li>métricas de uso do site (Google Analytics ou similar)</li>
                    <li>informações fornecidas voluntariamente (ex.: newsletter)</li>
                </ul>
                <p>Não coletamos dados sensíveis.<br />
                    Não vendemos dados.</p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>2. Finalidade do tratamento</h4>
                <p>Usamos os dados para:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>melhorar a experiência no site</li>
                    <li>garantir segurança e performance</li>
                    <li>enviar conteúdos caso você opte por receber</li>
                </ul>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>3. Cookies</h4>
                <p>Utilizamos cookies para analytics e funcionalidade. Você pode desativar no navegador.</p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>4. Direitos do titular (LGPD)</h4>
                <p>Você pode:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>solicitar acesso aos seus dados</li>
                    <li>pedir exclusão</li>
                    <li>pedir correção</li>
                    <li>retirar consentimento</li>
                </ul>
                <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem', borderLeft: '4px solid var(--primary-green)' }}>
                    <p>Basta enviar um e-mail para: <a href="mailto:contato@viverdebitcoin.com" style={{ color: 'var(--bitcoin-orange)' }}>contato@viverdebitcoin.com</a></p>
                </div>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>5. Armazenamento e Segurança</h4>
                <p>Empregamos medidas técnicas adequadas e armazenamos dados apenas pelo tempo necessário.</p>

            </div>
        </main>
    );
}
