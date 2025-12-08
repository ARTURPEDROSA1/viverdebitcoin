import { Metadata } from 'next';
import AvisoLegal from '@/components/AvisoLegal';

export const metadata: Metadata = {
    title: 'Aviso Legal - Viver de Bitcoin',
    description: 'Aviso legal e termos de uso do site Viver de Bitcoin.',
};

export default function AvisoLegalPage() {
    return (
        <main className="about-section">
            <AvisoLegal />
        </main>
    );
}
