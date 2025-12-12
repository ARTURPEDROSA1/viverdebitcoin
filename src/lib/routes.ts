export type PageId =
    | 'home'
    | 'sats-calculator'
    | 'dca-calculator'
    | 'regret-calculator'
    | 'fixed-income'
    | 'sats-converter'
    | 'about'
    | 'disclaimer'
    | 'terms'
    | 'privacy'
    | 'cookies'
    | 'affiliate'
    | 'contact'
    | 'btc-converter';

export const routeMap: Record<string, Record<PageId, string>> = {
    en: {
        'home': '',
        'sats-calculator': 'sats-calculator',
        'dca-calculator': 'dca-calculator',
        'regret-calculator': 'regret-calculator',
        'fixed-income': 'bitcoin-fixed-income',
        'sats-converter': 'sats-converter',
        'btc-converter': 'btc-converter',
        'about': 'about',
        'disclaimer': 'disclaimer',
        'terms': 'terms-of-use',
        'privacy': 'privacy-policy',
        'cookies': 'cookie-policy',
        'affiliate': 'affiliate-disclosure',
        'contact': 'contact'
    },
    es: {
        'home': '',
        'sats-calculator': 'calculadora-sats',
        'dca-calculator': 'calculadora-dca',
        'regret-calculator': 'calculadora-arrepentimiento',
        'fixed-income': 'ingreso-fijo-btc',
        'sats-converter': 'conversor-sats',
        'btc-converter': 'conversor-btc',
        'about': 'sobre',
        'disclaimer': 'aviso-legal',
        'terms': 'terminos-de-uso',
        'privacy': 'politica-de-privacidad',
        'cookies': 'politica-de-cookies',
        'affiliate': 'divulgacion-afiliados',
        'contact': 'contacto'
    },
    pt: {
        'home': '',
        'sats-calculator': 'calculadora-sats',
        'dca-calculator': 'calculadora-dca',
        'regret-calculator': 'calculadora-arrependimento',
        'fixed-income': 'renda-fixa-btc',
        'sats-converter': 'conversor-sats',
        'btc-converter': 'conversor-btc',
        'about': 'sobre',
        'disclaimer': 'aviso-legal',
        'terms': 'termos-de-uso',
        'privacy': 'politica-de-privacidade',
        'cookies': 'politica-de-cookies',
        'affiliate': 'disclosure-afiliados',
        'contact': 'contato'
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
