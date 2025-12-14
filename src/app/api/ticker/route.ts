import { NextResponse } from 'next/server';

import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

export async function GET() {
    try {
        const [hgRes, sp500] = await Promise.all([
            fetch('https://api.hgbrasil.com/finance', {
                next: { revalidate: 60 }
            }),
            yahooFinance.quote('^GSPC').catch((e: unknown) => {
                console.error('Yahoo Finance Error:', e);
                return null;
            })
        ]);

        const hgData = hgRes.ok ? await hgRes.json() : null;

        return NextResponse.json({
            hgBrasil: hgData,
            sp500: sp500 ? {
                price: sp500.regularMarketPrice,
                change: sp500.regularMarketChangePercent
            } : null
        });
    } catch (error) {
        console.error('Error fetching ticker data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
