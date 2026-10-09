import React, { useState } from 'react';
import { MarketState, StockAsset, StockHolding } from '../types/game';
import { formatCurrency, formatPercent } from '../utils/calculator';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Coins,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { playCashSound, playClickSound, playSuccessSound } from '../utils/audio';

interface StockPortfolioViewProps {
  stockAssets: StockAsset[];
  holdings: StockHolding[];
  cash: number;
  marketState: MarketState;
  onBuyStock: (symbol: string, shares: number, totalCost: number) => void;
  onSellStock: (symbol: string, shares: number, totalProceeds: number) => void;
}

export const StockPortfolioView: React.FC<StockPortfolioViewProps> = ({
  stockAssets,
  holdings,
  cash,
  marketState,
  onBuyStock,
  onSellStock,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<StockAsset | null>(null);
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy');
  const [tradeShares, setTradeShares] = useState<number>(1);

  // Portfolio aggregates
  const totalStockValue = holdings.reduce((sum, h) => {
    const asset = stockAssets.find((a) => a.symbol === h.symbol);
    return sum + (asset ? asset.currentPrice * h.shares : 0);
  }, 0);

  const totalCostBasis = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  const totalGainLoss = totalStockValue - totalCostBasis;
  const totalGainLossPercent =
    totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0;

  // Monthly dividend income
  const totalAnnualDividends = holdings.reduce((sum, h) => {
    const asset = stockAssets.find((a) => a.symbol === h.symbol);
    if (!asset) return sum;
    return sum + (asset.currentPrice * h.shares * (asset.annualDividendYield / 100));
  }, 0);
  const monthlyDividendIncome = Math.round(totalAnnualDividends / 12);

  const handleOpenTrade = (asset: StockAsset, action: 'buy' | 'sell') => {
    setSelectedAsset(asset);
    setTradeAction(action);
    setTradeShares(1);
    playClickSound();
  };

  const handleExecuteTrade = () => {
    if (!selectedAsset || tradeShares <= 0) return;

    if (tradeAction === 'buy') {
      const cost = Math.round(selectedAsset.currentPrice * tradeShares);
      if (cash < cost) {
        alert('Insufficient cash for this purchase!');
        return;
      }
      onBuyStock(selectedAsset.symbol, tradeShares, cost);
      playCashSound();
    } else {
      const holding = holdings.find((h) => h.symbol === selectedAsset.symbol);
      const owned = holding ? holding.shares : 0;
      if (tradeShares > owned) {
        alert('You do not own that many shares to sell!');
        return;
      }
      const proceeds = Math.round(selectedAsset.currentPrice * tradeShares);
      onSellStock(selectedAsset.symbol, tradeShares, proceeds);
      playCashSound();
    }

    setSelectedAsset(null);
  };

  return (
    <div className="space-y-6">
      {/* Stock Portfolio Top KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Equities Portfolio Value</div>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalStockValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Liquid index & equity assets</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Unrealized Total Return</div>
          <div
            className={`text-2xl font-bold font-mono mt-1 tabular-nums flex items-center gap-1 ${
              totalGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalGainLoss >= 0 ? (
              <TrendingUp className="w-4 h-4 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 shrink-0" />
            )}
            {formatCurrency(totalGainLoss)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {formatPercent(totalGainLossPercent, 1)} overall gain/loss
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Monthly Dividend Cashflow</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            +{formatCurrency(monthlyDividendIncome)}/mo
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {formatCurrency(totalAnnualDividends)}/yr passive payouts
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Available Cash to Invest</div>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {formatCurrency(cash)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Ready for trading or property deals</div>
        </div>
      </div>

      {/* Market Cycle Sentiment Strip */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-white">Stock Market Trend:</span>
          <span className="text-slate-300 font-mono">
            {marketState.cycle === 'boom'
              ? 'Bull Market Rally (+12% to +18% annual growth)'
              : marketState.cycle === 'steady'
              ? 'Steady Historical Growth (+8.5% annual growth)'
              : marketState.cycle === 'cooling'
              ? 'Market Consolidation (+2% annual growth)'
              : 'Bear Market Correction (-12% discount opportunities)'}
          </span>
        </div>
        <div className="text-slate-400 font-mono">
          Dividends automatically deposit on the 1st of every month
        </div>
      </div>

      {/* Stock Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stockAssets.map((asset) => {
          const holding = holdings.find((h) => h.symbol === asset.symbol);
          const sharesOwned = holding ? holding.shares : 0;
          const positionValue = sharesOwned * asset.currentPrice;
          const costBasis = holding ? holding.totalInvested : 0;
          const positionGain = positionValue - costBasis;
          const positionGainPercent =
            costBasis > 0 ? (positionGain / costBasis) * 100 : 0;

          // Simple SVG sparkline
          const minPrice = Math.min(...asset.priceHistory);
          const maxPrice = Math.max(...asset.priceHistory);
          const range = Math.max(1, maxPrice - minPrice);
          const sparklinePoints = asset.priceHistory
            .map((p, idx) => {
              const x = (idx / (asset.priceHistory.length - 1)) * 120;
              const y = 35 - ((p - minPrice) / range) * 30;
              return `${x},${y}`;
            })
            .join(' ');

          const isUp = asset.priceHistory[asset.priceHistory.length - 1] >= asset.priceHistory[0];

          return (
            <div
              key={asset.symbol}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <span className="font-bold text-white text-sm">{asset.symbol}</span>
                      <span>·</span>
                      <span>{asset.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mt-1">{asset.name}</h3>
                  </div>

                  <div className="text-right font-mono tabular-nums shrink-0">
                    <div className="text-xl font-bold text-white">
                      ${asset.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-xs text-emerald-400 font-medium">
                      {formatPercent(asset.annualDividendYield, 2)} Div Yield
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {asset.description}
                </p>

                {/* 6-Month Trend Sparkline */}
                <div className="mt-4 p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono block">6-Month Trend</span>
                    <span className={`text-xs font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '+Upward Trend' : '-Downward Trend'}
                    </span>
                  </div>

                  <svg className="w-32 h-10 overflow-visible" viewBox="0 0 120 40">
                    <polyline
                      fill="none"
                      stroke={isUp ? '#34d399' : '#f87171'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={sparklinePoints}
                    />
                  </svg>
                </div>

                {/* Player's Position in this Asset */}
                <div className="mt-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800/60 grid grid-cols-3 gap-2 text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Shares Held</span>
                    <span className="font-bold text-white text-sm">
                      {sharesOwned.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Total Value</span>
                    <span className="font-bold text-white text-sm">
                      {formatCurrency(positionValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Gain / Loss</span>
                    <span
                      className={`font-semibold text-sm ${
                        positionGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sharesOwned > 0 ? (
                        <>
                          {positionGain >= 0 ? '+' : ''}
                          {formatCurrency(positionGain)}
                        </>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenTrade(asset, 'buy')}
                  className="py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Buy Shares</span>
                </button>

                <button
                  onClick={() => handleOpenTrade(asset, 'sell')}
                  disabled={sharesOwned <= 0}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
                    sharesOwned > 0
                      ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
                      : 'text-slate-600 bg-slate-900 border-slate-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>Sell for Cash</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trade Execution Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                  {tradeAction === 'buy' ? 'Order Buy Shares' : 'Order Sell Shares'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedAsset.name} ({selectedAsset.symbol})
                </h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Market Price: ${selectedAsset.currentPrice.toFixed(2)} / share
                </div>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>

            {/* Shares input */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-slate-300 block">
                Number of Shares to {tradeAction === 'buy' ? 'Buy' : 'Sell'}:
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={
                    tradeAction === 'buy'
                      ? Math.floor(cash / selectedAsset.currentPrice)
                      : holdings.find((h) => h.symbol === selectedAsset.symbol)?.shares || 0
                  }
                  value={tradeShares}
                  onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono"
                />

                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => setTradeShares(10)}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-mono"
                  >
                    10
                  </button>
                  <button
                    onClick={() => setTradeShares(50)}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-mono"
                  >
                    50
                  </button>
                  <button
                    onClick={() => {
                      const maxS =
                        tradeAction === 'buy'
                          ? Math.floor(cash / selectedAsset.currentPrice)
                          : holdings.find((h) => h.symbol === selectedAsset.symbol)?.shares || 0;
                      setTradeShares(Math.max(1, maxS));
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-mono"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Cost & Result Calculation */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-mono tabular-nums text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Total {tradeAction === 'buy' ? 'Order Cost' : 'Cash Proceeds'}:</span>
                  <span className="text-white font-bold text-sm">
                    {formatCurrency(Math.round(selectedAsset.currentPrice * tradeShares))}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Available Liquid Cash:</span>
                  <span className="text-emerald-400">{formatCurrency(cash)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Est. Annual Dividends Added:</span>
                  <span className="text-sky-400">
                    +{formatCurrency(
                      Math.round(
                        tradeShares *
                          selectedAsset.currentPrice *
                          (selectedAsset.annualDividendYield / 100)
                      )
                    )}
                    /yr
                  </span>
                </div>
              </div>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecuteTrade}
              className={`w-full py-2.5 text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 ${
                tradeAction === 'buy'
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
              }`}
            >
              {tradeAction === 'buy'
                ? `Confirm Purchase (${formatCurrency(Math.round(selectedAsset.currentPrice * tradeShares))})`
                : `Sell Shares (+${formatCurrency(Math.round(selectedAsset.currentPrice * tradeShares))} Cash)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
