export type Language = 'pt' | 'en' | 'es';

export type PageId =
    | 'home'
    | 'sats-calculator'
    | 'dca-calculator'
    | 'regret-calculator'
    | 'fixed-income'
    | 'sats-converter'
    | 'btc-converter'
    | 'heatmap'
    | 'about'
    | 'disclaimer'
    | 'terms'
    | 'privacy'
    | 'cookies'
    | 'affiliate'
    | 'minimum-wage';

export const routeMap: Record<Language, Record<PageId, string>> = {
    pt: {
        home: '',
        'sats-calculator': 'calculadora-sats',
        'dca-calculator': 'calculadora-dca',
        'regret-calculator': 'calculadora-arrependimento',
        'fixed-income': 'renda-fixa-btc',
        'sats-converter': 'conversor-sats',
        'btc-converter': 'conversor-btc',
        'heatmap': 'mapa-calor-bitcoin',
        'about': 'sobre',
        'disclaimer': 'aviso-legal',
        'terms': 'termos-uso',
        'privacy': 'politica-privacidade',
        'cookies': 'politica-cookies',
        'affiliate': 'divulgacao-afiliados',
        'minimum-wage': 'bitcoin-vs-salario-minimo',
    },
    en: {
        home: '',
        'sats-calculator': 'sats-calculator',
        'dca-calculator': 'dca-calculator',
        'regret-calculator': 'regret-calculator',
        'fixed-income': 'fixed-income-btc',
        'sats-converter': 'sats-converter',
        'btc-converter': 'btc-converter',
        'heatmap': 'bitcoin-heatmap',
        'about': 'about',
        'disclaimer': 'disclaimer',
        'terms': 'terms-of-use',
        'privacy': 'privacy-policy',
        'cookies': 'cookies-policy',
        'affiliate': 'affiliate-disclosure',
        'minimum-wage': 'bitcoin-vs-minimum-wage',
    },
    es: {
        home: '',
        'sats-calculator': 'calculadora-sats',
        'dca-calculator': 'calculadora-dca',
        'regret-calculator': 'calculadora-arrepentimiento',
        'fixed-income': 'renta-fija-btc',
        'sats-converter': 'conversor-sats',
        'btc-converter': 'conversor-btc',
        'heatmap': 'mapa-calor-bitcoin',
        'about': 'acerca-de',
        'disclaimer': 'aviso-legal',
        'terms': 'terminos-de-uso',
        'privacy': 'politica-privacidad',
        'cookies': 'politica-cookies',
        'affiliate': 'divulgacion-afiliados',
        'minimum-wage': 'bitcoin-vs-salario-minimo',
    }
};

export function getPageIdFromSlug(lang: string, slug: string): PageId | null {
    const map = routeMap[lang as keyof typeof routeMap];
    if (!map) return null;

    for (const [id, path] of Object.entries(map)) {
        if (path === slug) return id as PageId;
    }
    return null;
}

export function getPath(lang: string, pageId: PageId): string {
    const map = routeMap[lang as keyof typeof routeMap];
    if (!map) return '/'; // Default to root if invalid lang

    const slug = map[pageId];

    // PT is root, others are prefixed
    if (lang === 'pt') {
        return slug ? `/${slug}` : '/';
    }

    return slug ? `/${lang}/${slug}` : `/${lang}`;
}
