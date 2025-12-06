import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculadora de Aposentadoria em Satoshis - Viver de Bitcoin',
    description: 'Projete sua liberdade financeira com Bitcoin. Calcule quanto você precisa acumular em Satoshis para se aposentar.',
    keywords: ['aposentadoria bitcoin', 'calculadora satoshis', 'acumular bitcoin', 'fire bitcoin', 'viver de renda bitcoin'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
