
export const metadata = {
    title: 'Disclosure de Afiliados - Viver de Bitcoin',
    description: 'Transparência sobre links de afiliados no Viver de Bitcoin.',
};

export default function DisclosurePage() {
    return (
        <main className="about-section">
            <div className="about-content">
                <h1 style={{ color: 'var(--primary-green)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Disclosure de Afiliados</h1>

                <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Disclosure — Transparência</h3>

                <p>O site ViverDeBitcoin.com pode utilizar links de afiliados para produtos, serviços ou exchanges.</p>
                <p>Isso não altera o preço para o usuário e ajuda a manter o projeto funcionando.</p>

                <div style={{ background: 'rgba(39, 174, 96, 0.1)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', borderLeft: '4px solid var(--primary-green)' }}>
                    <p style={{ fontWeight: 'bold' }}>Recomendamos somente ferramentas que acreditamos ser úteis.</p>
                </div>
            </div>
        </main>
    );
}
