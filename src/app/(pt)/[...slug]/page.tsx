import { notFound } from 'next/navigation';
import { getPageIdFromSlug, routeMap, PageId, getPath } from '@/lib/routes';
import { PageRenderer } from '@/components/PageRenderer';
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

    return {
        alternates: {
            canonical: `${baseUrl}${ptPath}`,
            languages: {
                'pt-BR': `${baseUrl}${ptPath}`,
                'en-US': `${baseUrl}${enPath}`,
                'es-ES': `${baseUrl}${esPath}`,
                'x-default': `${baseUrl}${ptPath}`,
            },
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

    return <PageRenderer id={pageId} />;
}
