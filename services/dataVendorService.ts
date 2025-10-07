// This service fetches price data. It uses a real-time API for cryptocurrencies.

interface PriceData {
  price: number;
  isRealTime: boolean;
}

// A simple map to convert common symbols to CoinGecko API IDs.
const cryptoSymbolToId: { [key: string]: string } = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'XRP': 'ripple',
  'DOGE': 'dogecoin',
  'ADA': 'cardano',
  'LINK': 'chainlink',
  'LTC': 'litecoin',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
};

const getCryptoPrice = async (symbol: string): Promise<number> => {
    const baseSymbol = symbol.split('-')[0].toUpperCase();
    const coingeckoId = cryptoSymbolToId[baseSymbol];

    if (!coingeckoId) {
        throw new Error(`Cryptocurrency symbol '${symbol}' is not supported for real-time pricing.`);
    }

    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`);
        if (!response.ok) {
            throw new Error(`CoinGecko API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data[coingeckoId] && data[coingeckoId].usd) {
            return data[coingeckoId].usd;
        }
        throw new Error(`Price data not found for '${symbol}' in CoinGecko response.`);
    } catch (error) {
        console.error("Error fetching real-time crypto price:", error);
        throw new Error(`Failed to fetch price for ${symbol}. Please try again later.`);
    }
};

export const getCurrentPrice = async (symbol: string): Promise<PriceData> => {
  console.log(`Fetching real-time price for ${symbol}...`);
  const realPrice = await getCryptoPrice(symbol);
  console.log(`Fetched real-time price for ${symbol}: ${realPrice}`);
  return { price: realPrice, isRealTime: true };
};
