import React, { useState } from 'react';
import { MarketCatalogItem, PROPERTY_CATALOG } from '../data/marketProperties';
import { MarketState, Property } from '../types/game';
import {
  formatCurrency,
  formatPercent,
  calculateMonthlyMortgagePayment,
} from '../utils/calculator';
import {
  X,
  Building,
  Building2,
  Home,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Percent,
  Sparkles,
} from 'lucide-react';
import { playCashSound, playClickSound } from '../utils/audio';

interface MarketplaceModalProps {
  cash: number;
  creditScore: number;
  marketState: MarketState;
  ownedPropertyIds: string[];
  onClose: () => void;
  onPurchaseProperty: (
    catalogItem: MarketCatalogItem,
    downPayment: number,
    mortgageAmount: number,
    annualInterestRate: number,
    termMonths: number
  ) => void;
  onOpenRefinance: () => void;
}

export const MarketplaceModal: React.FC<MarketplaceModalProps> = ({
  cash,
  creditScore,
  marketState,
  ownedPropertyIds,
  onClose,
  onPurchaseProperty,
  onOpenRefinance,
}) => {
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedProperty, setSelectedProperty] = useState<MarketCatalogItem | null>(null);
  const [financingType, setFinancingType] = useState<'mortgage' | 'all_cash'>('mortgage');

  // Filter out already purchased ones (unless commercial/multi that can be bought or replicate)
  const availableItems = PROPERTY_CATALOG.filter((item) => {
    const tierMatch = selectedTier === 'all' || item.tier === selectedTier;
    return tierMatch;
  });

  // Mortgage rate based on market state benchmark and borrower credit score
  const creditDiscount = creditScore >= 750 ? -0.25 : creditScore < 680 ? 0.5 : 0;
  const mortgageRate = Number(
    Math.max(4.5, marketState.benchmarkMortgageRate + creditDiscount).toFixed(2)
  );

  const calculateDealMetrics = (item: MarketCatalogItem) => {
    const isCommercial = item.tier >= 4;
    const downPaymentPercent = isCommercial ? 25 : 20; // 25% for commercial, 20% for residential
    const minDownPayment = Math.round(item.basePrice * (downPaymentPercent / 100));
    const closingCosts = Math.round(item.basePrice * 0.02); // 2% closing costs
    const totalCashNeeded = minDownPayment + closingCosts;

    const loanAmount = item.basePrice - minDownPayment;
    const monthlyMortgagePmt = calculateMonthlyMortgagePayment(loanAmount, mortgageRate, 360);

    const monthlyTaxes = Math.round((item.basePrice * item.propertyTaxRateAnnual) / 12);
    const monthlyInsurance = item.monthlyInsuranceCost;
    const monthlyMaintenance = item.baseMaintenanceCost;
    const totalMonthlyExpenses = monthlyTaxes + monthlyInsurance + monthlyMaintenance;

    const grossRent = item.units * item.marketRentPerUnit;
    const projectedNetCashFlow = grossRent - totalMonthlyExpenses - monthlyMortgagePmt;
    const allCashNetCashFlow = grossRent - totalMonthlyExpenses;

    const capRate = ((grossRent - totalMonthlyExpenses) * 12 / item.basePrice) * 100;

    return {
      downPaymentPercent,
      minDownPayment,
      closingCosts,
      totalCashNeeded,
      loanAmount,
      monthlyMortgagePmt,
      totalMonthlyExpenses,
      grossRent,
      projectedNetCashFlow,
      allCashNetCashFlow,
      capRate,
      canAffordMortgage: cash >= totalCashNeeded,
      canAffordCash: cash >= item.basePrice + closingCosts,
    };
  };

  const handleBuy = (item: MarketCatalogItem) => {
    const metrics = calculateDealMetrics(item);

    if (financingType === 'mortgage') {
      if (cash < metrics.totalCashNeeded) {
        alert('Insufficient cash for down payment and closing costs!');
        return;
      }
      onPurchaseProperty(
        item,
        metrics.totalCashNeeded,
        metrics.loanAmount,
        mortgageRate,
        360
      );
    } else {
      if (cash < item.basePrice + metrics.closingCosts) {
        alert('Insufficient cash to purchase all-cash!');
        return;
      }
      onPurchaseProperty(
        item,
        item.basePrice + metrics.closingCosts,
        0,
        0,
        0
      );
    }

    playCashSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>PROPERTY ACQUISITIONS MARKETPLACE</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Acquisitions & Expansion Exchange
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Acquire new properties to expand your cashflow from starter bungalows to multi-family flats, commercial plazas, and skyscrapers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Available Liquid Funds</div>
              <div className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {formatCurrency(cash)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tier Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mr-2">
            Asset Tier:
          </span>
          {[
            { id: 'all', label: 'All Listings' },
            { id: 1, label: 'Tier 1: Starter Homes' },
            { id: 2, label: 'Tier 2: Multi-Family (2-4 Units)' },
            { id: 3, label: 'Tier 3: Apartment Complexes' },
            { id: 4, label: 'Tier 4: Commercial Retail & Plazas' },
            { id: 5, label: 'Tier 5: Commercial Industrial & Towers' },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => {
                setSelectedTier(tier.id as number | 'all');
                playClickSound();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedTier === tier.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableItems.map((item) => {
              const metrics = calculateDealMetrics(item);
              const isOwned = ownedPropertyIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-sky-400">
                        {item.tierName} (Tier {item.tier})
                      </span>
                      <span className="font-mono tabular-nums">{item.units} {item.units === 1 ? 'Unit' : 'Units'}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.address}, {item.city} · {item.squareFeet.toLocaleString()} sq ft
                    </p>

                    {/* Price & Rent Bar */}
                    <div className="mt-3.5 p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5 text-xs font-mono tabular-nums">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">List Price:</span>
                        <span className="text-base font-bold text-white">{formatCurrency(item.basePrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Down Payment ({metrics.downPaymentPercent}%):</span>
                        <span className="text-amber-300 font-medium">
                          {formatCurrency(metrics.minDownPayment)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-400">
                        <span>Total Cash Needed (+2% closing):</span>
                        <span className={metrics.canAffordMortgage ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {formatCurrency(metrics.totalCashNeeded)}
                        </span>
                      </div>
                    </div>

                    {/* Cash Flow Projection */}
                    <div className="mt-3 p-3 rounded-lg bg-slate-950 border border-slate-800/60 text-xs font-mono tabular-nums space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Gross Market Rent:</span>
                        <span className="text-emerald-400 font-medium">{formatCurrency(metrics.grossRent)}/mo</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Mortgage Pmt ({mortgageRate}%):</span>
                        <span className="text-rose-400">-{formatCurrency(metrics.monthlyMortgagePmt)}/mo</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Expenses (Tax, Ins, Maint):</span>
                        <span className="text-rose-400">-{formatCurrency(metrics.totalMonthlyExpenses)}/mo</span>
                      </div>
                      <div className="h-px bg-slate-800 my-1" />
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-white">Est. Net Cash Flow:</span>
                        <span className={metrics.projectedNetCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {formatCurrency(metrics.projectedNetCashFlow)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.features.map((feat) => (
                        <span
                          key={feat}
                          className="text-[11px] text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Buy Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    {metrics.canAffordMortgage ? (
                      <button
                        onClick={() => handleBuy(item)}
                        className="w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                      >
                        <span>Buy with Mortgage ({formatCurrency(metrics.totalCashNeeded)} Down)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <button
                          disabled
                          className="w-full py-2 text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 rounded-lg cursor-not-allowed opacity-60"
                        >
                          Short {formatCurrency(metrics.totalCashNeeded - cash)} Cash
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onOpenRefinance();
                          }}
                          className="w-full py-1.5 text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Refinance Existing Equity For Down Payment</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400">
            Current Borrowing Rate: <strong className="text-amber-300 font-mono tabular-nums">{mortgageRate}% 30-Year Fixed</strong> (Based on Credit Score {creditScore})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};
