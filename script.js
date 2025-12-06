document.addEventListener('DOMContentLoaded', () => {
    initCalculator();
    initMarketTicker();
    initTheme();
    initHalvingCountdown();

    // Refresh Market Ticker AND Price Display every 30 seconds
    setInterval(() => {
        initMarketTicker();
        fetchCurrentPrice();
    }, 30000);
});

let currentPriceUSD = 0;
let roiChart = null; // Global variable for chart instance


async function initCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const resultSection = document.getElementById('result-section');

    // Set default date to yesterday to ensure we have "historical" context or use max date
    const dateInput = document.getElementById('investment-date');
    if (dateInput) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateInput.valueAsDate = yesterday;
        dateInput.max = today.toISOString().split('T')[0];
    }

    // Try to fetch live price on load
    await fetchCurrentPrice();

    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateROI);
    }
}

async function fetchCurrentPrice() {
    const priceDisplay = document.getElementById('live-price-display');
    try {
        // Switching to AwesomeAPI for BRL consistency + Auto Update
        // They return BTC-BRL, USD-BRL, etc.
        const response = await fetch('https://economia.awesomeapi.com.br/last/BTC-BRL');
        const data = await response.json();
        const priceBRL = parseFloat(data.BTCBRL.bid);

        // Also update the global variable used for calculations?
        // Wait, 'currentPriceUSD' was global. We might need currentPriceBRL too or convert
        // For simplicity, let's update a global for BRL and convert to USD if needed, 
        // OR just fetch USD pair too if logic depends heavily on USD base.
        // Actually, let's keep it simple: display BRL here.

        if (priceDisplay) {
            priceDisplay.textContent = `Preço Atual: ${priceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`;
        }

        // --- Dynamic Updates for "Sobre" Page (Pizza & Mining) ---
        const fmtBRL = (val) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Pizza Elements
        const elPizzaPrice = document.getElementById('dynamic-btc-price-pizza');
        const elPizzaCalc = document.getElementById('dynamic-btc-price-pizza-calc');
        const elPizzaVal = document.getElementById('dynamic-pizza-value');

        if (elPizzaPrice) elPizzaPrice.textContent = fmtBRL(priceBRL);
        if (elPizzaCalc) elPizzaCalc.textContent = fmtBRL(priceBRL);
        if (elPizzaVal) elPizzaVal.textContent = fmtBRL(priceBRL * 10000);

        // Pizza Billions
        const elPizzaBillions = document.getElementById('dynamic-pizza-billions');
        if (elPizzaBillions) {
            const valBillions = (priceBRL * 10000) / 1000000000;
            elPizzaBillions.textContent = `R$ ${valBillions.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} bilhões`;
        }

        // Mining Elements
        const elMiningPrice = document.getElementById('dynamic-btc-price-mining');
        const elMiningCalc = document.getElementById('dynamic-btc-price-mining-calc');
        const elRewardVal = document.getElementById('dynamic-block-reward-value');
        const elRewardMillions = document.getElementById('dynamic-block-reward-millions'); // Assuming this ID from user intent, though I missed adding it in HTML step perfectly, let's fix that if needed or use what I added.
        // Wait, I added <span id="dynamic-block-reward- millions">...</span> with a space in previous step. I should fix that typo in HTML first or match it here. 
        // Actually, I should correct the HTML file first because "dynamic-block-reward- millions" is a bad ID. 

        // Let's assume I fix the HTML ID to "dynamic-block-reward-millions" in a next step or just match the likely intended ID.
        // I will use "dynamic-block-reward-millions" here and ensure HTML matches.

        if (elMiningPrice) elMiningPrice.textContent = fmtBRL(priceBRL);
        if (elMiningCalc) elMiningCalc.textContent = fmtBRL(priceBRL);
        if (elRewardVal) {
            const reward = 3.125 * priceBRL;
            elRewardVal.textContent = fmtBRL(reward);

            // For the millions text
            // "cerca de R$ 1,52 milhão"
            // We want "R$ X,XX milhões"
            const millions = reward / 1000000;
            const elMillions = document.getElementById('dynamic-block-reward-millions'); // Correct ID

            // Note: I seemingly made a typo in the previous HTML edit: "dynamic-block-reward- millions".
            // I will correct that in HTML, but here I write the clean code.
            if (elMillions) {
                elMillions.textContent = `R$ ${millions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} milhões`;
            }
        }

        // Update global USD price for the calculator logic which relies on USD base
        // We can fetch BTC-USD as well or convert.
        // Let's fetch both to be safe and accurate for the internal math 
        // which seems to run on USD base (bitcoinHistoricalData is USD).
        const resUSD = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const dataUSD = await resUSD.json();
        currentPriceUSD = dataUSD.bitcoin.usd;

    } catch (error) {
        console.error('Error updating prices:', error);
    }
}

function calculateROI() {
    const amountInput = parseFloat(document.getElementById('investment-amount').value);
    const currency = document.getElementById('currency-selector').value;
    const dateInput = document.getElementById('investment-date').value;

    if (!amountInput || !dateInput) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Date Clamp Logic
    const LIMIT_DATE = '2014-09-17';
    let targetDate = dateInput;

    if (dateInput < LIMIT_DATE) {
        targetDate = LIMIT_DATE;
        // Update the input to show the modified date to the user
        document.getElementById('investment-date').value = LIMIT_DATE;
        // Optional: Alert user visually? The static text below button already warns them.
    }

    const priceData = getDateValue(bitcoinHistoricalData, targetDate);

    if (!priceData) {
        // Should catch cases where date is somehow invalid or future without data
        alert('Data inválida ou sem dados disponíveis.');
        return;
    }

    const historicalPriceUSD = priceData.value;
    const effectiveDate = priceData.date;

    if (effectiveDate !== dateInput) {
        console.warn(`Exact date ${dateInput} not found. Using closest: ${effectiveDate} ($${historicalPriceUSD})`);
    }

    // Determine Historical Exchange Rate (at time of purchase)
    // If user inputs BRL, we need to know how many USD that was WORTH back then.
    // AmountInUSD = AmountLocal / Rate(Local->USD)
    // My data is Rate(USD->Local) or (Local per USD). e.g. 1 USD = 5 BRL.
    // So AmountUSD = 1000 BRL / 5 = 200 USD. Correct.

    let historicalRate = 1;
    if (currency !== 'USD') {
        // Use effectiveDate (from BTC data) to ensure we align with the price data found
        const rateDate = effectiveDate;
        const rateData = getDateValue(exchangeRatesHistorical[currency], rateDate);

        console.log(`Looking for ${currency} rate on ${rateDate} (Effective)`);

        if (rateData) {
            console.log(`Found rate: ${rateData.value} on ${rateData.date}`);
            historicalRate = rateData.value;
        } else {
            console.warn(`Rate not found for ${rateDate}, utilizing fallback: ${exchangeRates[currency]}`);
            // Fallback to static if absolutely no historical data found (unlikely)
            historicalRate = exchangeRates[currency] || 1;
        }
    }

    // Convert Investment Amount to USD using HISTORICAL rate
    const amountInUSD = amountInput / historicalRate;

    // Calculate BTC bought
    const btcAmount = amountInUSD / historicalPriceUSD;

    // Calculate Current Value
    // We convert BTC back to USD (Current Price), then to Local Currency (Current Rate)
    // Actually, usually we show Current Value in Local Currency using *Current* Exchange Rate.

    const currentRate = exchangeRates[currency] || 1; // Use latest static rate for "Today's Value"

    const currentValueUSD = btcAmount * currentPriceUSD;
    const currentValueLocal = currentValueUSD * currentRate;

    // ROI
    const profitLocal = currentValueLocal - amountInput;
    const roiPercentage = ((profitLocal / amountInput) * 100).toFixed(2);

    displayResult(currentValueLocal, profitLocal, roiPercentage, currency, btcAmount);
    renderChart(btcAmount, effectiveDate, currency, amountInput);
}

/**
 * Helper to get value for a specific date or closest previous date
 * @param {Object} dataObj - Key-value pair of Date -> Value
 * @param {String} targetDate - Date string YYYY-MM-DD
 * @returns {Object|null} { date: "YYYY-MM-DD", value: Number }
 */
function getDateValue(dataObj, targetDate) {
    if (!dataObj) return null;

    // Exact match
    if (dataObj[targetDate] !== undefined) {
        return { date: targetDate, value: dataObj[targetDate] };
    }

    // Closest previous match
    const dates = Object.keys(dataObj).sort();
    const target = new Date(targetDate);
    let closestDate = null;

    for (let d of dates) {
        const current = new Date(d);
        if (current <= target) {
            closestDate = d;
        } else {
            // Dates are sorted, so once we pass target, we stop
            break;
        }
    }

    if (closestDate) {
        return { date: closestDate, value: dataObj[closestDate] };
    }

    return null;
}

function displayResult(finalValue, profit, roi, currency, btcAmount) {
    const resultCard = document.getElementById('result-card');
    const finalValueEl = document.getElementById('result-value');
    const btcAmountEl = document.getElementById('result-btc-amount');
    const profitEl = document.getElementById('result-profit');
    const roiEl = document.getElementById('result-roi');

    const formatter = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
        style: 'currency',
        currency: currency
    });

    finalValueEl.textContent = formatter.format(finalValue);
    if (btcAmountEl) {
        btcAmountEl.textContent = `${btcAmount.toFixed(8)} BTC`;
    }
    profitEl.textContent = `${profit >= 0 ? '+' : ''}${formatter.format(profit)}`;
    profitEl.className = profit >= 0 ? 'profit-positive' : 'profit-negative';

    // Format ROI to Brazilian standard: 43.900,54 %
    const roiNumber = parseFloat(roi);
    roiEl.textContent = `${roiNumber.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
    roiEl.className = roi >= 0 ? 'roi-positive' : 'roi-negative';

    resultCard.classList.remove('hidden');
    resultCard.classList.add('fade-in');
}

/**
 * Renders the ROI Chart
 * @param {number} btcAmount - Amount of BTC purchased
 * @param {string} startDate - Start Date "YYYY-MM-DD"
 * @param {string} currency - Currency code "USD", "BRL", "EUR"
 * @param {number} initialInvestment - Initial investment in local currency
 */
function renderChart(btcAmount, startDate, currency, initialInvestment) {
    const chartContainer = document.getElementById('roi-chart-container');
    const ctx = document.getElementById('roi-chart').getContext('2d');

    chartContainer.classList.remove('hidden');

    const switcher = document.getElementById('view-switcher-container');
    if (switcher) switcher.classList.remove('hidden');

    const labels = [];
    const dataPoints = [];

    // Get all dates from historical data sorted
    const allDates = Object.keys(bitcoinHistoricalData).sort();

    // Find start index
    let startIndex = -1;
    for (let i = 0; i < allDates.length; i++) {
        if (allDates[i] >= startDate) {
            startIndex = i;
            break;
        }
    }

    if (startIndex === -1) return; // Should not happen given logic above

    // Iterate day by day (or with step if too many points) from start date
    // Optimization: If > 365 days, maybe take every Nth day to avoid performance hit?
    // Chart.js handles large datasets decently, let's try raw first.

    for (let i = startIndex; i < allDates.length; i++) {
        const date = allDates[i];
        const btcPrice = bitcoinHistoricalData[date];

        let rate = 1;
        if (currency !== 'USD') {
            // Find rate for this date. If missing, assume previous known or 1 (fallback)
            // Ideally we carry forward the last known rate.
            // Using helper to exact or closest past
            const rateData = getDateValue(exchangeRatesHistorical[currency], date);
            if (rateData) {
                rate = rateData.value;
            } else {
                // If completely missing (e.g. older than FX data starts), use 1 or closest future?
                // Probably closest future if start of array, but let's stick to safe defaults.
                rate = exchangeRates[currency] || 1;
            }
        }

        const valueInUSD = btcAmount * btcPrice;
        const valueInLocal = valueInUSD * rate;

        labels.push(date);
        dataPoints.push(valueInLocal);
    }

    // Destroy existing chart
    if (roiChart) {
        roiChart.destroy();
    }

    // Create Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(39, 174, 96, 0.5)'); // Green
    gradient.addColorStop(1, 'rgba(39, 174, 96, 0.0)');

    roiChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Valor do Portfólio (${currency})`,
                data: dataPoints,
                borderColor: '#27ae60', // Primary Green
                backgroundColor: gradient,
                borderWidth: 2,
                pointRadius: 0, // Hide points for cleaner look initially
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4 // Smooth curve
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                tooltip: {
                    theme: 'dark',
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
                                    style: 'currency',
                                    currency: currency
                                }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    labels: {
                        color: document.body.classList.contains('light-mode') ? '#333' : '#cccccc'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#888',
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: {
                        color: document.body.classList.contains('light-mode') ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#888',
                        callback: function (value) {
                            // Shorten large numbers
                            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
                            if (value >= 1000) return (value / 1000).toFixed(0) + 'k';
                            return value;
                        }
                    }
                }
            }
        }
    });

    // Populate Table
    const tableBody = document.getElementById('roi-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = ''; // Clear previous
    // Populate in reverse order (newest first)
    for (let i = dataPoints.length - 1; i >= 0; i--) {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        const valCell = document.createElement('td');

        // Simple American date to BR format if needed
        const [y, m, d] = labels[i].split('-');
        dateCell.textContent = `${d}/${m}/${y}`;

        valCell.textContent = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'en-US', {
            style: 'currency',
            currency: currency
        }).format(dataPoints[i]);

        row.appendChild(dateCell);
        row.appendChild(valCell);
        tableBody.appendChild(row);
    }
}

// Theme Logic
function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const spanIcon = toggleBtn.querySelector('span');

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        spanIcon.textContent = '☀️';
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');

        // Update Icon
        spanIcon.textContent = isLight ? '☀️' : '🌙';

        // Save preference
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        // Force chart update to fix grid/label colors if chart exists
        if (roiChart) {
            roiChart.options.plugins.legend.labels.color = isLight ? '#333' : '#cccccc';
            roiChart.options.scales.x.grid.color = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';
            roiChart.options.scales.y.grid.color = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255, 255, 255, 0.05)';
            roiChart.update();
        }
    });
}

// View Switcher (Global)
window.switchView = function (viewName) {
    const chartContainer = document.getElementById('roi-chart-container');
    const tableContainer = document.getElementById('roi-table-container');
    const buttons = document.querySelectorAll('.view-btn');

    if (viewName === 'chart') {
        chartContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
        tableContainer.classList.remove('active');

        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        chartContainer.classList.add('hidden');
        tableContainer.classList.remove('hidden');
        tableContainer.classList.add('active'); // Helper class for display block

        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
    }
};

// Market Ticker Logic
async function initMarketTicker() {
    const marqueeContainer = document.getElementById('market-marquee');
    if (!marqueeContainer) return;

    // Fetch live data
    try {
        const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,EUR-USD,BTC-BRL');

        // Only proceed if request is OK
        if (!res.ok) {
            console.warn('Ticker update skipped: API not OK');
            return;
        }

        const data = await res.json();
        const marketData = [];

        // Helper
        const fmt = (val, digits = 2, prefix = 'R$ ') => `${prefix}${parseFloat(val).toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
        const getTrend = (pct) => parseFloat(pct) >= 0 ? 'up' : 'down';
        const getPct = (pct) => `${parseFloat(pct) >= 0 ? '+' : ''}${parseFloat(pct).toFixed(2)}%`;

        // Bitcoin (BRL)
        if (data.BTCBRL) {
            marketData.push({
                name: 'Bitcoin (BRL)',
                value: fmt(data.BTCBRL.bid, 2, 'R$ '),
                trend: getTrend(data.BTCBRL.pctChange),
                pct: getPct(data.BTCBRL.pctChange)
            });

            // Sats / R$1
            const btcBrl = parseFloat(data.BTCBRL.bid);
            const satsPerBrl = 100000000 / btcBrl;
            marketData.push({
                name: 'Sats / R$1',
                value: `${satsPerBrl.toFixed(0)} Sats`,
                trend: 'up',
                pct: ''
            });
        }

        // Dólar
        if (data.USDBRL) {
            marketData.push({
                name: 'Dólar',
                value: fmt(data.USDBRL.bid, 2),
                trend: getTrend(data.USDBRL.pctChange),
                pct: getPct(data.USDBRL.pctChange)
            });
        }

        // Euro
        if (data.EURBRL) {
            marketData.push({
                name: 'Euro',
                value: fmt(data.EURBRL.bid, 2),
                trend: getTrend(data.EURBRL.pctChange),
                pct: getPct(data.EURBRL.pctChange)
            });
        }

        // EUR/USD
        if (data.EURUSD) {
            marketData.push({
                name: 'EUR/USD',
                value: fmt(data.EURUSD.bid, 4, '$ '),
                trend: getTrend(data.EURUSD.pctChange),
                pct: getPct(data.EURUSD.pctChange)
            });
        }

        // Indices (Mock for Demo/Backup)
        marketData.push({ name: 'S&P 500', value: '6,047.15', trend: 'up', pct: '+0.25%' });
        marketData.push({ name: 'IBOVESPA', value: '126,340', trend: 'down', pct: '-0.50%' });
        marketData.push({ name: 'NASDAQ', value: '19,700.50', trend: 'up', pct: '+0.80%' });

        // Render Items
        const buildItemHTML = (item) => `
            <span class="marquee-item">
                <span class="marquee-label">${item.name}</span>
                <strong class="marquee-value">${item.value}</strong>
                ${item.pct ? `<span class="marquee-trend-${item.trend}">${item.pct}</span>` : ''}
            </span>
        `;

        const itemsHTML = marketData.map(buildItemHTML).join('');

        // Inject content twice for seamless loop
        marqueeContainer.innerHTML = itemsHTML + itemsHTML + itemsHTML;

    } catch (e) {
        console.error("Ticker fetch error - Keeping old data:", e);
    }
}

/**
 * Halving Countdown Logic
 */
function initHalvingCountdown() {
    const timerEl = document.getElementById('halving-timer');
    if (!timerEl) return;

    // Estimated Target: April 17, 2028 12:00 UTC (Approximate)
    const targetDate = new Date('2028-04-17T12:00:00Z').getTime();

    function update() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            timerEl.textContent = "Halving Concluído!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    update();
    setInterval(update, 1000);
}
