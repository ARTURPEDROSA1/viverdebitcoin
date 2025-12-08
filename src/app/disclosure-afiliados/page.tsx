import { Metadata } from 'next';
import DisclosureComponent from '@/components/Disclosure';

export const metadata: Metadata = {
    title: 'Disclosure de Afiliados - Viver de Bitcoin',
    description: 'Transparência sobre links de afiliados no Viver de Bitcoin.',
};

export default function DisclosurePage() {
    return (
        <main className="about-section">
            <DisclosureComponent />
        </main>
    );
}
