import { Metadata } from 'next';
import PoliticaPrivacidade from '@/components/PoliticaPrivacidade';

export const metadata: Metadata = {
    title: 'Política de Privacidade - Viver de Bitcoin',
    description: 'Política de privacidade e tratamento de dados (LGPD) do site Viver de Bitcoin.',
};

export default function PoliticaPrivacidadePage() {
    return (
        <main className="about-section">
            <PoliticaPrivacidade />
        </main>
    );
}
