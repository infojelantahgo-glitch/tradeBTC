import type { AnalysisConfig } from './types';

export const AI_PROVIDERS = ['Google Gemini'];
export const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro'];

export const DATA_VENDORS = {
  core: ['yfinance', 'alpha_vantage', 'local'],
  technical: ['yfinance', 'alpha_vantage', 'local'],
  fundamental: ['alpha_vantage', 'gemini', 'local'],
  news: ['alpha_vantage', 'google', 'gemini', 'local'],
};

export const SUPPORTED_ASSETS = [
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'ETH-USD', name: 'Ethereum' },
  { symbol: 'SOL-USD', name: 'Solana' },
  { symbol: 'XRP-USD', name: 'XRP' },
  { symbol: 'DOGE-USD', name: 'Dogecoin' },
  { symbol: 'ADA-USD', name: 'Cardano' },
  { symbol: 'AVAX-USD', name: 'Avalanche' },
  { symbol: 'LINK-USD', name: 'Chainlink' },
  { symbol: 'LTC-USD', name: 'Litecoin' },
  { symbol: 'MATIC-USD', name: 'Polygon' },
];

export const DEFAULT_CONFIG: AnalysisConfig = {
  aiProvider: 'Google Gemini',
  aiModel: 'gemini-2.5-flash',
  dataVendors: {
    coreStockApi: 'yfinance',
    technicalIndicators: 'yfinance',
    fundamentalData: 'alpha_vantage',
    newsData: 'google',
  },
  debateRounds: 1,
  debugMode: true,
};
