import { Metadata } from 'next';
import PoliticaCookies from '@/components/PoliticaCookies';

export const metadata: Metadata = {
    title: 'Política de Cookies - Viver de Bitcoin',
    description: 'Política de cookies do site Viver de Bitcoin.',
};

export default function PoliticaCookiesPage() {
    return (
        <main className="about-section">
            <PoliticaCookies />
        </main>
    );
}
