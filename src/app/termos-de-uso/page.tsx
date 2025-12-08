import { Metadata } from 'next';
import TermosDeUso from '@/components/TermosDeUso';

export const metadata: Metadata = {
    title: 'Termos de Uso - Viver de Bitcoin',
    description: 'Termos de uso e condições do site Viver de Bitcoin.',
};

export default function TermosUsoPage() {
    return (
        <main className="about-section">
            <TermosDeUso />
        </main>
    );
}
