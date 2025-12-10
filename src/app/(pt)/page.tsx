import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    alternates: {
        canonical: 'https://viverdebitcoin.com',
        languages: {
            'pt-BR': 'https://viverdebitcoin.com',
            'en-US': 'https://viverdebitcoin.com/en',
            'es-ES': 'https://viverdebitcoin.com/es',
            'x-default': 'https://viverdebitcoin.com',
        },
    },
};

export default function PtHomePage() {
    return <PageRenderer id="home" />;
}
