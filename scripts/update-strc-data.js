const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_FILE = path.join(__dirname, '../src/data/strc-history.json');
const TICKER = 'STRC';

function fetchYahooData() {
    return new Promise((resolve, reject) => {
        // Fetch 5 years of daily data with dividends
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?symbol=${TICKER}&range=5y&interval=1d&events=div`;

        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    // Check if response is JSON
                    if (res.statusCode !== 200) {
                        reject(new Error(`API Error: ${res.statusCode} - ${data}`));
                        return;
                    }

                    const json = JSON.parse(data);
                    if (json.chart && json.chart.result) {
                        resolve(json.chart.result[0]);
                    } else {
                        reject(new Error('Invalid API response format'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => reject(err));
    });
}

async function main() {
    try {
        console.log(`Fetching data for ${TICKER}...`);
        const result = await fetchYahooData();

        const timestamps = result.timestamp || [];
        const quotes = result.indicators.quote[0];
        const dividends = result.events ? result.events.dividends : {}; // Object keyed by timestamp

        // Process data
        const processedData = [];
        let lastKnownDividend = 0.8958; // Default fallback 

        // Find initial dividend if any: get the one before the first timestamp? 
        // We can't know easily without wider history. We assume lastKnownDividend default.

        // Sort dividend timestamps numerically
        const dividendTimestamps = Object.keys(dividends).map(Number).sort((a, b) => a - b);

        timestamps.forEach((ts, index) => {
            const dateStr = new Date(ts * 1000).toISOString().split('T')[0];
            const close = quotes.close[index];

            if (close !== null && close !== undefined) {
                // Check if a dividend happened "recently" or on this day.
                // We want the "Current Annual Dividend Rate" or "Current Monthly Payout".
                // In this model, we assign the `dividend` field the value of the LATEST payout known at this time.

                // Find the latest dividend timestamp <= current ts
                // Since we iterate in order, we can maintain state.

                // Check if the current ts (or close to it) is a dividend date
                // Dividends in Yahoo are usually ex-dates or pay-dates.
                // We just want to capture the "state" of the dividend.

                // Find the last dividend event <= ts
                let currentDivVal = lastKnownDividend;

                // Optimization: track index in dividendTimestamps
                // But array is small (60 events for 5 years). Find is fine.
                const pastDivs = dividendTimestamps.filter(dTs => dTs <= ts);
                if (pastDivs.length > 0) {
                    const lastDivTs = pastDivs[pastDivs.length - 1];
                    currentDivVal = dividends[lastDivTs].amount;
                }

                lastKnownDividend = currentDivVal;

                processedData.push({
                    date: dateStr,
                    price: Number(close.toFixed(2)),
                    dividend: currentDivVal
                });
            }
        });

        const output = {
            updatedAt: new Date().toISOString(),
            data: processedData
        };

        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(output, null, 2));
        console.log(`Successfully updated ${DATA_FILE} with ${processedData.length} records.`);

    } catch (error) {
        console.error('Error updating STRC data:', error);
        process.exit(1);
    }
}

main();
