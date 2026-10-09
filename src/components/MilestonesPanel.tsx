import React from 'react';
import { PlayerStats, Property } from '../types/game';
import { formatCurrency, getPropertyTotalDebt } from '../utils/calculator';
import { Award, CheckCircle2, Lock, Sparkles, Building2, TrendingUp } from 'lucide-react';

interface MilestonesPanelProps {
  stats: PlayerStats;
  properties: Property[];
  cash: number;
}

export const MilestonesPanel: React.FC<MilestonesPanelProps> = ({
  stats,
  properties,
  cash,
}) => {
  const totalValue = properties.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const totalDebt = properties.reduce((sum, p) => sum + getPropertyTotalDebt(p), 0);
  const netWorth = totalValue - totalDebt + cash;
  const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
  const hasCashOutLoan = properties.some((p) => p.equityLoans.length > 0);
  const hasCommercial = properties.some((p) => p.tier >= 4);
  const hasSkyscraper = properties.some((p) => p.tier === 5);
  const isFullyPassive = properties.length >= 2 && properties.every((p) => !p.isSelfManaged);

  const milestones = [
    {
      id: 'm0',
      title: 'Credit Builder (700+ Score)',
      description: 'Establish a reliable credit history and break into the Good credit tier.',
      achieved: stats.creditScore >= 700,
      reward: 'Unlocks lower mortgage interest rates',
    },
    {
      id: 'm1',
      title: 'First Landlord Key',
      description: 'Acquire and manage your very first rental property.',
      achieved: properties.length >= 1,
      reward: 'Unlocks tenant lease management',
    },
    {
      id: 'm2',
      title: 'The BRRRR Operator',
      description: 'Execute your first Cash-Out Refinance to extract equity and scale.',
      achieved: hasCashOutLoan,
      reward: 'Second lien debt mastery',
    },
    {
      id: 'm3',
      title: 'Multi-Family Scale',
      description: 'Own at least 4 total residential rental units.',
      achieved: totalUnits >= 4,
      reward: 'Diversified vacancy protection',
    },
    {
      id: 'm_passive',
      title: 'True Passive Income',
      description: 'Hire professional property management across your entire multi-property portfolio.',
      achieved: isFullyPassive,
      reward: 'Zero emergency interruptions & mailbox passive cash flow',
    },
    {
      id: 'm4',
      title: 'Millionaire Net Worth',
      description: 'Surpass $1,000,000 in total net worth across properties and cash.',
      achieved: netWorth >= 1000000,
      reward: 'Preferred bank borrowing rates (-0.25%)',
    },
    {
      id: 'm5',
      title: 'Apartment Complex Mogul',
      description: 'Acquire a Tier 3 Apartment Complex (8+ residential units).',
      achieved: properties.some((p) => p.tier >= 3),
      reward: 'High unit volume economies of scale',
    },
    {
      id: 'm6',
      title: 'Commercial Transition',
      description: 'Break out of residential and acquire a Tier 4 Commercial Retail or Medical Plaza.',
      achieved: hasCommercial,
      reward: 'Commercial triple-net lease agreements',
    },
    {
      id: 'm7',
      title: 'Ten-Million Portfolio',
      description: 'Build a real estate portfolio surpassing $10,000,000 in valuation.',
      achieved: totalValue >= 10000000,
      reward: 'Institutional capital accreditation',
    },
    {
      id: 'm8',
      title: 'Skyline Titan',
      description: 'Acquire a Tier 5 Commercial Skyscraper or Global Logistics Hub.',
      achieved: hasSkyscraper,
      reward: 'Master Real Estate Tycoon status',
    },
  ];

  const completedCount = milestones.filter((m) => m.achieved).length;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Award className="w-4 h-4" />
            <span>CAREER PROGRESSION & EMPIRE MILESTONES</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Real Estate Investor Ladder</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Progress from entry residential landlord to city skyline commercial titan.
          </p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-400">Milestones Completed</div>
          <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
            {completedCount} / {milestones.length}
          </div>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
              m.achieved
                ? 'bg-slate-900/80 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950/40 border-slate-800 opacity-70'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                m.achieved
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
            >
              {m.achieved ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">{m.title}</h3>
                {m.achieved && (
                  <span className="text-[11px] font-mono font-medium text-emerald-400">
                    ACHIEVED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {m.description}
              </p>
              <div className="mt-2.5 text-[11px] text-slate-500 font-mono">
                Badge: <span className="text-slate-400">{m.reward}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
