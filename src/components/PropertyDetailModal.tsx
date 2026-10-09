import React, { useState } from 'react';
import { InsurancePlan, Property } from '../types/game';
import {
  formatCurrency,
  formatPercent,
  getPropertyFinancialBreakdown,
  calculateBreakEvenRentPerUnit,
} from '../utils/calculator';
import {
  X,
  SlidersHorizontal,
  Wrench,
  Users,
  Coins,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { playClickSound, playCashSound } from '../utils/audio';

interface PropertyDetailModalProps {
  property: Property;
  cash: number;
  onClose: () => void;
  onUpdateProperty: (updated: Property) => void;
  onOpenRefinance: (property: Property) => void;
  onSpendCash: (amount: number, reason: string) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  cash,
  onClose,
  onUpdateProperty,
  onOpenRefinance,
  onSpendCash,
}) => {
  const [activeTab, setActiveTab] = useState<'calculator' | 'maintenance' | 'tenants' | 'financing'>('calculator');
  const [rentInput, setRentInput] = useState(property.actualRentPerUnit);

  const breakdown = getPropertyFinancialBreakdown({
    ...property,
    actualRentPerUnit: rentInput,
  });
  const breakEvenRent = calculateBreakEvenRentPerUnit(property);

  const handleSaveRent = () => {
    onUpdateProperty({
      ...property,
      actualRentPerUnit: rentInput,
    });
    playClickSound();
  };

  const handleToggleManagement = () => {
    onUpdateProperty({
      ...property,
      isSelfManaged: !property.isSelfManaged,
    });
    playClickSound();
  };

  const handleChangeInsurance = (plan: InsurancePlan) => {
    let monthlyCost = 150;
    if (plan === 'basic') monthlyCost = Math.round(property.units * 65);
    if (plan === 'standard') monthlyCost = Math.round(property.units * 110);
    if (plan === 'premium') monthlyCost = Math.round(property.units * 160);

    onUpdateProperty({
      ...property,
      insurancePlan: plan,
      monthlyInsuranceCost: monthlyCost,
    });
    playClickSound();
  };

  const handlePerformMaintenance = (costPerUnit: number, conditionBoost: number, label: string) => {
    const totalCost = Math.round(costPerUnit * property.units);
    if (cash < totalCost) {
      alert(`Insufficient cash! You need ${formatCurrency(totalCost)} for this work.`);
      return;
    }

    onSpendCash(totalCost, `${label} at ${property.name}`);
    const newCondition = Math.min(100, property.condition + conditionBoost);
    const appraisalBoost = Math.round(property.currentMarketValue * (conditionBoost * 0.003));

    onUpdateProperty({
      ...property,
      condition: newCondition,
      currentMarketValue: property.currentMarketValue + appraisalBoost,
      accumulatedAppreciation: property.accumulatedAppreciation + appraisalBoost,
    });
    playCashSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Building className="w-4 h-4 text-emerald-400" />
              <span>Tier {property.tier}</span>
              <span aria-hidden="true">·</span>
              <span>{property.units} {property.units === 1 ? 'Unit' : 'Units'}</span>
              <span aria-hidden="true">·</span>
              <span>{property.squareFeet.toLocaleString()} sq ft</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{property.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {property.address}, {property.city} · Built {property.yearBuilt}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-400">Current Appraisal</div>
              <div className="text-base font-bold font-mono text-sky-400 tabular-nums">
                {formatCurrency(property.currentMarketValue)}
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

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex gap-6 shrink-0 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'calculator'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Rent & Cashflow Calculator</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'maintenance'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Condition & Maintenance</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'tenants'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tenants ({property.tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('financing')}
            className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'financing'
                ? 'border-emerald-400 text-emerald-400 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Mortgage & Equity</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Rent Setting Control */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Monthly Rent Charged Per Unit</h3>
                    <p className="text-xs text-slate-400">
                      Balance your monthly income against tenant retention and vacancy rates.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono tabular-nums text-white">
                      {formatCurrency(rentInput)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </span>
                    {rentInput !== property.actualRentPerUnit && (
                      <button
                        onClick={handleSaveRent}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-all"
                      >
                        Apply Rent
                      </button>
                    )}
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={Math.max(200, Math.round(property.marketRentPerUnit * 0.4))}
                  max={Math.round(property.marketRentPerUnit * 1.6)}
                  step={25}
                  value={rentInput}
                  onChange={(e) => setRentInput(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />

                <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                  <div>
                    Fair Market: <strong className="text-slate-200">{formatCurrency(property.marketRentPerUnit)}</strong>
                  </div>
                  <div>
                    Break-Even Load: <strong className="text-amber-400">{formatCurrency(breakEvenRent)}</strong>
                  </div>
                  <div>
                    Projected Total Gross:{' '}
                    <strong className="text-emerald-400">
                      {formatCurrency(breakdown.grossRentCollected)}
                    </strong>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-500">Quick Presets:</span>
                  <button
                    onClick={() => setRentInput(breakEvenRent)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300"
                  >
                    Set to Break-Even ({formatCurrency(breakEvenRent)})
                  </button>
                  <button
                    onClick={() => setRentInput(property.marketRentPerUnit)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300"
                  >
                    Set to Market ({formatCurrency(property.marketRentPerUnit)})
                  </button>
                  <button
                    onClick={() => setRentInput(Math.round(property.marketRentPerUnit * 1.08))}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300"
                  >
                    Premium Rate (+8%)
                  </button>
                </div>
              </div>

              {/* Complete Financial Waterfall Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Operating Inflows & Outflows */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Operating Ledger (Monthly)
                  </h4>

                  <div className="space-y-2.5 text-xs font-mono tabular-nums">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Gross Rent Collected ({breakdown.occupiedUnits}/{property.units} occupied):</span>
                      <span className="text-emerald-400 font-semibold">
                        +{formatCurrency(breakdown.grossRentCollected)}
                      </span>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Property Taxes ({formatPercent(property.propertyTaxRateAnnual * 100, 2)}/yr):</span>
                      <span className="text-rose-400">-{formatCurrency(breakdown.operatingExpenses.taxes)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Hazard / Property Insurance ({property.insurancePlan}):</span>
                      <span className="text-rose-400">-{formatCurrency(breakdown.operatingExpenses.insurance)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Routine Maintenance & Reserve:</span>
                      <span className="text-rose-400">-{formatCurrency(breakdown.operatingExpenses.maintenance)}</span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>Property Management ({property.isSelfManaged ? 'Self Managed 0%' : 'Professional 8%'}):</span>
                      <span className="text-rose-400">-{formatCurrency(breakdown.operatingExpenses.management)}</span>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div className="flex justify-between items-center text-white font-semibold">
                      <span>Net Operating Income (NOI):</span>
                      <span className={breakdown.netOperatingIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(breakdown.netOperatingIncome)}
                      </span>
                    </div>
                  </div>

                  {/* Property Management Toggle */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-300">
                        {property.isSelfManaged ? 'Self-Managed (0% Fee)' : 'Professional Management (8% Fee)'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {property.isSelfManaged
                          ? 'You respond to repairs and emergencies'
                          : 'Manager auto-resolves minor complaints'}
                      </div>
                    </div>
                    <button
                      onClick={handleToggleManagement}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      {property.isSelfManaged ? 'Hire Manager' : 'Self-Manage'}
                    </button>
                  </div>
                </div>

                {/* Debt Service & Final Cashflow */}
                <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/40 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Debt Service & Net Cash Flow
                  </h4>

                  <div className="space-y-2.5 text-xs font-mono tabular-nums">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>
                        Senior Mortgage ({property.mortgage?.interestRate}% rate):
                      </span>
                      <span className="text-rose-400">
                        -{formatCurrency(breakdown.seniorMortgage)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-slate-400">
                      <span>
                        Equity Loans / HELOC Payments ({property.equityLoans.length} active):
                      </span>
                      <span className="text-rose-400">
                        -{formatCurrency(breakdown.equityLoans)}
                      </span>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div className="flex justify-between items-center text-slate-300">
                      <span>Total Monthly Debt Service:</span>
                      <span className="text-rose-400 font-semibold">
                        -{formatCurrency(breakdown.totalDebtService)}
                      </span>
                    </div>

                    <div className="h-px bg-slate-800" />

                    {/* Final Net Cash Flow */}
                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center text-sm font-bold">
                      <span className="text-white">Net Monthly Cash Flow:</span>
                      <span className={breakdown.netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {formatCurrency(breakdown.netCashFlow)}/mo
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                      <span>Capitalization Rate (Cap Rate):</span>
                      <span className="text-sky-400 font-semibold">{formatPercent(breakdown.capRate, 1)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Current Loan-to-Value (LTV):</span>
                      <span className="text-amber-400 font-semibold">{formatPercent(breakdown.ltv, 1)}</span>
                    </div>
                  </div>

                  {/* Refinance Quick Button */}
                  <div className="pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        onClose();
                        onOpenRefinance(property);
                      }}
                      className="w-full py-2 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Borrow Against Built-up Equity ({formatCurrency(breakdown.equity)})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Insurance Plan Selector */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hazard & Liability Insurance Policy</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['basic', 'standard', 'premium'] as InsurancePlan[]).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handleChangeInsurance(plan)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        property.insurancePlan === plan
                          ? 'border-emerald-500/60 bg-emerald-950/20 text-white'
                          : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold capitalize">
                        <span>{plan} Coverage</span>
                        {property.insurancePlan === plan && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                        {plan === 'basic' && `$${property.units * 65}/mo · $5k Deductible`}
                        {plan === 'standard' && `$${property.units * 110}/mo · $1.5k Deductible`}
                        {plan === 'premium' && `$${property.units * 160}/mo · Zero Deductible`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              {/* Condition Overview */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Property Physical Health</h3>
                    <p className="text-xs text-slate-400">
                      Physical wear depreciates value and leads to emergency repair claims.
                    </p>
                  </div>
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {property.condition}%
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      property.condition >= 80
                        ? 'bg-emerald-500'
                        : property.condition >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${property.condition}%` }}
                  />
                </div>

                <div className="text-xs text-slate-400 flex items-center justify-between">
                  <span>Natural Monthly Wear: ~0.4%/month</span>
                  <span>Maintenance Reserve: {formatCurrency(property.baseMaintenanceCost)}/mo</span>
                </div>
              </div>

              {/* Renovation & Upgrade Packages */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Improvement & Renovation Packages
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier 1: Preventative */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Preventative Service</div>
                      <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                        {formatCurrency(250 * property.units)}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Inspect HVAC, clear drain lines, test smoke detectors and safety valves.
                      </p>
                      <div className="mt-3 text-xs text-emerald-400 font-mono">
                        +6% Condition Boost
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePerformMaintenance(250, 6, 'Preventative Service')
                      }
                      className="mt-4 w-full py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                      Execute Service
                    </button>
                  </div>

                  {/* Tier 2: Cosmetic */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Cosmetic Refresh & Paint</div>
                      <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                        {formatCurrency(1200 * property.units)}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Fresh interior paint, modern light fixtures, re-caulked bathrooms, refinished trim.
                      </p>
                      <div className="mt-3 text-xs text-emerald-400 font-mono">
                        +15% Condition · +$75/mo Market Rent
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePerformMaintenance(1200, 15, 'Cosmetic Refresh')
                      }
                      className="mt-4 w-full py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                    >
                      Execute Refresh
                    </button>
                  </div>

                  {/* Tier 3: Full Gut Rehab */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-300">Full Luxury Renovation</div>
                      <div className="text-lg font-bold font-mono text-white mt-1 tabular-nums">
                        {formatCurrency(4500 * property.units)}
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        Quartz countertops, new stainless appliances, luxury vinyl plank floors, new HVAC.
                      </p>
                      <div className="mt-3 text-xs text-emerald-400 font-mono">
                        Restores to 100% · +10% Appraisal
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        handlePerformMaintenance(4500, 35, 'Luxury Renovation')
                      }
                      className="mt-4 w-full py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                    >
                      Execute Full Rehab
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {property.tenants.length} Active Leases in Property
                </span>
                <span className="font-mono tabular-nums text-emerald-400">
                  Average Satisfaction: {breakdown.satisfactionScore}%
                </span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                {property.tenants.map((t, idx) => (
                  <div key={t.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-white">
                        Unit {idx + 1}: {t.name}
                      </div>
                      <div className="text-slate-400 mt-0.5 font-mono tabular-nums">
                        Credit Score: {t.creditScore} · {t.leaseMonthsRemaining} months remaining on lease
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold font-mono text-white tabular-nums">
                        {formatCurrency(t.monthlyRent)}/mo
                      </div>
                      <div className="text-slate-400 mt-0.5 font-mono tabular-nums">
                        {t.satisfaction}% Satisfaction
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financing' && (
            <div className="space-y-6">
              {/* Senior Mortgage Summary */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <h3 className="text-sm font-semibold text-white">First Senior Mortgage</h3>
                {property.mortgage ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono tabular-nums">
                    <div>
                      <span className="text-slate-500">Remaining Balance</span>
                      <div className="text-base font-bold text-white mt-1">
                        {formatCurrency(property.mortgage.principalRemaining)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Interest Rate</span>
                      <div className="text-base font-bold text-amber-300 mt-1">
                        {property.mortgage.interestRate}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Monthly P&I Payment</span>
                      <div className="text-base font-bold text-rose-400 mt-1">
                        {formatCurrency(property.mortgage.monthlyPayment)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Term Remaining</span>
                      <div className="text-base font-bold text-slate-300 mt-1">
                        {property.mortgage.termMonthsRemaining} mos ({Math.round(property.mortgage.termMonthsRemaining / 12)} yrs)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    No senior mortgage. This property is owned free and clear!
                  </div>
                )}
              </div>

              {/* Equity Loans / HELOCs list */}
              <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Junior Equity Loans & HELOCs</h3>
                    <p className="text-xs text-slate-400">
                      Cash-out debt taken on this property to fund down payments on other properties.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenRefinance(property);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
                  >
                    + Take New Equity Loan
                  </button>
                </div>

                {property.equityLoans.length === 0 ? (
                  <div className="text-xs text-slate-500 p-4 border border-slate-800 rounded-lg text-center">
                    No active equity loans against this property. Available equity: {formatCurrency(breakdown.equity)}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
                    {property.equityLoans.map((loan) => (
                      <div key={loan.id} className="p-4 flex items-center justify-between gap-4 text-xs font-mono tabular-nums">
                        <div>
                          <div className="font-semibold text-white">{loan.name}</div>
                          <div className="text-slate-400 mt-0.5">
                            {loan.interestRate}% interest · {loan.termMonthsRemaining} months left
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-amber-400 font-bold">
                            Balance: {formatCurrency(loan.principalRemaining)}
                          </div>
                          <div className="text-rose-400 mt-0.5">
                            Payment: {formatCurrency(loan.monthlyPayment)}/mo
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-400">
            Available liquid cash: <strong className="text-emerald-400 font-mono tabular-nums">{formatCurrency(cash)}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
