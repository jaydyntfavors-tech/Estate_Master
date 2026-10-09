import React from 'react';
import { PlayerStats, Property } from '../types/game';
import { formatCurrency, formatPercent, getPropertyFinancialBreakdown } from '../utils/calculator';
import { Award, Trophy, Crown, Heart, Building, Sparkles, X } from 'lucide-react';
import { playSuccessSound } from '../utils/audio';

interface RetirementLegacyModalProps {
  ageYears: number;
  netWorth: number;
  cash: number;
  properties: Property[];
  stats: PlayerStats;
  onContinueSandbox: () => void;
  onNewGame: () => void;
}

export const RetirementLegacyModal: React.FC<RetirementLegacyModalProps> = ({
  ageYears,
  netWorth,
  cash,
  properties,
  stats,
  onContinueSandbox,
  onNewGame,
}) => {
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const totalPassiveRent = properties.reduce((sum, p) => {
    const b = getPropertyFinancialBreakdown(p);
    return sum + b.netCashFlow;
  }, 0);

  // Determine Legacy Rank
  let rank = 'B-Tier: Independent Landlord';
  let badgeColor = 'text-sky-400 border-sky-500/40 bg-sky-950/20';
  let summary =
    'You successfully built a resilient portfolio of cashflowing real estate and secured a comfortable retirement.';

  if (netWorth >= 15000000) {
    rank = 'S-Tier: Legendary Real Estate Titan';
    badgeColor = 'text-amber-300 border-amber-500/50 bg-amber-950/30';
    summary =
      'You ascended to the highest echelon of commercial and multi-family real estate. Your dynasty spans city skylines and generates vast generational wealth.';
  } else if (netWorth >= 5000000) {
    rank = 'A-Tier: Multi-Family Mogul';
    badgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/30';
    summary =
      'You mastered the BRRRR method and scaled into apartment complexes, securing financial freedom decades before conventional retirement.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-amber-950/20 flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Life Milestone · Age {ageYears} Golden Years
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Retirement & Empire Hall of Fame
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              At age {ageYears}, working a standard 9-to-5 job is officially behind you. Your real estate holdings and equity now carry your entire livelihood as true passive income.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Rank Badge */}
          <div className={`p-4 rounded-xl border text-center space-y-1 ${badgeColor}`}>
            <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Investor Legacy Classification
            </div>
            <div className="text-xl font-bold font-mono tracking-tight">{rank}</div>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">{summary}</p>
          </div>

          {/* Empire Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono tabular-nums">
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Final Net Worth</span>
              <div className="text-base font-bold text-emerald-400 mt-1">
                {formatCurrency(netWorth)}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Passive Monthly Cashflow</span>
              <div className="text-base font-bold text-white mt-1">
                {formatCurrency(totalPassiveRent)}/mo
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Total Rentable Doors</span>
              <div className="text-base font-bold text-sky-400 mt-1">
                {totalUnits} Units
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Lifetime Rents Collected</span>
              <div className="text-base font-bold text-white mt-1">
                {formatCurrency(stats.totalRentCollected)}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Career Wages Earned</span>
              <div className="text-base font-bold text-white mt-1">
                {formatCurrency(stats.totalSalaryEarned)}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Appreciation Built</span>
              <div className="text-base font-bold text-amber-400 mt-1">
                {formatCurrency(stats.totalAppreciationGained)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 text-xs">
          <button
            onClick={onNewGame}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            Start New Life Career (Age 18)
          </button>

          <button
            onClick={onContinueSandbox}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all"
          >
            Continue in Endless Tycoon Mode
          </button>
        </div>
      </div>
    </div>
  );
};
