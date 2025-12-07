import SatsConverter from '@/components/SatsConverter';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Conversor de Satoshis (Sats) | Viver de Bitcoin',
    description: 'Converta Real, Dólar ou Euro para Satoshis (Sats) instantaneamente com nossa calculadora simples.',
};

export default function SatsConverterPage() {
    return (
        <main style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem 1rem' }}>
            <SatsConverter />
        </main>
    );
}
