import React, { useState } from 'react';
import { EquityLoan, MarketState, Property } from '../types/game';
import {
  formatCurrency,
  formatPercent,
  calculateMonthlyMortgagePayment,
  getPropertyTotalDebt,
  getPropertyEquity,
  getPropertyFinancialBreakdown,
} from '../utils/calculator';
import {
  X,
  Coins,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { playCashSound, playClickSound } from '../utils/audio';

interface RefinanceModalProps {
  properties: Property[];
  selectedPropertyId?: string;
  marketState: MarketState;
  onClose: () => void;
  onExecuteEquityLoan: (propertyId: string, loan: EquityLoan, cashReceived: number) => void;
}

export const RefinanceModal: React.FC<RefinanceModalProps> = ({
  properties,
  selectedPropertyId,
  marketState,
  onClose,
  onExecuteEquityLoan,
}) => {
  const eligibleProperties = properties.filter((p) => {
    const totalDebt = getPropertyTotalDebt(p);
    const max75 = p.currentMarketValue * 0.75;
    return max75 - totalDebt >= 5000;
  });

  const initialPropertyId =
    selectedPropertyId && properties.find((p) => p.id === selectedPropertyId)
      ? selectedPropertyId
      : eligibleProperties[0]?.id || properties[0]?.id;

  const [activePropertyId, setActivePropertyId] = useState<string>(initialPropertyId || '');
  const [termYears, setTermYears] = useState<15 | 30>(30);

  const activeProperty = properties.find((p) => p.id === activePropertyId);

  // Interest rate for second lien equity loan is benchmark rate + 0.6%
  const annualInterestRate = Number((marketState.benchmarkMortgageRate + 0.6).toFixed(2));
  const termMonths = termYears * 12;

  // Equity calculations
  const totalDebt = activeProperty ? getPropertyTotalDebt(activeProperty) : 0;
  const equity = activeProperty ? getPropertyEquity(activeProperty) : 0;
  const maxBorrowable = activeProperty
    ? Math.max(0, Math.round(activeProperty.currentMarketValue * 0.75 - totalDebt))
    : 0;

  // Selected cash out amount
  const [borrowAmount, setBorrowAmount] = useState<number>(
    Math.min(maxBorrowable, Math.max(10000, Math.round(maxBorrowable * 0.75)))
  );

  // When switching properties, reset loan slider
  const handleSelectProperty = (id: string) => {
    setActivePropertyId(id);
    const prop = properties.find((p) => p.id === id);
    if (prop) {
      const debt = getPropertyTotalDebt(prop);
      const max = Math.max(0, Math.round(prop.currentMarketValue * 0.75 - debt));
      setBorrowAmount(Math.min(max, Math.max(5000, Math.round(max * 0.8))));
    }
    playClickSound();
  };

  const newMonthlyPayment = calculateMonthlyMortgagePayment(
    borrowAmount,
    annualInterestRate,
    termMonths
  );

  // Projected impact on property cashflow
  const currentBreakdown = activeProperty
    ? getPropertyFinancialBreakdown(activeProperty)
    : null;
  const projectedCashFlow = currentBreakdown
    ? currentBreakdown.netCashFlow - newMonthlyPayment
    : 0;

  const handleExecute = () => {
    if (!activeProperty || borrowAmount <= 0) return;

    const newLoan: EquityLoan = {
      id: `equity-loan-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: `Cash-Out Equity Loan #${activeProperty.equityLoans.length + 1} (${termYears}Y Fixed)`,
      principalRemaining: borrowAmount,
      interestRate: annualInterestRate,
      monthlyPayment: newMonthlyPayment,
      termMonthsRemaining: termMonths,
      originalLoanAmount: borrowAmount,
    };

    onExecuteEquityLoan(activeProperty.id, newLoan, borrowAmount);
    playCashSound();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
              <Coins className="w-4 h-4" />
              <span>EQUITY EXTRACTION & LEVERAGE DESK</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Cash-Out Refinance / Equity Loan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tap into the accrued equity of your existing properties to fund down payments on new acquisitions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Property Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select Collateral Property to Borrow Against:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {properties.map((prop) => {
                const debt = getPropertyTotalDebt(prop);
                const max = Math.max(0, Math.round(prop.currentMarketValue * 0.75 - debt));
                const isSelected = prop.id === activePropertyId;
                const canBorrow = max >= 5000;

                return (
                  <button
                    key={prop.id}
                    onClick={() => handleSelectProperty(prop.id)}
                    disabled={!canBorrow}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-950/20 shadow-sm'
                        : canBorrow
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-800/40 bg-slate-950/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-white">
                      <span className="truncate">{prop.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Value: {formatCurrency(prop.currentMarketValue)} · Debt: {formatCurrency(debt)}
                    </div>
                    <div className="text-xs font-mono font-medium mt-1.5 tabular-nums">
                      {canBorrow ? (
                        <span className="text-emerald-400">
                          {formatCurrency(max)} Available Equity
                        </span>
                      ) : (
                        <span className="text-slate-500">Max LTV reached (No equity to draw)</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {activeProperty && maxBorrowable > 0 ? (
            <div className="space-y-6">
              {/* Financial Snapshot of Collateral */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums">
                <div>
                  <span className="text-slate-500">Appraised Value</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {formatCurrency(activeProperty.currentMarketValue)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Outstanding Debt</span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    {formatCurrency(totalDebt)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Total Net Equity</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(equity)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Max Loan (75% LTV)</span>
                  <div className="text-sm font-bold text-sky-400 mt-0.5">
                    {formatCurrency(maxBorrowable)}
                  </div>
                </div>
              </div>

              {/* Loan Term & Amount Controls */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Cash-Out Loan Amount</h3>
                    <p className="text-xs text-slate-400">
                      Amount of liquid cash to withdraw today into your checking account.
                    </p>
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {formatCurrency(borrowAmount)}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={5000}
                  max={maxBorrowable}
                  step={5000}
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 tabular-nums">
                  <span>Min: $5,000</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBorrowAmount(Math.round(maxBorrowable * 0.5))}
                      className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-300"
                    >
                      50% ({formatCurrency(Math.round(maxBorrowable * 0.5))})
                    </button>
                    <button
                      onClick={() => setBorrowAmount(maxBorrowable)}
                      className="px-2 py-0.5 bg-slate-800 rounded hover:bg-slate-700 text-slate-300"
                    >
                      Max ({formatCurrency(maxBorrowable)})
                    </button>
                  </div>
                  <span>Max: {formatCurrency(maxBorrowable)}</span>
                </div>

                {/* Loan Term Selection */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Repayment Term:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setTermYears(15);
                        playClickSound();
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                        termYears === 15
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      15 Years (Faster Paydown)
                    </button>
                    <button
                      onClick={() => {
                        setTermYears(30);
                        playClickSound();
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                        termYears === 30
                          ? 'border-amber-400 bg-amber-500/10 text-amber-300 font-semibold'
                          : 'border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      30 Years (Lower Payment)
                    </button>
                  </div>
                </div>
              </div>

              {/* Financial Impact Analysis */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Cash Flow & Leverage Impact
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono tabular-nums">
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Liquid Cash Injected</span>
                    <div className="text-base font-bold text-emerald-400 mt-1">
                      +{formatCurrency(borrowAmount)}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Available immediately</div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">New Monthly Loan Pmt</span>
                    <div className="text-base font-bold text-rose-400 mt-1">
                      -{formatCurrency(newMonthlyPayment)}/mo
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {annualInterestRate}% interest rate
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Property New Cash Flow</span>
                    <div
                      className={`text-base font-bold mt-1 ${
                        projectedCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(projectedCashFlow)}/mo
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {projectedCashFlow >= 0 ? 'Still cashflow positive' : 'Negative cashflow drag'}
                    </div>
                  </div>
                </div>

                {/* Cash Flow Warning if property will go negative */}
                {projectedCashFlow < 0 && (
                  <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                    <span>
                      <strong>Cash Flow Warning:</strong> Taking this large loan will make {activeProperty.name} cash flow negative by {formatCurrency(Math.abs(projectedCashFlow))}/mo.
                      Make sure your new acquired property or rental income from other units can cover this payment!
                    </span>
                  </div>
                )}

                {/* Strategic Advice */}
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                  <Info className="w-4 h-4 shrink-0 text-sky-400 mt-0.5" />
                  <span>
                    <strong>BRRRR & Equity Growth Strategy:</strong> You can take this {formatCurrency(borrowAmount)} and use it as a 20% down payment to purchase a new property worth up to {formatCurrency(borrowAmount * 5)}!
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-950/40 space-y-2">
              <Coins className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-semibold text-slate-300">No Eligible Collateral</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                None of your properties currently have sufficient equity to borrow against (up to 75% LTV).
                Allow market appreciation to grow, or pay down existing principal balances to unlock equity loans.
              </p>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {activeProperty && maxBorrowable > 0 && (
            <button
              onClick={handleExecute}
              className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Execute Cash-Out ({formatCurrency(borrowAmount)} to Bank)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
