import type { MetadataRoute } from 'next';
import { routeMap } from '@/lib/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://viverdebitcoin.com/en';
    const pages: MetadataRoute.Sitemap = [];
    const lang = 'en';

    // Root of EN
    pages.push({
        url: `${baseUrl}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
    });

    // Subpages
    const map = routeMap[lang as keyof typeof routeMap];
    if (map) {
        for (const slug of Object.values(map)) {
            if (slug && slug !== '') {
                pages.push({
                    url: `${baseUrl}/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly',
                    priority: 0.9,
                });
            }
        }
    }

    return pages;
}
