import React from 'react';
import { MonthlyFinancialSummary, PlayerStats, Property } from '../types/game';
import { formatCurrency, formatPercent } from '../utils/calculator';
import { DollarSign, Landmark, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

interface LedgerViewProps {
  stats: PlayerStats;
  history: MonthlyFinancialSummary[];
  properties: Property[];
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  stats,
  history,
  properties,
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <div className="space-y-6">
      {/* Cumulative Lifetime Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Lifetime Rent Collected</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(stats.totalRentCollected)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cumulative gross tenant collections</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Lifetime Career Salary</div>
          <div className="text-xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {formatCurrency(stats.totalSalaryEarned)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Cumulative paychecks earned from employment</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Debt Principal Paid Down</div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {formatCurrency(stats.totalMortgagePaid)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Principal equity buildup via amortization</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400 font-medium">Market Appreciation Gained</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1 tabular-nums">
            {formatCurrency(stats.totalAppreciationGained)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Asset value growth above purchase cost</div>
        </div>
      </div>

      {/* Monthly Settlement Historical Ledger Table */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Monthly Settlement Statement History
          </h3>
          <span className="text-xs text-slate-400">
            {history.length} Monthly Closing Statements
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
            No monthly closures yet. Advance to the next month to generate your first financial statement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Date & Age</th>
                  <th className="py-2.5 px-3 text-right">Job Salary</th>
                  <th className="py-2.5 px-3 text-right">Gross Rent</th>
                  <th className="py-2.5 px-3 text-right">Debt Service</th>
                  <th className="py-2.5 px-3 text-right">Net Flow</th>
                  <th className="py-2.5 px-3 text-right">Ending Cash</th>
                  <th className="py-2.5 px-3 text-right">Net Worth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono tabular-nums">
                {[...history].reverse().map((item, idx) => {
                  const mName = monthNames[(item.month - 1) % 12];
                  const totalDebt = item.seniorMortgagePayments + item.equityLoanPayments + item.studentLoanPayments;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-sans text-slate-300 font-medium">
                        {mName} {item.year} · Age {item.ageYears || 18}
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">
                        +{formatCurrency(item.jobSalaryEarned || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-sky-400">
                        +{formatCurrency(item.grossRentalIncome)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-rose-400">
                        -{formatCurrency(totalDebt)}
                      </td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          item.totalMonthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(item.totalMonthlyCashFlow)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {formatCurrency(item.endingCash)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300 font-semibold">
                        {formatCurrency(item.netWorth)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
