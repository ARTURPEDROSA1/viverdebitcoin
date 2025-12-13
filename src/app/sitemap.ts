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
    // Generate URLs for PT only (EN and ES have their own sitemaps)
    // 'lang' is already defined at the top
    const map = routeMap[lang];

    if (map) {
        for (const [id, slug] of Object.entries(map)) {
            // PT is root, so no prefix needed except for the slug
            let fullUrl = baseUrl;

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

    return pages;
}
