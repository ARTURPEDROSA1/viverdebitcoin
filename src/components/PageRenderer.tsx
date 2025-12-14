
import { notFound } from 'next/navigation';
import { PageId } from '@/lib/routes';

// Components
import DcaCalculator from '@/components/DcaCalculator';
import DcaAbout from '@/components/DcaAbout';
import SatoshiCalculator from '@/components/SatoshiCalculator';
import Calculator from '@/components/Calculator';
import CalculadoraArrependimentoAbout from '@/components/CalculadoraArrependimentoAbout';
import RendaFixaCalculator from '@/components/RendaFixaCalculator';
import StrcChart from '@/components/StrcChart';
import RendaFixaAbout from '@/components/RendaFixaAbout';
import SatsConverter from '@/components/SatsConverter';
import AboutContent from '@/components/AboutContent';
import BtcConverter from '@/components/BtcConverter';
import BitcoinHeatmap from '@/components/BitcoinHeatmap';
import AvisoLegal from '@/components/AvisoLegal';
import TermosDeUso from '@/components/TermosDeUso';
import PoliticaPrivacidade from '@/components/PoliticaPrivacidade';
import PoliticaCookies from '@/components/PoliticaCookies';
import Disclosure from '@/components/Disclosure';
import BitcoinRetirementCalculator from '@/components/BitcoinRetirementCalculator';
import BitcoinRetirementAbout from '@/components/BitcoinRetirementAbout';
import MinimumWageChart from '@/components/MinimumWageChart';

import JsonLd from '@/components/JsonLd';
import { translations } from '@/data/translations';

export function PageRenderer({ id, locale = 'pt' }: { id: PageId, locale?: string }) {
    const t = translations[locale as keyof typeof translations] || translations['pt'];

    // Generate specific JSON-LD based on page type
    let jsonLdData: any[] = [];
    const baseUrl = 'https://viverdebitcoin.com';
    const path = locale === 'pt' ? '' : `/${locale}`;

    let pageTitle = '';
    let pageDescription = '';
    let pagePath = '';

    // Helper to determine page info
    if (id === 'home') {
        pageTitle = t['home.title'];
        pageDescription = t['home.subtitle'];
        pagePath = '';
    } else if (id === 'btc-converter') {
        pageTitle = t['btc_conv.title'];
        pageDescription = t['btc_conv.subtitle'];
        pagePath = 'conversor-btc'; // Default to PT slug for mapping logic if needed, but simplified here
    } else if (id === 'sats-converter') {
        pageTitle = t['converter.title'];
        pageDescription = t['converter.subtitle'];
        pagePath = 'conversor-sats';
    } else if (id === 'heatmap') {
        pageTitle = t['heatmap.title'];
        pageDescription = t['heatmap.subtitle'];
        pagePath = 'mapa-calor-bitcoin';
    } else if (id === 'sats-calculator') {
        pageTitle = t['sats.title'] || t['nav.aposentadoria_sats'];
        pageDescription = t['sats.subtitle'];
        pagePath = 'calculadora-sats';
    } else if (id === 'dca-calculator') {
        pageTitle = t['dca.title'];
        pageDescription = t['dca.subtitle'];
        pagePath = 'calculadora-dca';
    } else if (id === 'regret-calculator') {
        pageTitle = t['roi.title'];
        pageDescription = t['roi.subtitle'];
        pagePath = 'calculadora-arrependimento';
    } else if (id === 'fixed-income') {
        pageTitle = t['rf.title'];
        pageDescription = t['rf.subtitle'];
        pagePath = 'renda-fixa-btc';
    } else if (id === 'minimum-wage') {
        pageTitle = t['min_wage.title'];
        pageDescription = t['min_wage.subtitle'];
        pagePath = 'bitcoin-vs-salario-minimo';
    } else if (id === 'about') {
        pageTitle = t['about.hero_title'];
        pageDescription = t['about.sec1_p1'];
        pagePath = 'sobre';
    }

    // Override path with correct localized slug if possible, or just use ID mapping logic
    // For simplicity, we can trust the routeMap logic elsewhere, but here we just need a valid URL for JSON-LD.
    // Ideally we import routeMap but let's just use the current URL structure we know.
    const getLocalizedSlug = (pid: PageId) => {
        // Simple mapping for JSON-LD URL construction
        // Accessing routeMap dynamically or duplicating essential slugs
        const map: Record<string, string> = {
            'home': '',
            'sats-calculator': locale === 'en' ? 'sats-calculator' : 'calculadora-sats',
            'dca-calculator': locale === 'en' ? 'dca-calculator' : 'calculadora-dca',
            'regret-calculator': locale === 'en' ? 'regret-calculator' : (locale === 'es' ? 'calculadora-arrepentimiento' : 'calculadora-arrependimento'),
            'fixed-income': locale === 'en' ? 'fixed-income-btc' : (locale === 'es' ? 'renta-fija-btc' : 'renda-fixa-btc'),
            'sats-converter': locale === 'en' ? 'sats-converter' : 'conversor-sats',
            'btc-converter': locale === 'en' ? 'btc-converter' : 'conversor-btc',
            'heatmap': locale === 'pt' || locale === 'es' ? 'mapa-calor-bitcoin' : 'bitcoin-heatmap',
            'minimum-wage': locale === 'pt' || locale === 'es' ? 'bitcoin-vs-salario-minimo' : 'bitcoin-vs-minimum-wage',
            'about': locale === 'pt' ? 'sobre' : (locale === 'es' ? 'acerca-de' : 'about'),
            'disclaimer': 'aviso-legal', // Simplified
            'terms': 'termos-uso',
            'privacy': 'politica-privacidade',
            'cookies': 'politica-cookies',
            'affiliate': 'divulgacao-afiliados'
        };
        return map[pid] || pid;
    };

    const currentSlug = getLocalizedSlug(id);
    const fullUrl = `${baseUrl}${path}${currentSlug ? '/' + currentSlug : ''}`;

    // 1. Main Entity Schema
    if (id === 'btc-converter' || id === 'sats-converter' || id === 'heatmap') {
        jsonLdData.push({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": pageTitle,
            "url": fullUrl,
            "description": pageDescription,
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any"
        });
    } else if (id === 'sats-calculator' || id === 'dca-calculator' || id === 'regret-calculator' || id === 'fixed-income' || id === 'home') {
        jsonLdData.push({
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": pageTitle,
            "description": pageDescription,
            "brand": {
                "@type": "Brand",
                "name": "Viver de Bitcoin"
            }
        });
    } else if (id === 'minimum-wage') {
        jsonLdData.push({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": pageTitle,
            "description": pageDescription,
            "author": {
                "@type": "Organization",
                "name": "Viver de Bitcoin"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Viver de Bitcoin",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://viverdebitcoin.com/ViverdeBitcoinfavicon.png"
                }
            }
        });
    } else if (id === 'about') {
        jsonLdData.push({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": pageTitle,
            "description": pageDescription,
            "mainEntity": {
                "@type": "Organization",
                "name": "Viver de Bitcoin",
                "url": "https://viverdebitcoin.com",
                "logo": "https://viverdebitcoin.com/ViverdeBitcoinfavicon.png"
            }
        });
    }

    // 2. Breadcrumb Schema
    const homeName = locale === 'pt' ? 'Início' : (locale === 'es' ? 'Inicio' : 'Home');
    const breadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": homeName,
                "item": `${baseUrl}${path}`
            }
        ]
    };

    if (id !== 'home') {
        breadcrumbList.itemListElement.push({
            "@type": "ListItem",
            "position": 2,
            "name": pageTitle,
            "item": fullUrl
        });
    }

    jsonLdData.push(breadcrumbList);

    switch (id) {
        case 'home':
            return (
                <main>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <BitcoinRetirementCalculator />
                    <BitcoinRetirementAbout />
                </main>
            );

        case 'about':
            return (
                <>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <AboutContent />
                </>
            );

        case 'dca-calculator':
            return (
                <main>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <section className="calculator-section" id="dca-calculator">
                        <DcaCalculator />
                    </section>
                    <DcaAbout />
                </main>
            );

        case 'sats-calculator':
            return (
                <>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <SatoshiCalculator />
                </>
            );

        case 'regret-calculator':
            return (
                <main>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <section className="calculator-section">
                        <Calculator />
                    </section>
                    <CalculadoraArrependimentoAbout />
                </main>
            );

        case 'fixed-income':
            return (
                <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-black">
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <div className="max-w-7xl mx-auto">
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <RendaFixaCalculator />
                        </div>
                        <StrcChart />
                        <RendaFixaAbout />
                    </div>
                </main>
            );

        case 'sats-converter':
            return (
                <main style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem 1rem' }}>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <SatsConverter />
                </main>
            );

        case 'btc-converter':
            return (
                <main style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem 1rem' }}>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <BtcConverter />
                </main>
            );

        case 'heatmap':
            return (
                <main style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem 1rem' }}>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <BitcoinHeatmap />
                </main>
            );

        case 'minimum-wage':
            return (
                <main style={{ minHeight: 'calc(100vh - 160px)', padding: '2rem 1rem' }}>
                    {jsonLdData && <JsonLd data={jsonLdData} />}
                    <MinimumWageChart />
                </main>
            );

        case 'disclaimer':
            return <main className="about-section"><AvisoLegal /></main>;

        case 'terms':
            return <main className="about-section"><TermosDeUso /></main>;

        case 'privacy':
            return <main className="about-section"><PoliticaPrivacidade /></main>;

        case 'cookies':
            return <main className="about-section"><PoliticaCookies /></main>;

        case 'affiliate':
            return <main className="about-section"><Disclosure /></main>;

        default:
            return notFound();
    }
}
