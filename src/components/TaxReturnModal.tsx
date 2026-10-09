import React from 'react';
import { TaxReturnSummary } from '../types/game';
import { formatCurrency, formatPercent } from '../utils/calculator';
import {
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle2,
  X,
  HelpCircle,
} from 'lucide-react';
import { playCashSound, playClickSound, playWarningSound } from '../utils/audio';

interface TaxReturnModalProps {
  taxSummary: TaxReturnSummary;
  onSettleTax: (netBalance: number) => void;
}

export const TaxReturnModal: React.FC<TaxReturnModalProps> = ({
  taxSummary,
  onSettleTax,
}) => {
  const isRefund = taxSummary.finalTaxBalance >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <FileText className="w-4 h-4" />
              <span>Annual IRS Tax Filing · April {taxSummary.taxYear}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Annual Tax Settlement Statement
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Form 1040 & Schedule E Real Estate Reconciliation for the previous calendar year.
            </p>
          </div>

          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 font-mono text-xs tabular-nums shrink-0">
            April 15
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Refund / Bill Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isRefund
                ? 'bg-emerald-950/25 border-emerald-500/50'
                : 'bg-rose-950/25 border-rose-500/50'
            }`}
          >
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                {isRefund ? (
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-400" />
                )}
                <span className={isRefund ? 'text-emerald-300' : 'text-rose-300'}>
                  {isRefund ? 'Federal Tax Refund Approved' : 'Federal Tax Balance Due'}
                </span>
              </div>

              <div
                className={`text-3xl font-bold font-mono tabular-nums mt-1 ${
                  isRefund ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isRefund ? '+' : ''}
                {formatCurrency(taxSummary.finalTaxBalance)}
              </div>

              <p className="text-xs text-slate-300 mt-1">
                {isRefund
                  ? 'Your real estate write-offs wiped out your tax burden. Refund will be deposited to your checking account!'
                  : 'Insufficient deductions against career earnings & idle cash. Tax bill will be settled from checking account.'}
              </p>
            </div>

            <div className="text-right font-mono tabular-nums text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800 shrink-0">
              <span className="text-slate-400">Effective Tax Rate</span>
              <div className="text-lg font-bold text-white mt-0.5">
                {formatPercent(taxSummary.effectiveTaxRate, 1)}
              </div>
              <span className="text-slate-500 text-[10px]">On total gross income</span>
            </div>
          </div>

          {/* Itemized IRS Form Breakdown */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Itemized Taxable Inflows & Deductions
            </h4>

            <div className="space-y-2 text-xs font-mono tabular-nums">
              {/* Gross Inflows */}
              <div className="flex justify-between items-center text-slate-300">
                <span>1. W2 Career Salary Income:</span>
                <span className="text-white font-medium">+{formatCurrency(taxSummary.w2SalaryIncome)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-300">
                <span>2. Gross Rental Property Income:</span>
                <span className="text-white font-medium">+{formatCurrency(taxSummary.grossRentalIncome)}</span>
              </div>

              {taxSummary.stockDividendIncome > 0 && (
                <div className="flex justify-between items-center text-slate-300">
                  <span>3. Stock Dividends Collected:</span>
                  <span className="text-white font-medium">+{formatCurrency(taxSummary.stockDividendIncome)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-slate-400 font-semibold pt-1 border-t border-slate-800">
                <span>Total Gross Annual Earnings:</span>
                <span className="text-white">{formatCurrency(taxSummary.totalGrossIncome)}</span>
              </div>

              <div className="h-px bg-slate-800 my-1.5" />

              {/* Deductions - Real Estate Shelters */}
              <div className="flex justify-between items-center text-emerald-400">
                <span className="flex items-center gap-1 font-sans">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Real Estate Depreciation Write-Off (Non-Cash):</span>
                </span>
                <span className="font-semibold">-{formatCurrency(taxSummary.depreciationDeduction)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-400">
                <span>Mortgage & HELOC Interest Paid:</span>
                <span>-{formatCurrency(taxSummary.mortgageInterestDeduction)}</span>
              </div>

              <div className="flex justify-between items-center text-emerald-400">
                <span>Property Taxes, Insurance & Operating Costs:</span>
                <span>-{formatCurrency(taxSummary.operatingExpensesDeduction)}</span>
              </div>

              {taxSummary.studentLoanInterestDeduction > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>Student Loan Interest Deduction:</span>
                  <span>-{formatCurrency(taxSummary.studentLoanInterestDeduction)}</span>
                </div>
              )}

              {/* Liquid Cash Inefficiency Penalty */}
              {taxSummary.liquidCashPenalty > 0 && (
                <div className="flex justify-between items-center text-rose-400 pt-1 border-t border-slate-800">
                  <span className="flex items-center gap-1 font-sans">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Uninvested Idle Cash Penalty (&gt;25% of Assets):</span>
                  </span>
                  <span className="font-semibold">+{formatCurrency(taxSummary.liquidCashPenalty)}</span>
                </div>
              )}

              <div className="h-px bg-slate-800 my-1.5" />

              <div className="flex justify-between items-center text-slate-300 font-semibold">
                <span>Net Taxable Income (After Deductions):</span>
                <span className="text-white">{formatCurrency(taxSummary.netTaxableIncome)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>Total Net Tax Liability Calculated:</span>
                <span className="text-rose-400">-{formatCurrency(taxSummary.baseTaxLiability)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-400">
                <span>W2 Tax Pre-Payments Withheld:</span>
                <span className="text-emerald-400">+{formatCurrency(taxSummary.taxWithheld)}</span>
              </div>
            </div>
          </div>

          {/* CPA Real Estate Strategy Advice */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 text-xs space-y-2">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-400" />
              <span>Certified Public Accountant (CPA) Portfolio Review</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              {taxSummary.taxAdvice}
            </p>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400">
            {isRefund ? (
              <span className="text-emerald-400 font-semibold">
                Refund +{formatCurrency(taxSummary.finalTaxBalance)} ready for deposit
              </span>
            ) : (
              <span className="text-rose-400 font-semibold">
                Tax liability {formatCurrency(Math.abs(taxSummary.finalTaxBalance))} due immediately
              </span>
            )}
          </div>

          <button
            onClick={() => {
              if (isRefund) {
                playCashSound();
              } else {
                playWarningSound();
              }
              onSettleTax(taxSummary.finalTaxBalance);
            }}
            className={`px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 ${
              isRefund
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                : 'bg-rose-500 hover:bg-rose-600 text-white'
            }`}
          >
            {isRefund
              ? `Accept Refund (+${formatCurrency(taxSummary.finalTaxBalance)})`
              : `Settle Tax Bill (-${formatCurrency(Math.abs(taxSummary.finalTaxBalance))})`}
          </button>
        </div>
      </div>
    </div>
  );
};
