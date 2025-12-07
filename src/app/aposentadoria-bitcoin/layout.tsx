
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculadora de Aposentadoria Bitcoin | Simule seu Futuro (FIRE)',
    description: 'Planeje sua independência financeira com Bitcoin. Simule cenários Base, Bull e Bear, ajuste inflação e estratégias de saque para viver de renda.',
    keywords: ['bitcoin', 'aposentadoria', 'fire', 'calculadora', 'btc', 'investimento', 'longo prazo', 'hold', 'custódia', 'viver de bitcoin'],
    openGraph: {
        title: 'Calculadora de Aposentadoria Bitcoin | Viver de Bitcoin',
        description: 'Quantos BTC você precisa para se aposentar? Faça simulações detalhadas com nossa calculadora de cenários macro.',
        url: 'https://viverdebitcoin.com/aposentadoria-bitcoin',
        siteName: 'Viver de Bitcoin',
        locale: 'pt_BR',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Calculadora de Aposentadoria Bitcoin (FIRE)',
        description: 'Simule seu futuro com Bitcoin. Trajetórias de preço, inflação e estratégias de saque.',
    },
    alternates: {
        canonical: 'https://viverdebitcoin.com/aposentadoria-bitcoin',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
