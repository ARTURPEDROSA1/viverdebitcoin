import { notFound } from 'next/navigation';
import { getPageIdFromSlug, routeMap, PageId, getPath } from '@/lib/routes';
import { PageRenderer } from '@/components/PageRenderer';
import { translations } from '@/data/translations';
import type { Metadata } from 'next';

// Generate params for PT pages only
export async function generateStaticParams() {
    const map = routeMap['pt'];
    if (!map) return [];

    const paths = [];
    for (const [id, path] of Object.entries(map)) {
        if (path && path !== '') {
            paths.push({ slug: path.split('/') });
        }
    }
    return paths;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
    const { slug } = await params;
    const slugString = slug.join('/');
    const pageId = getPageIdFromSlug('pt', slugString);

    if (!pageId) return {};

    const ptPath = getPath('pt', pageId);
    const enPath = getPath('en', pageId);
    const esPath = getPath('es', pageId);
    const baseUrl = 'https://viverdebitcoin.com';

    const t = translations['pt'];
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
        case 'heatmap':
            title = t['heatmap.title'];
            description = t['heatmap.subtitle'];
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
        case 'minimum-wage':
            title = t['min_wage.title'];
            description = t['min_wage.subtitle'];
            break;
        case 'modelo-bitcoin24':
            title = t['modelo24.title'];
            description = t['modelo24.subtitle'];
            break;
    }

    const baseKeywords = ['bitcoin', 'calculadora', 'sats', 'conversor', 'investimento', 'aposentadoria', 'fire', 'criptomoedas', 'viver de bitcoin'];

    const pageKeywords: Record<string, string[]> = {
        'sats-calculator': ['satoshi', 'preco satoshi', 'quanto vale 1 satoshi', 'investir em bitcoin', 'pequenos aportes'],
        'dca-calculator': ['dca bitcoin', 'dollar cost averaging', 'aporte recorrente', 'comprar bitcoin todo mes'],
        'regret-calculator': ['roi bitcoin', 'lucro bitcoin', 'historico preco bitcoin', 'arrependimento bitcoin', 'se eu tivesse comprado bitcoin'],
        'fixed-income': ['renda fixa bitcoin', 'dividendos bitcoin', 'strc', 'strategy', 'renda passiva em dolar'],
        'sats-converter': ['converter sats', 'sats para real', 'calculadora satoshi', '1000 sats em reais'],
        'btc-converter': ['conversor bitcoin', 'btc para brl', 'btc para usd', 'cotacao bitcoin hoje'],
        'heatmap': ['mapa de calor bitcoin', 'ciclos do bitcoin', 'halving bitcoin', 'bull run', 'bear market', '4 anos bitcoin'],
        'about': ['o que é bitcoin', 'satoshi nakamoto', 'historia do bitcoin', 'como funciona bitcoin'],
        'minimum-wage': ['bitcoin vs salario minimo', 'poder de compra', 'inflacao real', 'salario minimo brasil', 'bitcoin hoje', 'custo de vida'],
        'modelo-bitcoin24': ['modelo bitcoin', 'ciclo bitcoin', 'previsão bitcoin', 'adoção bitcoin', 'bitcoin24', 'simulação bitcoin', 'power law bitcoin'],
    };

    const specificKeywords = pageKeywords[pageId] || [];
    const keywords = [...baseKeywords, ...specificKeywords];

    return {
        title,
        description,
        keywords,
        alternates: {
            canonical: `${baseUrl}${ptPath}`,
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
            url: `${baseUrl}${ptPath}`,
            locale: 'pt_BR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function PtPage({ params }: { params: Promise<{ slug: string[] }> }) {
    const { slug } = await params;
    const slugString = slug.join('/');
    // Check PT map
    const pageId = getPageIdFromSlug('pt', slugString);

    if (!pageId) {
        return notFound();
    }

    return <PageRenderer id={pageId} locale="pt" />;
}
