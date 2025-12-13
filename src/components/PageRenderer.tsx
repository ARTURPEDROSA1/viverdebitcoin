
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
    let jsonLdData: any = null;
    const baseUrl = 'https://viverdebitcoin.com';
    const path = locale === 'pt' ? '' : `/${locale}`;

    if (id === 'btc-converter' || id === 'sats-converter' || id === 'heatmap') {
        jsonLdData = {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": id === 'heatmap' ? t['heatmap.title'] : (id === 'btc-converter' ? t['btc_conv.title'] : t['converter.title']),
            "url": `${baseUrl}${path}/${id === 'heatmap' ? (locale === 'pt' || locale === 'es' ? 'mapa-calor-bitcoin' : 'bitcoin-heatmap') : (id === 'btc-converter' ? 'conversor-btc' : 'conversor-sats')}`,
            "description": id === 'heatmap' ? t['heatmap.subtitle'] : (id === 'btc-converter' ? t['btc_conv.subtitle'] : t['converter.subtitle']),
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Any"
        };
    } else if (id === 'sats-calculator' || id === 'dca-calculator' || id === 'regret-calculator' || id === 'fixed-income' || id === 'home') {
        jsonLdData = {
            "@context": "https://schema.org",
            "@type": "FinancialProduct",
            "name": id === 'home' ? t['home.title'] : (id === 'dca-calculator' ? t['dca.title'] : (id === 'regret-calculator' ? t['roi.title'] : t['rf.title'])),
            "description": id === 'home' ? t['home.subtitle'] : t['dca.subtitle'],
            "brand": {
                "@type": "Brand",
                "name": "Viver de Bitcoin"
            }
        };
    }

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
            return <AboutContent />;

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
                    {/* JSON-LD can be added later if needed */}
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
