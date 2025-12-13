import { notFound } from 'next/navigation';
import { getPageIdFromSlug, routeMap, getPath } from '@/lib/routes';
import { PageRenderer } from '@/components/PageRenderer';
import type { Metadata } from 'next';

export async function generateStaticParams() {
    const map = routeMap['en'];
    if (!map) return [];

    const paths = [];
    for (const [id, path] of Object.entries(map)) {
        if (path && path !== '') {
            paths.push({ slug: path.split('/') });
        }
    }
    return paths;
}

import { translations } from '@/data/translations';

// ... (keep generateStaticParams)

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const slugString = slug.join('/');
    const pageId = getPageIdFromSlug('en', slugString);

    if (!pageId) return {};

    const ptPath = getPath('pt', pageId);
    const enPath = getPath('en', pageId);
    const esPath = getPath('es', pageId);
    const baseUrl = 'https://viverdebitcoin.com';

    const t = translations['en'];
    let title = t['home.title'];
    let description = t['home.subtitle'];

    switch (pageId) {
        case 'home':
            title = t['home.title'];
            description = t['home.subtitle'];
            break;
        case 'sats-calculator':
            title = t['sats.title'] || t['nav.aposentadoria_sats'];
            description = t['sats.subtitle'] || description;
            break;
        case 'dca-calculator':
            title = t['dca.title'];
            description = t['dca.subtitle'];
            break;
        case 'regret-calculator':
            title = t['roi.title'];
            description = t['roi.subtitle'];
            break;
        case 'fixed-income':
            title = t['rf.title'];
            description = t['rf.subtitle'];
            break;
        case 'sats-converter':
            title = t['converter.title'];
            description = t['converter.subtitle'];
            break;
        case 'btc-converter':
            title = t['btc_conv.title'];
            description = t['btc_conv.subtitle'];
            break;
        case 'about':
            title = t['about.hero_title'];
            description = t['about.sec1_p1'];
            break;
        case 'disclaimer':
            title = t['legal.title'];
            description = t['legal.subtitle'];
            break;
        case 'terms':
            title = t['terms.title'];
            description = t['terms.subtitle'];
            break;
        case 'privacy':
            title = t['privacy.title'];
            description = t['privacy.subtitle'];
            break;
        case 'cookies':
            title = t['cookies.title'];
            description = t['cookies.subtitle'];
            break;
        case 'affiliate':
            title = t['aff.title'];
            description = t['aff.subtitle'];
            break;
        case 'heatmap':
            title = t['heatmap.title'];
            description = t['heatmap.subtitle'];
            break;
        case 'minimum-wage':
            title = t['min_wage.title'];
            description = t['min_wage.subtitle'];
            break;
    }

    const baseKeywords = ['bitcoin', 'calculator', 'sats', 'converter', 'investment', 'retirement', 'fire', 'cryptocurrency', 'living on bitcoin'];

    const pageKeywords: Record<string, string[]> = {
        'sats-calculator': ['satoshi', 'satoshi price', 'how much is 1 satoshi', 'invest in bitcoin', 'micro investing'],
        'dca-calculator': ['btc dca', 'dollar cost averaging', 'recurring buy', 'stacking sats'],
        'regret-calculator': ['bitcoin roi', 'bitcoin profit', 'historic bitcoin price', 'bitcoin regret', 'if i bought bitcoin'],
        'fixed-income': ['bitcoin fixed income', 'bitcoin dividends', 'strc', 'strategy', 'passive income usd'],
        'sats-converter': ['convert sats', 'sats to usd', 'satoshi calculator', '1000 sats to usd'],
        'btc-converter': ['bitcoin converter', 'btc to usd', 'btc to eur', 'bitcoin price today'],
        'heatmap': ['bitcoin heatmap', 'bitcoin cycles', 'bitcoin halving', 'bull run', 'bear market', '4 year cycle'],
        'about': ['what is bitcoin', 'satoshi nakamoto', 'bitcoin history', 'how bitcoin works'],
        'minimum-wage': ['bitcoin vs minimum wage', 'purchasing power', 'work effort', 'real inflation', 'bitcoin affordability', 'labor value'],
    };

    const specificKeywords = pageKeywords[pageId] || [];
    const keywords = [...baseKeywords, ...specificKeywords];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${baseUrl}${enPath}`,
            languages: {
                'pt-BR': `${baseUrl}${ptPath}`,
                'en-US': `${baseUrl}${enPath}`,
                'es-ES': `${baseUrl}${esPath}`,
                'x-default': `${baseUrl}${ptPath}`,
            },
        },
        openGraph: {
            title,
            description,
            url: `${baseUrl}${enPath}`,
            locale: 'en_US',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function EnPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const slugString = slug.join('/');
    const pageId = getPageIdFromSlug('en', slugString);

    if (!pageId) {
        return notFound();
    }

    return <PageRenderer id={pageId} locale="en" />;
}
