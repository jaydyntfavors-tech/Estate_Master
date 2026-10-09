import React, { useState } from 'react';
import { MarketState, Property } from '../types/game';
import { formatCurrency, formatPercent, getPropertyFinancialBreakdown } from '../utils/calculator';
import { TrendingUp, TrendingDown, DollarSign, Building2, ShieldAlert, Flame } from 'lucide-react';
import { MarketDemandHeatmap } from './MarketDemandHeatmap';
import { playClickSound } from '../utils/audio';

interface PortfolioOverviewProps {
  cash: number;
  creditScore: number;
  properties: Property[];
  marketState: MarketState;
  onOpenMarketplace: () => void;
  onOpenRefinance: () => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  cash,
  creditScore,
  properties,
  marketState,
  onOpenMarketplace,
  onOpenRefinance,
}) => {
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Aggregate portfolio totals
  const totalPropertyValue = properties.reduce((sum, p) => sum + p.currentMarketValue, 0);

  const breakdowns = properties.map((p) => getPropertyFinancialBreakdown(p));
  const totalGrossRent = breakdowns.reduce((sum, b) => sum + b.grossRentCollected, 0);
  const totalOperatingExpenses = breakdowns.reduce((sum, b) => sum + b.operatingExpenses.totalOperatingExpenses, 0);
  const totalDebtService = breakdowns.reduce((sum, b) => sum + b.totalDebtService, 0);
  const totalMonthlyNetCashFlow = breakdowns.reduce((sum, b) => sum + b.netCashFlow, 0);
  const totalDebt = breakdowns.reduce((sum, b) => sum + b.totalDebt, 0);
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const occupiedUnits = breakdowns.reduce((sum, b) => sum + b.occupiedUnits, 0);

  const netWorth = totalPropertyValue - totalDebt + cash;
  const portfolioLTV = totalPropertyValue > 0 ? (totalDebt / totalPropertyValue) * 100 : 0;
  const overallOccupancy = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 100;

  return (
    <div className="space-y-4">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Liquid Cash */}
        <div className={`p-4 rounded-xl border bg-slate-900/60 backdrop-blur-sm ${cash < 0 ? 'border-rose-500/50 bg-rose-950/20' : 'border-slate-800'}`}>
          <div className="text-xs text-slate-400 font-medium">Liquid Cash</div>
          <div className={`text-xl font-bold font-mono tabular-nums mt-1 ${cash < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {formatCurrency(cash)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Available for deals & reserves</div>
        </div>

        {/* Net Worth */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Net Worth</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {formatCurrency(netWorth)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Assets minus debt + cash</div>
        </div>

        {/* Monthly Net Cash Flow */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Monthly Cash Flow</div>
          <div
            className={`text-xl font-bold font-mono tabular-nums mt-1 flex items-center gap-1 ${
              totalMonthlyNetCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalMonthlyNetCashFlow >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {formatCurrency(totalMonthlyNetCashFlow)}/mo
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Rent (${formatCurrency(totalGrossRent)}) - Costs (${formatCurrency(totalOperatingExpenses + totalDebtService)})
          </div>
        </div>

        {/* Portfolio Valuation */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Portfolio Value</div>
          <div className="text-xl font-bold font-mono tabular-nums text-sky-400 mt-1">
            {formatCurrency(totalPropertyValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {properties.length} {properties.length === 1 ? 'property' : 'properties'} · {totalUnits} units
          </div>
        </div>

        {/* Total Debt & Leverage */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Total Debt (LTV)</div>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-400 mt-1">
            {formatCurrency(totalDebt)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {formatPercent(portfolioLTV, 1)} Loan-to-Value ratio
          </div>
        </div>

        {/* Credit Score & Occupancy */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm">
          <div className="text-xs text-slate-400 font-medium">Borrower Credit</div>
          <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
            {creditScore}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono tabular-nums">
            {formatPercent(overallOccupancy, 0)} Portfolio Occupancy
          </div>
        </div>
      </div>

      {/* Cash Warning Banner if negative */}
      {cash < 0 && (
        <div className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-950/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
            <span>
              <strong>Warning: Account In Overdraft ({formatCurrency(cash)})</strong>. Your expenses exceeded liquid cash.
              Refinance equity, raise rents, or sell an asset to avoid bankruptcy!
            </span>
          </div>
          <button
            onClick={onOpenRefinance}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors shrink-0"
          >
            Refinance For Cash
          </button>
        </div>
      )}

      {/* Macro Economy Strip & Quick Strategy Toolbar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
            Market Cycle: {marketState.name}
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-slate-400 font-mono tabular-nums">
            Annual Appreciation: <span className={marketState.appreciationRateAnnual >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {formatPercent(marketState.appreciationRateAnnual * 100, 1)}/yr
            </span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-slate-400 font-mono tabular-nums">
            Benchmark 30Y Loan Rate: <span className="text-amber-300">{marketState.benchmarkMortgageRate}%</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-slate-500">
            {marketState.description}
          </div>
        </div>

        {/* Action Strategy Shortcuts */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              playClickSound();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{showHeatmap ? 'Hide Heatmap' : 'Show Demand Heatmap'}</span>
          </button>

          <button
            onClick={onOpenRefinance}
            className="px-3.5 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <DollarSign className="w-3.5 h-3.5" />
            Cash-Out Refinance
          </button>

          <button
            onClick={onOpenMarketplace}
            className="px-3.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            Buy New Property
          </button>
        </div>
      </div>

      {/* Visual Rental Demand vs Supply Heatmap */}
      {showHeatmap && (
        <MarketDemandHeatmap
          marketState={marketState}
          properties={properties}
          onOpenMarketplace={onOpenMarketplace}
        />
      )}
    </div>
  );
};
