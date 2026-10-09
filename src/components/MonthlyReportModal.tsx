import React from 'react';
import { MonthlyFinancialSummary, GameEvent } from '../types/game';
import { formatCurrency } from '../utils/calculator';
import {
  X,
  TrendingUp,
  TrendingDown,
  Building,
  CheckCircle2,
  Calendar,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface MonthlyReportModalProps {
  summary: MonthlyFinancialSummary;
  monthEvents: GameEvent[];
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  summary,
  monthEvents,
  onClose,
}) => {
  const isProfitable = summary.totalMonthlyCashFlow >= 0;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[(summary.month - 1) % 12];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>
                {monthName} {summary.year} · Age {summary.ageYears} ({summary.ageMonths} mos)
              </span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Monthly Settlement & Life Statement
            </h2>
          </div>

          <button
            onClick={() => {
              onClose();
              playClickSound();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Main Net Result Banner */}
          <div
            className={`p-5 rounded-xl border flex items-center justify-between ${
              isProfitable
                ? 'bg-emerald-950/20 border-emerald-500/40'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Net Monthly Savings</div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                  isProfitable ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatCurrency(summary.totalMonthlyCashFlow)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Net deposited after career earnings, debt & rental cashflow
              </div>
            </div>

            <div className="text-right font-mono tabular-nums text-xs">
              <div className="text-slate-400">Bank Balance</div>
              <div
                className={`text-lg font-bold mt-1 ${
                  summary.endingCash >= 0 ? 'text-white' : 'text-rose-400'
                }`}
              >
                {formatCurrency(summary.endingCash)}
              </div>
            </div>
          </div>

          {/* Breakdown Waterfall */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Itemized Career & Real Estate Cash Flow
            </h4>

            <div className="space-y-2 text-xs font-mono tabular-nums">
              {/* Career Salary */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 font-sans">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Day Job Paycheck:</span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  +{formatCurrency(summary.jobSalaryEarned)}
                </span>
              </div>

              {/* Student Debt */}
              {summary.studentLoanPayments > 0 && (
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5 font-sans">
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Student Loan Debt Payment:</span>
                  </span>
                  <span className="text-rose-400">-{formatCurrency(summary.studentLoanPayments)}</span>
                </div>
              )}

              {/* Living Expenses */}
              <div className="flex justify-between items-center text-slate-400">
                <span>Personal Living Expenses (Food/Rent/Health):</span>
                <span className="text-rose-400">-{formatCurrency(summary.livingExpenses)}</span>
              </div>

              <div className="h-px bg-slate-800 my-1" />

              {/* Real Estate Breakdown */}
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1.5 font-sans">
                  <Building className="w-3.5 h-3.5 text-sky-400" />
                  <span>Gross Rental Income Collected:</span>
                </span>
                <span className="text-emerald-400 font-semibold">
                  +{formatCurrency(summary.grossRentalIncome)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-400 pl-4">
                <span>Property Operating Expenses (Taxes/Ins/Maint):</span>
                <span className="text-rose-400">
                  -{formatCurrency(summary.propertyTaxes + summary.insuranceTotal + summary.routineMaintenance + summary.specialExpenses)}
                </span>
              </div>

              {summary.managementFees > 0 && (
                <div className="flex justify-between items-center text-slate-400 pl-4">
                  <span>Property Management (Passive Service):</span>
                  <span className="text-rose-400">-{formatCurrency(summary.managementFees)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400 pl-4">
                <span>Total Mortgage & Debt Payments:</span>
                <span className="text-rose-400">
                  -{formatCurrency(summary.seniorMortgagePayments + summary.equityLoanPayments)}
                </span>
              </div>

              <div className="flex justify-between items-center text-slate-300 pl-4 font-semibold">
                <span>Net Passive Rental Cash Flow:</span>
                <span className={summary.netRentalCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {summary.netRentalCashFlow >= 0 ? '+' : ''}{formatCurrency(summary.netRentalCashFlow)}
                </span>
              </div>

              <div className="h-px bg-slate-800 my-1" />

              <div className="flex justify-between items-center text-white font-bold text-sm">
                <span>Net Total Cash Flow Settled:</span>
                <span className={isProfitable ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatCurrency(summary.totalMonthlyCashFlow)}
                </span>
              </div>
            </div>
          </div>

          {/* Month Events Log */}
          {monthEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Monthly Events & Activity
              </h4>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40 text-xs">
                {monthEvents.map((evt) => (
                  <div key={evt.id} className="p-3 flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-semibold text-slate-200">{evt.title}</div>
                      <div className="text-slate-400 mt-0.5">{evt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={() => {
              onClose();
              playClickSound();
            }}
            className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all"
          >
            Acknowledge & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
