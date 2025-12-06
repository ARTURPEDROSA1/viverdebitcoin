
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculadora de Aposentadoria Bitcoin (Macro) - Viver de Bitcoin',
    description: 'Simule sua aposentadoria em Bitcoin considerando cenários macroeconômicos (Bull, Bear, Base), inflação e eventos do mercado.',
    keywords: ['aposentadoria bitcoin', 'calculadora macro bitcoin', 'projeção bitcoin', 'bull bear base bitcoin', 'fire bitcoin'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
