import urllib.request
import json
import datetime
import os

# Define paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(BASE_DIR, 'src', 'lib', 'historicalData.ts')

def fetch_json(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                print(f"Success fetching: {url}")
                return json.loads(response.read().decode())
    except Exception as e:
        print(f"Error fetching {url}: {e}")
    return None

def update_file():
    # 1. Get Yesterday's Date
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    
    # Formats
    cg_date = yesterday.strftime("%d-%m-%Y") # DD-MM-YYYY for CoinGecko
    iso_date = yesterday.strftime("%Y-%m-%d") # YYYY-MM-DD for file
    aa_date = yesterday.strftime("%Y%m%d") # YYYYMMDD for AwesomeAPI

    print(f"Checking data for Date: {iso_date}")

    # Check if entry already exists (simple string check)
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if f'"{iso_date}"' in content:
        print(f"Entry for {iso_date} already exists in historicalData.ts. Skipping update.")
        return

    # 2. Fetch BTC Price (USD)
    # CoinGecko
    btc_price = None
    cg_url = f"https://api.coingecko.com/api/v3/coins/bitcoin/history?date={cg_date}"
    cg_data = fetch_json(cg_url)
    
    if cg_data and 'market_data' in cg_data and 'current_price' in cg_data['market_data']:
        btc_price = cg_data['market_data']['current_price'].get('usd')
    
    if btc_price is None:
        print("Warning: Could not fetch BTC price.")

    # 3. Fetch Exchange Rates
    # USD-BRL
    brl_rate = None
    # AwesomeAPI daily endpoint
    brl_url = f"https://economia.awesomeapi.com.br/json/daily/USD-BRL/?start_date={aa_date}&end_date={aa_date}"
    brl_data = fetch_json(brl_url)
    if brl_data and len(brl_data) > 0:
        brl_rate = float(brl_data[0]['bid'])

    # EUR-USD => Calculate USD-EUR
    eur_rate = None
    eur_url = f"https://economia.awesomeapi.com.br/json/daily/EUR-USD/?start_date={aa_date}&end_date={aa_date}"
    eur_data = fetch_json(eur_url)
    if eur_data and len(eur_data) > 0:
        rate_eur_usd = float(eur_data[0]['bid'])
        if rate_eur_usd > 0:
            eur_rate = 1 / rate_eur_usd

    if btc_price is None and brl_rate is None and eur_rate is None:
        print("No new data fetched. No changes made.")
        return

    print(f"New Data to Append: BTC=${btc_price}, BRL={brl_rate}, EUR={eur_rate}")

    # 4. Update File Content
    # We assume standard formatting in the file.
    
    # Insert BTC
    if btc_price is not None:
        marker = 'export const bitcoinHistoricalData = {\n'
        insert_text = f'    "{iso_date}": {btc_price},\n'
        content = content.replace(marker, marker + insert_text)

    # Insert BRL
    if brl_rate is not None:
        marker_brl = '    "BRL": {\n'
        insert_brl = f'        "{iso_date}": {brl_rate},\n'
        content = content.replace(marker_brl, marker_brl + insert_brl)

    # Insert EUR
    if eur_rate is not None:
        marker_eur = '    "EUR": {\n'
        insert_eur = f'        "{iso_date}": {eur_rate},\n'
        content = content.replace(marker_eur, marker_eur + insert_eur)

    # 5. Write Back
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully updated historicalData.ts")

if __name__ == "__main__":
    update_file()
