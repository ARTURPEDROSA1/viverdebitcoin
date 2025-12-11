import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import type { Metadata } from 'next';

import { translations } from '@/data/translations';

export const metadata: Metadata = {
    title: translations['es']['home.title'],
    description: translations['es']['home.subtitle'],
    alternates: {
        canonical: 'https://viverdebitcoin.com/es',
        languages: {
            'pt-BR': 'https://viverdebitcoin.com',
            'en-US': 'https://viverdebitcoin.com/en',
            'es-ES': 'https://viverdebitcoin.com/es',
            'x-default': 'https://viverdebitcoin.com',
        },
    },
};

export default function EsHomePage() {
    return <PageRenderer id="home" />;
}
