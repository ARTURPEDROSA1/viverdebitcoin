
const fs = require('fs');
const path = 'c:\\Users\\ARTUR\\Documents\\Viverdebitcoin\\src\\lib\\historicalData.ts';

try {
    const data = fs.readFileSync(path, 'utf8');
    const regex = /"(\d{4}-\d{2}-\d{2})":/g;
    let match;
    const dates = [];
    while ((match = regex.exec(data)) !== null) {
        dates.push(match[1]);
    }
    dates.sort();

    console.log('Total dates found:', dates.length);
    if (dates.length > 0) {
        console.log('First date (Start):', dates[0]);
        console.log('Last date (End):', dates[dates.length - 1]);
    } else {
        console.log('No dates found!');
    }
} catch (err) {
    console.error('Error reading file:', err);
}
