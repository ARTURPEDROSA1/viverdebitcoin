
export const metadata = {
    title: 'Termos de Uso - Viver de Bitcoin',
    description: 'Termos de uso e condições do site Viver de Bitcoin.',
};

export default function TermosUsoPage() {
    return (
        <main className="about-section">
            <div className="about-content">
                <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Termos de Uso</h1>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Termos de Uso — Viver de Bitcoin</h3>

                <p>Bem-vindo ao ViverDeBitcoin.com. Ao acessar este site, você concorda com os termos descritos abaixo:</p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>1. Uso Permitido</h4>
                <p>Você pode utilizar este site para fins pessoais, educacionais e informativos.<br />
                    É proibido:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>copiar ou reproduzir ferramentas de forma indevida</li>
                    <li>realizar engenharia reversa de códigos ou funcionalidades</li>
                    <li>usar o site para fins ilícitos</li>
                    <li>comprometer a segurança, integridade ou disponibilidade da plataforma</li>
                </ul>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>2. Propriedade Intelectual</h4>
                <p>Todo o conteúdo, incluindo textos, gráficos, ferramentas, cálculos, design e códigos, pertence ao Viver de Bitcoin, salvo quando indicado o contrário.<br />
                    É permitida a reprodução parcial desde que citada a fonte com link.</p>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>3. Limitação de Responsabilidade</h4>
                <p>Não somos responsáveis por:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>erros em dados provenientes de terceiros</li>
                    <li>perdas financeiras decorrentes de uso incorreto de ferramentas</li>
                    <li>interrupções temporárias ou permanentes do serviço</li>
                </ul>

                <h4 style={{ marginTop: '1.5rem', marginBottom: '0.5rem', color: 'var(--bitcoin-orange)' }}>4. Alterações</h4>
                <p>Os Termos podem ser atualizados a qualquer momento, sem aviso prévio.</p>

            </div>
        </main>
    );
}
