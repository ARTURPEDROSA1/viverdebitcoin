export default function Footer() {
    return (
        <footer>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <p>&copy; {new Date().getFullYear()} Viver de Bitcoin. Todos os direitos reservados.</p>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href="/aviso-legal" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Aviso Legal</a>
                    <a href="/termos-de-uso" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Termos de Uso</a>
                    <a href="/politica-de-privacidade" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Política de Privacidade</a>
                    <a href="/politica-de-cookies" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Política de Cookies</a>
                    <a href="/disclosure-afiliados" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Disclosure</a>
                </div>
            </div>
        </footer>
    );
}
