
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
import AvisoLegal from '@/components/AvisoLegal';
import TermosDeUso from '@/components/TermosDeUso';
import PoliticaPrivacidade from '@/components/PoliticaPrivacidade';
import PoliticaCookies from '@/components/PoliticaCookies';
import Disclosure from '@/components/Disclosure';
import BitcoinRetirementCalculator from '@/components/BitcoinRetirementCalculator';
import BitcoinRetirementAbout from '@/components/BitcoinRetirementAbout';

export function PageRenderer({ id }: { id: PageId }) {
    switch (id) {
        case 'home':
            return (
                <main>
                    <BitcoinRetirementCalculator />
                    <BitcoinRetirementAbout />
                </main>
            );

        case 'about':
            return <AboutContent />;

        case 'dca-calculator':
            return (
                <main>
                    <section className="calculator-section" id="dca-calculator">
                        <DcaCalculator />
                    </section>
                    <DcaAbout />
                </main>
            );

        case 'sats-calculator':
            return <SatoshiCalculator />;

        case 'regret-calculator':
            return (
                <main>
                    <section className="calculator-section">
                        <Calculator />
                    </section>
                    <CalculadoraArrependimentoAbout />
                </main>
            );

        case 'fixed-income':
            return (
                <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-black">
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
                    <SatsConverter />
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

        case 'contact':
            return (
                <main style={{ padding: '4rem 5%', textAlign: 'center', minHeight: '60vh' }}>
                    <h1 className="hero-title" style={{ fontSize: '2.5rem' }}>Contato / Contact</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Em breve / Coming soon</p>
                </main>
            );

        default:
            return notFound();
    }
}
