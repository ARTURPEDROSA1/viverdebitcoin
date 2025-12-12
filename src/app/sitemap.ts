import type { MetadataRoute } from 'next';
import { routeMap } from '@/lib/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://viverdebitcoin.com';
    const pages: MetadataRoute.Sitemap = [];
    const lang = 'pt';

    // Root (PT handled as default root)
    pages.push({
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
    });

    // Subpages
    // Generate URLs for all languages
    const languages = ['pt', 'en', 'es'] as const;

    for (const lang of languages) {
        const map = routeMap[lang];
        if (map) {
            for (const [id, slug] of Object.entries(map)) {
                // Determine full URL based on language
                let fullUrl = baseUrl;
                if (lang === 'en') fullUrl += '/en';
                else if (lang === 'es') fullUrl += '/es';

                if (slug && slug !== '') {
                    fullUrl += `/${slug}`;
                }

                pages.push({
                    url: fullUrl,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: id === 'home' ? 1.0 : 0.9,
                });
            }
        }
    }

    return pages;
}
