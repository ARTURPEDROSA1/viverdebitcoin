import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/PageRenderer';
import type { Metadata } from 'next';

import { translations } from '@/data/translations';

export const metadata: Metadata = {
    title: translations['en']['home.title'],
    description: translations['en']['home.subtitle'],
    alternates: {
        canonical: 'https://viverdebitcoin.com/en',
        languages: {
            'pt-BR': 'https://viverdebitcoin.com',
            'en-US': 'https://viverdebitcoin.com/en',
            'es-ES': 'https://viverdebitcoin.com/es',
            'x-default': 'https://viverdebitcoin.com',
        },
    },
};

export default function EnHomePage() {
    return <PageRenderer id="home" />;
}
