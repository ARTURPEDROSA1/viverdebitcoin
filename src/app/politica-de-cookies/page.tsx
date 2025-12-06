
export const metadata = {
    title: 'Política de Cookies - Viver de Bitcoin',
    description: 'Política de cookies do site Viver de Bitcoin.',
};

export default function PoliticaCookiesPage() {
    return (
        <main className="about-section">
            <div className="about-content">
                <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Política de Cookies</h1>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Política de Cookies — Viver de Bitcoin</h3>

                <p>Utilizamos cookies para:</p>
                <ul style={{ margin: '1rem 0 1rem 20px', listStyleType: 'disc', lineHeight: '1.6' }}>
                    <li>medir tráfego e comportamento no site</li>
                    <li>lembrar preferências</li>
                    <li>melhorar experiência de navegação</li>
                </ul>

                <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid var(--primary-green)' }}>
                    <p>Você pode remover ou bloquear cookies no seu navegador a qualquer momento.</p>
                </div>
            </div>
        </main>
    );
}
