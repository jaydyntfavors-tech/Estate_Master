import { StockAsset } from '../types/game';

export const INITIAL_STOCK_ASSETS: StockAsset[] = [
  {
    symbol: 'V-TOTAL',
    name: 'US Total Market 500 Index ETF',
    category: 'Broad Market ETF',
    currentPrice: 485.5,
    annualDividendYield: 1.65,
    volatility: 1.0,
    description: 'Tracks the 500 largest leading American public enterprises. Core long-term wealth compounding engine.',
    priceHistory: [462, 468, 474, 470, 479, 485.5],
  },
  {
    symbol: 'TECH-100',
    name: 'Horizon Tech Growth 100 Index',
    category: 'Tech Growth 100',
    currentPrice: 412.0,
    annualDividendYield: 0.65,
    volatility: 1.45,
    description: 'Concentrated exposure to high-growth software, semiconductors, and artificial intelligence leaders.',
    priceHistory: [385, 392, 401, 395, 408, 412.0],
  },
  {
    symbol: 'REIT-TRUST',
    name: 'Metropolitan Real Estate Trust',
    category: 'Real Estate REIT',
    currentPrice: 94.2,
    annualDividendYield: 5.25,
    volatility: 0.85,
    description: 'Publicly traded REIT basket holding industrial warehouses, grocery centers, and medical clinics. High monthly dividend payouts.',
    priceHistory: [91, 92, 93.5, 92.8, 93.9, 94.2],
  },
  {
    symbol: 'TREAS-YIELD',
    name: 'Federal Treasury Yield Note ETF',
    category: 'Treasury Yield',
    currentPrice: 100.1,
    annualDividendYield: 4.85,
    volatility: 0.15,
    description: 'Ultra-short risk-free government notes. Liquid safe haven to park capital while saving for real estate down payments.',
    priceHistory: [99.8, 99.9, 100.0, 100.05, 100.1, 100.1],
  },
];
