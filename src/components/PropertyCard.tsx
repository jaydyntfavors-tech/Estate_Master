import React from 'react';
import { Property } from '../types/game';
import {
  formatCurrency,
  formatPercent,
  getPropertyFinancialBreakdown,
  calculateBreakEvenRentPerUnit,
} from '../utils/calculator';
import {
  Wrench,
  DollarSign,
  SlidersHorizontal,
  Home,
  Building,
  Building2,
  TrendingUp,
  AlertTriangle,
  Coins,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface PropertyCardProps {
  property: Property;
  onInspect: (property: Property) => void;
  onRefinance: (property: Property) => void;
  onQuickRenovate: (property: Property) => void;
  onUpdateRent: (propertyId: string, newRent: number) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onInspect,
  onRefinance,
  onQuickRenovate,
  onUpdateRent,
}) => {
  const breakdown = getPropertyFinancialBreakdown(property);
  const breakEvenRent = calculateBreakEvenRentPerUnit(property);

  // Maximum loan borrowing capacity at 75% LTV
  const maxBorrowable = property.currentMarketValue * 0.75;
  const availableCashOut = Math.max(0, Math.round(maxBorrowable - breakdown.totalDebt));

  const getTierIcon = () => {
    switch (property.category) {
      case 'starter_residential':
        return <Home className="w-4 h-4 text-emerald-400" />;
      case 'multi_family':
        return <Building className="w-4 h-4 text-sky-400" />;
      case 'apartment_complex':
        return <Building2 className="w-4 h-4 text-indigo-400" />;
      case 'commercial_retail':
      case 'commercial_office':
      case 'commercial_industrial':
        return <Building2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Home className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getCategoryLabel = () => {
    switch (property.category) {
      case 'starter_residential':
        return 'Starter Residential';
      case 'multi_family':
        return 'Multi-Family';
      case 'apartment_complex':
        return 'Apartment Complex';
      case 'commercial_retail':
        return 'Commercial Retail';
      case 'commercial_office':
        return 'Commercial Office';
      case 'commercial_industrial':
        return 'Industrial Logistics';
      default:
        return 'Residential';
    }
  };

  const isProfitable = breakdown.netCashFlow >= 0;
  const isBelowBreakEven = property.actualRentPerUnit < breakEvenRent;

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all shadow-sm flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              {getTierIcon()}
              <span>{getCategoryLabel()}</span>
              <span aria-hidden="true">·</span>
              <span>Tier {property.tier}</span>
              <span aria-hidden="true">·</span>
              <span>{property.units} {property.units === 1 ? 'Unit' : 'Units'}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 tracking-tight">
              {property.name}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {property.address}, {property.city} · {property.squareFeet.toLocaleString()} sq ft
            </p>
          </div>

          {/* Quick Cash Flow Highlight */}
          <div className="text-right shrink-0">
            <div className="text-xs text-slate-400 font-medium">Monthly Net Flow</div>
            <div
              className={`text-lg font-bold font-mono tabular-nums ${
                isProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(breakdown.netCashFlow)}/mo
            </div>
            <div className="text-[11px] text-slate-500 font-mono tabular-nums">
              Cap Rate: {formatPercent(breakdown.capRate, 1)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Body Grid */}
      <div className="p-5 space-y-4.5 flex-1">
        {/* Valuation & Condition Strip */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
          <div>
            <span className="text-slate-400">Current Market Value:</span>
            <div className="font-bold font-mono tabular-nums text-white text-sm mt-0.5">
              {formatCurrency(property.currentMarketValue)}
            </div>
            <div className="text-[10px] text-slate-500 font-mono tabular-nums">
              Purchased for {formatCurrency(property.purchasePrice)} (
              {property.accumulatedAppreciation >= 0 ? '+' : ''}
              {formatCurrency(property.accumulatedAppreciation)})
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Physical Condition:</span>
              <span
                className={`font-mono font-semibold tabular-nums ${
                  property.condition >= 80
                    ? 'text-emerald-400'
                    : property.condition >= 60
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {property.condition}%
              </span>
            </div>
            {/* Condition Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full transition-all duration-300 ${
                  property.condition >= 80
                    ? 'bg-emerald-500'
                    : property.condition >= 60
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, property.condition))}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              {property.condition >= 80
                ? 'Excellent · Low maintenance drag'
                : property.condition >= 60
                ? 'Average wear · Routine fixes needed'
                : 'Deferred repairs · Hurting tenant satisfaction'}
            </div>
          </div>
        </div>

        {/* Rent & Break-Even Interactive Slider Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rent Charged / Unit:</span>
            </div>
            <div className="font-bold font-mono tabular-nums text-white text-sm">
              {formatCurrency(property.actualRentPerUnit)}/mo
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min={Math.max(200, Math.round(property.marketRentPerUnit * 0.5))}
              max={Math.round(property.marketRentPerUnit * 1.6)}
              step={25}
              value={property.actualRentPerUnit}
              onChange={(e) => {
                onUpdateRent(property.id, Number(e.target.value));
              }}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>Min: {formatCurrency(Math.round(property.marketRentPerUnit * 0.5))}</span>
              <span className="text-amber-400">
                Break-Even: {formatCurrency(breakEvenRent)}
              </span>
              <span>Market: {formatCurrency(property.marketRentPerUnit)}</span>
            </div>
          </div>

          {/* Rent Status & Occupancy Feedback */}
          <div className="text-[11px] flex items-center justify-between text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80">
            <div className="flex items-center gap-1.5">
              {isBelowBreakEven ? (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className={isBelowBreakEven ? 'text-rose-400 font-medium' : 'text-slate-300'}>
                {isBelowBreakEven
                  ? 'Below Break-Even: Losing money each month!'
                  : breakdown.pricingFeedback}
              </span>
            </div>
            <span className="font-mono tabular-nums shrink-0 text-slate-300">
              {breakdown.occupiedUnits}/{property.units} occupied ({formatPercent(breakdown.occupancyRate * 100, 0)})
            </span>
          </div>
        </div>

        {/* Expenses & Debt Overview */}
        <div className="text-xs space-y-1 pt-1 border-t border-slate-800/60 font-mono tabular-nums">
          <div className="flex justify-between text-slate-400">
            <span>Gross Monthly Rent Collected:</span>
            <span className="text-emerald-400 font-medium">{formatCurrency(breakdown.grossRentCollected)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Operating Expenses (Tax, Ins, Maint):</span>
            <span className="text-rose-400">-{formatCurrency(breakdown.operatingExpenses.totalOperatingExpenses)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Debt Service (Mortgage & HELOCs):</span>
            <span className="text-rose-400">-{formatCurrency(breakdown.totalDebtService)}</span>
          </div>
        </div>

        {/* Equity & Leverage Quick Strip */}
        <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Available Equity Built:</span>
            </span>
            <span className="font-bold font-mono tabular-nums text-emerald-400">
              {formatCurrency(breakdown.equity)}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Borrowable (75% LTV):</span>
            <span className={availableCashOut > 0 ? 'text-amber-300 font-medium' : 'text-slate-500'}>
              {availableCashOut > 0 ? `${formatCurrency(availableCashOut)} Cash-Out Available` : 'Maxed out'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3.5 bg-slate-950/90 border-t border-slate-800/80 grid grid-cols-3 gap-2">
        {/* Inspect / Deep Dive */}
        <button
          onClick={() => {
            onInspect(property);
            playClickSound();
          }}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          <span>Inspect</span>
        </button>

        {/* Refinance Equity */}
        <button
          onClick={() => {
            onRefinance(property);
            playClickSound();
          }}
          disabled={availableCashOut <= 5000}
          title={
            availableCashOut <= 5000
              ? 'Insufficient equity to borrow against'
              : 'Take cash-out loan against this property'
          }
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center justify-center gap-1.5 ${
            availableCashOut > 5000
              ? 'text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30'
              : 'text-slate-600 bg-slate-900 border-slate-800 cursor-not-allowed opacity-60'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Cash-Out</span>
        </button>

        {/* Renovate */}
        <button
          onClick={() => {
            onQuickRenovate(property);
            playClickSound();
          }}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <Wrench className="w-3.5 h-3.5 text-emerald-400" />
          <span>Maintain</span>
        </button>
      </div>
    </div>
  );
};
