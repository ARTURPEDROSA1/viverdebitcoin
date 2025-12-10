import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: [
            'https://viverdebitcoin.com/sitemap.xml',
            'https://viverdebitcoin.com/en/sitemap.xml',
            'https://viverdebitcoin.com/es/sitemap.xml',
        ],
    }
}
