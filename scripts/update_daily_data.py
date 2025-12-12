import urllib.request
import json
import datetime
import os
import re
import time

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

def get_latest_date_in_file(content):
    # Find the first occurrence of a date key like "YYYY-MM-DD":
    # This assumes the file is sorted descending, so the first one found is the latest.
    match = re.search(r'"(\d{4}-\d{2}-\d{2})":', content)
    if match:
        return datetime.datetime.strptime(match.group(1), "%Y-%m-%d").date()
    return None

def fetch_data_for_date(target_date):
    cg_date = target_date.strftime("%d-%m-%Y") # DD-MM-YYYY for CoinGecko
    aa_date = target_date.strftime("%Y%m%d") # YYYYMMDD for AwesomeAPI
    
    print(f"Fetching data for: {target_date}")

    # 1. Fetch BTC Price (USD)
    btc_price = None
    cg_url = f"https://api.coingecko.com/api/v3/coins/bitcoin/history?date={cg_date}"
    cg_data = fetch_json(cg_url)
    
    if cg_data and 'market_data' in cg_data and 'current_price' in cg_data['market_data']:
        btc_price = cg_data['market_data']['current_price'].get('usd')
    
    if btc_price is None:
        print(f"Warning: Could not fetch BTC price for {target_date}")

    # 2. Fetch Exchange Rates (USD-BRL)
    brl_rate = None
    brl_url = f"https://economia.awesomeapi.com.br/json/daily/USD-BRL/?start_date={aa_date}&end_date={aa_date}"
    brl_data = fetch_json(brl_url)
    if brl_data and len(brl_data) > 0:
        brl_rate = float(brl_data[0]['bid'])

    # 3. Fetch Exchange Rates (EUR-USD -> USD-EUR)
    eur_rate = None
    eur_url = f"https://economia.awesomeapi.com.br/json/daily/EUR-USD/?start_date={aa_date}&end_date={aa_date}"
    eur_data = fetch_json(eur_url)
    if eur_data and len(eur_data) > 0:
        rate_eur_usd = float(eur_data[0]['bid'])
        if rate_eur_usd > 0:
            eur_rate = 1 / rate_eur_usd
            
    return btc_price, brl_rate, eur_rate

def update_file():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    last_date = get_latest_date_in_file(content)
    if not last_date:
        print("Could not determine last date from file. Aborting.")
        return

    today = datetime.date.today()
    # We want to fill up to yesterday (since today's close isn't final/historical yet usually, 
    # but the original script used 'yesterday', so we stick to that).
    yesterday = today - datetime.timedelta(days=1)
    
    if last_date >= yesterday:
        print(f"Data is up to date (Last date: {last_date}, Yesterday: {yesterday}).")
        return

    print(f"Last date in file: {last_date}. Need to backfill up to: {yesterday}")

    # Loop from (last_date + 1) to yesterday
    # We iterate chronologically: 
    # If last is 09, we process 10, then 11.
    # We perform insertion for 10 at the top, then 11 at the top.
    # This results in: 11, 10, 09... which is correct order.
    
    current_date = last_date + datetime.timedelta(days=1)
    
    days_to_process = []
    while current_date <= yesterday:
        days_to_process.append(current_date)
        current_date += datetime.timedelta(days=1)

    for target_date in days_to_process:
        iso_date = target_date.strftime("%Y-%m-%d")
        
        # Double check if exists
        if f'"{iso_date}"' in content:
            print(f"Entry for {iso_date} already exists. Skipping.")
            continue

        btc_price, brl_rate, eur_rate = fetch_data_for_date(target_date)

        if btc_price is None and brl_rate is None and eur_rate is None:
            print(f"No data fetched for {iso_date}. Skipping.")
            continue

        print(f"Inserting data for {iso_date}...")

        # Update Content string in memory
        if btc_price is not None:
             marker = 'export const bitcoinHistoricalData = {\n'
             insert_text = f'    "{iso_date}": {btc_price},\n'
             content = content.replace(marker, marker + insert_text)

        if brl_rate is not None:
            marker_brl = '    "BRL": {\n'
            insert_brl = f'        "{iso_date}": {brl_rate},\n'
            content = content.replace(marker_brl, marker_brl + insert_brl)

        if eur_rate is not None:
            marker_eur = '    "EUR": {\n'
            insert_eur = f'        "{iso_date}": {eur_rate},\n'
            content = content.replace(marker_eur, marker_eur + insert_eur)
        
        # Sleep briefly to be nice to APIs
        time.sleep(1)

    # Write Back once at the end
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
         f.write(content)
    print("Successfully updated historicalData.ts with backfilled data.")

if __name__ == "__main__":
    update_file()
