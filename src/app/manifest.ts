import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Viver de Bitcoin',
        short_name: 'ViverDeBitcoin',
        description: 'Planeje sua independência financeira com Bitcoin.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#F7931A',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
