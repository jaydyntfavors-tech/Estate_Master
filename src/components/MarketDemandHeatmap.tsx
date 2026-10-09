import React, { useState } from 'react';
import { MarketState, Property } from '../types/game';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { Flame, Compass, ArrowUpRight, TrendingUp, Info, Building2 } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface MarketDemandHeatmapProps {
  marketState: MarketState;
  properties: Property[];
  onOpenMarketplace: () => void;
}

interface HeatmapItem {
  id: string;
  name: string;
  categoryLabel: string;
  demandIndex: number; // 0 - 100 base score
  supplyIndex: number; // 0 - 100 availability
  demandSupplyRatio: number; // demand / supply (e.g. 1.45)
  avgRentGrowth: number; // % annual
  marketVacancyRate: number; // %
  avgCapRate: number; // %
  playerOwnedCount: number;
  playerUnitsCount: number;
  recommendation: string;
}

export const MarketDemandHeatmap: React.FC<MarketDemandHeatmapProps> = ({
  marketState,
  properties,
  onOpenMarketplace,
}) => {
  const [viewMode, setViewMode] = useState<'tier' | 'city'>('tier');
  const [selectedItem, setSelectedItem] = useState<HeatmapItem | null>(null);

  // Macro adjustments
  const cycleMultiplier =
    marketState.cycle === 'boom'
      ? 1.25
      : marketState.cycle === 'steady'
      ? 1.0
      : marketState.cycle === 'cooling'
      ? 0.9
      : 0.8;

  // 1. Tier Data Calculation
  const tierData: HeatmapItem[] = [
    {
      id: 'tier-1',
      name: 'Tier 1: Starter Residential',
      categoryLabel: 'Single Family & Studio Lofts',
      demandIndex: Math.round(82 * cycleMultiplier),
      supplyIndex: 68,
      demandSupplyRatio: Number(((82 * cycleMultiplier) / 68).toFixed(2)),
      avgRentGrowth: 4.8 * cycleMultiplier,
      marketVacancyRate: 3.2 / cycleMultiplier,
      avgCapRate: 6.8,
      playerOwnedCount: properties.filter((p) => p.tier === 1).length,
      playerUnitsCount: properties
        .filter((p) => p.tier === 1)
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Stable foundational demand. High occupancy reliability with minimal turnover friction.',
    },
    {
      id: 'tier-2',
      name: 'Tier 2: Multi-Family (2-4 Units)',
      categoryLabel: 'Duplexes, Triplexes & Fourplexes',
      demandIndex: Math.round(94 * cycleMultiplier),
      supplyIndex: 64,
      demandSupplyRatio: Number(((94 * cycleMultiplier) / 64).toFixed(2)),
      avgRentGrowth: 5.6 * cycleMultiplier,
      marketVacancyRate: 2.8 / cycleMultiplier,
      avgCapRate: 7.4,
      playerOwnedCount: properties.filter((p) => p.tier === 2).length,
      playerUnitsCount: properties
        .filter((p) => p.tier === 2)
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Prime sweet spot! Severe shortage of 2-4 unit family flats gives landlords strong pricing power.',
    },
    {
      id: 'tier-3',
      name: 'Tier 3: Apartment Complexes',
      categoryLabel: '8 to 24 Unit Communities',
      demandIndex: Math.round(88 * cycleMultiplier),
      supplyIndex: 72,
      demandSupplyRatio: Number(((88 * cycleMultiplier) / 72).toFixed(2)),
      avgRentGrowth: 5.2 * cycleMultiplier,
      marketVacancyRate: 4.1 / cycleMultiplier,
      avgCapRate: 7.8,
      playerOwnedCount: properties.filter((p) => p.tier === 3).length,
      playerUnitsCount: properties
        .filter((p) => p.tier === 3)
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'High institutional tenant volume. Economies of scale keep operational cost drag low.',
    },
    {
      id: 'tier-4',
      name: 'Tier 4: Commercial Retail & Offices',
      categoryLabel: 'Strip Malls, Plazas & Medical Suites',
      demandIndex: Math.round(
        marketState.cycle === 'recession' ? 62 : 84 * cycleMultiplier
      ),
      supplyIndex: 70,
      demandSupplyRatio: Number(
        (
          (marketState.cycle === 'recession' ? 62 : 84 * cycleMultiplier) /
          70
        ).toFixed(2)
      ),
      avgRentGrowth: 4.2 * cycleMultiplier,
      marketVacancyRate: 5.4 / cycleMultiplier,
      avgCapRate: 8.5,
      playerOwnedCount: properties.filter((p) => p.tier === 4).length,
      playerUnitsCount: properties
        .filter((p) => p.tier === 4)
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Multi-year corporate tenant leases. Low maintenance overhead due to commercial tenant build-outs.',
    },
    {
      id: 'tier-5',
      name: 'Tier 5: Commercial Industrial & Towers',
      categoryLabel: 'Logistics Warehouses & Glass Towers',
      demandIndex: Math.round(
        marketState.cycle === 'boom'
          ? 115
          : marketState.cycle === 'recession'
          ? 58
          : 78
      ),
      supplyIndex: 55,
      demandSupplyRatio: Number(
        (
          (marketState.cycle === 'boom'
            ? 115
            : marketState.cycle === 'recession'
            ? 58
            : 78) / 55
        ).toFixed(2)
      ),
      avgRentGrowth: 6.8 * cycleMultiplier,
      marketVacancyRate: 3.8 / cycleMultiplier,
      avgCapRate: 9.2,
      playerOwnedCount: properties.filter((p) => p.tier === 5).length,
      playerUnitsCount: properties
        .filter((p) => p.tier === 5)
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'High-cube logistics and trophy downtown towers. Maximum rental cashflow velocity and asset prestige.',
    },
  ];

  // 2. City / District Data Calculation
  const cityData: HeatmapItem[] = [
    {
      id: 'city-riverdale',
      name: 'Suburban Riverdale',
      categoryLabel: 'High-rated school district & parks',
      demandIndex: Math.round(92 * cycleMultiplier),
      supplyIndex: 65,
      demandSupplyRatio: Number(((92 * cycleMultiplier) / 65).toFixed(2)),
      avgRentGrowth: 5.1 * cycleMultiplier,
      marketVacancyRate: 2.4 / cycleMultiplier,
      avgCapRate: 7.1,
      playerOwnedCount: properties.filter((p) => p.city.includes('Riverdale')).length,
      playerUnitsCount: properties
        .filter((p) => p.city.includes('Riverdale'))
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Family migration boom. Steady, low-risk residential tenants who sign long multi-year leases.',
    },
    {
      id: 'city-downtown',
      name: 'Downtown Core',
      categoryLabel: 'Metro transit hubs & financial district',
      demandIndex: Math.round(
        marketState.cycle === 'recession' ? 70 : 96 * cycleMultiplier
      ),
      supplyIndex: 78,
      demandSupplyRatio: Number(
        (
          (marketState.cycle === 'recession' ? 70 : 96 * cycleMultiplier) /
          78
        ).toFixed(2)
      ),
      avgRentGrowth: 6.2 * cycleMultiplier,
      marketVacancyRate: 4.5 / cycleMultiplier,
      avgCapRate: 7.9,
      playerOwnedCount: properties.filter((p) => p.city.includes('Downtown')).length,
      playerUnitsCount: properties
        .filter((p) => p.city.includes('Downtown'))
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'High-density walkability. Strong command over young professionals and banking tenants.',
    },
    {
      id: 'city-historic',
      name: 'Historic & Highland District',
      categoryLabel: 'Victorian architecture & cultural rowhouses',
      demandIndex: Math.round(85 * cycleMultiplier),
      supplyIndex: 62,
      demandSupplyRatio: Number(((85 * cycleMultiplier) / 62).toFixed(2)),
      avgRentGrowth: 4.5 * cycleMultiplier,
      marketVacancyRate: 3.1 / cycleMultiplier,
      avgCapRate: 7.3,
      playerOwnedCount: properties.filter((p) =>
        p.city.includes('Historic') || p.city.includes('Highland')
      ).length,
      playerUnitsCount: properties
        .filter((p) => p.city.includes('Historic') || p.city.includes('Highland'))
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Zoning restrictions strictly limit new supply, shielding existing landlords from competition.',
    },
    {
      id: 'city-northridge',
      name: 'Northridge & Uptown Hills',
      categoryLabel: 'Garden apartment suburban masterplans',
      demandIndex: Math.round(81 * cycleMultiplier),
      supplyIndex: 74,
      demandSupplyRatio: Number(((81 * cycleMultiplier) / 74).toFixed(2)),
      avgRentGrowth: 4.1 * cycleMultiplier,
      marketVacancyRate: 4.2 / cycleMultiplier,
      avgCapRate: 7.6,
      playerOwnedCount: properties.filter((p) =>
        p.city.includes('Northridge') || p.city.includes('Uptown')
      ).length,
      playerUnitsCount: properties
        .filter((p) => p.city.includes('Northridge') || p.city.includes('Uptown'))
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Moderate supply growth. Price at market median to maintain 98%+ occupancy without turnover.',
    },
    {
      id: 'city-tech-commercial',
      name: 'Commercial & Tech Corridor',
      categoryLabel: 'Innovation hubs & logistics freeport',
      demandIndex: Math.round(
        marketState.cycle === 'boom'
          ? 112
          : marketState.cycle === 'recession'
          ? 60
          : 86
      ),
      supplyIndex: 66,
      demandSupplyRatio: Number(
        (
          (marketState.cycle === 'boom'
            ? 112
            : marketState.cycle === 'recession'
            ? 60
            : 86) / 66
        ).toFixed(2)
      ),
      avgRentGrowth: 6.9 * cycleMultiplier,
      marketVacancyRate: 3.6 / cycleMultiplier,
      avgCapRate: 8.8,
      playerOwnedCount: properties.filter((p) =>
        p.city.includes('Commercial') ||
        p.city.includes('Tech') ||
        p.city.includes('Industrial') ||
        p.city.includes('Medical')
      ).length,
      playerUnitsCount: properties
        .filter((p) =>
          p.city.includes('Commercial') ||
          p.city.includes('Tech') ||
          p.city.includes('Industrial') ||
          p.city.includes('Medical')
        )
        .reduce((sum, p) => sum + p.units, 0),
      recommendation: 'Rapid enterprise corporate expansion. High rent growth potential when macro economy is strong.',
    },
  ];

  const currentDataset = viewMode === 'tier' ? tierData : cityData;

  // Helper to get heat color & label based on Demand/Supply ratio
  const getHeatDetails = (ratio: number) => {
    if (ratio >= 1.35) {
      return {
        bg: 'bg-rose-500/20 border-rose-500/50',
        text: 'text-rose-400',
        barColor: 'bg-gradient-to-r from-orange-500 to-rose-500',
        label: 'Surging Demand (Severe Shortage)',
        badge: 'Landlord Hotspot',
      };
    }
    if (ratio >= 1.15) {
      return {
        bg: 'bg-amber-500/15 border-amber-500/40',
        text: 'text-amber-400',
        barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
        label: 'Elevated Demand',
        badge: 'Seller Advantage',
      };
    }
    if (ratio >= 0.98) {
      return {
        bg: 'bg-emerald-500/15 border-emerald-500/40',
        text: 'text-emerald-400',
        barColor: 'bg-emerald-500',
        label: 'Balanced Equilibrium',
        badge: 'Healthy Market',
      };
    }
    return {
      bg: 'bg-slate-800/40 border-slate-700/50',
      text: 'text-sky-400',
      barColor: 'bg-sky-500',
      label: 'Saturated Supply (Tenant Market)',
      badge: 'Competitive',
    };
  };

  return (
    <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm space-y-5">
      {/* Heatmap Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-rose-500/20" />
            <span>Rental Market Demand vs Supply Heatmap</span>
          </div>
          <h3 className="text-base font-bold text-white mt-1">
            Rental Pressure & Opportunity Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify which property tiers and cities have high rental demand relative to available supply to maximize your rent pricing power.
          </p>
        </div>

        {/* Segmented Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setViewMode('tier');
              setSelectedItem(null);
              playClickSound();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === 'tier'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By Property Tier
          </button>
          <button
            onClick={() => {
              setViewMode('city');
              setSelectedItem(null);
              playClickSound();
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              viewMode === 'city'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            By City / Metro District
          </button>
        </div>
      </div>

      {/* Heat Intensity Legend Bar */}
      <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 font-medium flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-slate-400" />
          <span>Demand/Supply Heat Index:</span>
        </span>

        <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
            <span className="text-slate-400">Cool / Saturated (&lt;0.98x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
            <span className="text-slate-400">Balanced (1.00x - 1.14x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            <span className="text-slate-400">Elevated (1.15x - 1.34x)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
            <span className="text-rose-400 font-medium">Surging Shortage (1.35x+)</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {currentDataset.map((item) => {
          const heat = getHeatDetails(item.demandSupplyRatio);
          const isSelected = selectedItem?.id === item.id;
          // Percentage fill for relative visual bar: scale 0.7x - 1.6x into 20% - 100%
          const barWidthPercent = Math.min(
            100,
            Math.max(25, Math.round(((item.demandSupplyRatio - 0.7) / 0.9) * 100))
          );

          return (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(isSelected ? null : item);
                playClickSound();
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-slate-900 shadow-md ring-1 ring-emerald-500/50'
                  : `border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60`
              }`}
            >
              {/* Top Row: Name and Ratio Badge */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {item.categoryLabel}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-base font-bold font-mono tabular-nums ${heat.text}`}
                    >
                      {item.demandSupplyRatio.toFixed(2)}x
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Demand/Supply
                    </div>
                  </div>
                </div>

                {/* Heatmap Visual Gauge Bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-mono tabular-nums text-slate-400">
                    <span>Demand: {item.demandIndex}</span>
                    <span className={heat.text}>{heat.label}</span>
                    <span>Supply: {item.supplyIndex}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${heat.barColor}`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                  </div>
                </div>

                {/* Key Fundamental Metrics Strip */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 text-[11px] font-mono tabular-nums pt-2.5 border-t border-slate-800/60">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Rent Growth</span>
                    <span className="text-emerald-400 font-semibold">
                      +{formatPercent(item.avgRentGrowth, 1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Vacancy Rate</span>
                    <span className="text-slate-300">
                      {formatPercent(item.marketVacancyRate, 1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Cap Rate</span>
                    <span className="text-amber-300">
                      {formatPercent(item.avgCapRate, 1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Exposure Row */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Your Holdings:{' '}
                  <strong className={item.playerOwnedCount > 0 ? 'text-white' : 'text-slate-600'}>
                    {item.playerOwnedCount} {item.playerOwnedCount === 1 ? 'prop' : 'props'} (
                    {item.playerUnitsCount} units)
                  </strong>
                </span>
                <span className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-0.5">
                  <span>Details</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Item Detail Insight Callout */}
      {selectedItem && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white text-sm">{selectedItem.name}</strong>
                <span className="text-slate-400 ml-2 font-mono">
                  Demand-to-Supply Ratio: {selectedItem.demandSupplyRatio.toFixed(2)}x
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onOpenMarketplace();
                playClickSound();
              }}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Scout Marketplace For Deals</span>
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed">
            <strong>Investment Strategy:</strong> {selectedItem.recommendation} In the current{' '}
            <span className="text-white font-medium">{marketState.name}</span>, landlords with
            holdings in this sector can expect {formatPercent(selectedItem.avgRentGrowth, 1)} annual
            rent growth with market vacancy around {formatPercent(selectedItem.marketVacancyRate, 1)}
            .
          </p>
        </div>
      )}
    </div>
  );
};
