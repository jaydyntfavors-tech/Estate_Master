import { Property, TaxReturnSummary, StudentLoan } from '../types/game';
import { getPropertyOperatingExpenses } from './calculator';

export function calculateYearlyTaxReturn(
  taxYear: number,
  monthlySalary: number,
  properties: Property[],
  studentLoans: StudentLoan[],
  cash: number,
  annualDividends: number
): TaxReturnSummary {
  const annualSalary = monthlySalary * 12;

  // Annual gross rental income
  const annualGrossRent = properties.reduce(
    (sum, p) => sum + p.units * p.actualRentPerUnit * 12,
    0
  );

  const totalGrossIncome = annualSalary + annualGrossRent + annualDividends;

  // Standard employer tax withholding (approx 20% on W2 salary)
  const taxWithheld = Math.round(annualSalary * 0.20);

  // 1. Real Estate Depreciation Write-Off (The primary landlord tax shelter)
  // IRS straight-line: Residential 27.5 yrs (~3.64%), Commercial 39 yrs (~2.56%)
  const depreciationDeduction = properties.reduce((sum, p) => {
    const rate = p.tier >= 4 ? 0.0256 : 0.0364;
    return sum + Math.round(p.purchasePrice * rate);
  }, 0);

  // 2. Mortgage Interest Deductions
  const annualMortgageInterest = properties.reduce((sum, p) => {
    const seniorInterest = p.mortgage
      ? Math.round(p.mortgage.principalRemaining * (p.mortgage.interestRate / 100))
      : 0;
    const equityInterest = p.equityLoans.reduce(
      (s, l) => s + Math.round(l.principalRemaining * (l.interestRate / 100)),
      0
    );
    return sum + seniorInterest + equityInterest;
  }, 0);

  // 3. Operating Expenses Deductions (Taxes, Insurance, Maintenance, Management)
  const annualOperatingExpenses = properties.reduce((sum, p) => {
    const op = getPropertyOperatingExpenses(p, p.units * p.actualRentPerUnit);
    return sum + op.totalOperatingExpenses * 12;
  }, 0);

  // 4. Student Loan Interest Deduction (capped at $2,500 by IRS rules)
  const studentLoanInterest = Math.min(
    2500,
    studentLoans.reduce(
      (sum, l) => sum + Math.round(l.principalRemaining * (l.interestRate / 100)),
      0
    )
  );

  const totalTaxDeductions =
    depreciationDeduction +
    annualMortgageInterest +
    annualOperatingExpenses +
    studentLoanInterest;

  // 5. Liquidity vs Property Portfolio Allocation Check (User Prompt Rule):
  // "If most of their money is in property, then they have a lower tax amount,
  // but if they have a lot of liquid cash, then their taxes are going to be higher."
  const totalPropertyValue = properties.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const totalAssets = totalPropertyValue + Math.max(0, cash);
  const cashRatio = totalAssets > 0 ? Math.max(0, cash) / totalAssets : 1.0;

  // Liquid Cash Inefficiency Penalty:
  // If cash ratio > 25%, player pays penalty taxes on uninvested idle funds
  let liquidCashPenalty = 0;
  if (cashRatio > 0.25 && cash > 15000) {
    const excessCash = cash - totalAssets * 0.25;
    liquidCashPenalty = Math.round(excessCash * 0.08); // 8% unshielded cash drag tax
  }

  // Net Taxable Income calculation
  const netTaxableIncome = Math.max(
    0,
    totalGrossIncome - totalTaxDeductions
  );

  // Progressive base tax rate (approx 18% on net taxable)
  const baseTaxLiability = Math.round(netTaxableIncome * 0.18 + liquidCashPenalty);

  // Final balance: Withheld - Liability
  // Positive = REFUND check from IRS
  // Negative = TAX BILL owed to IRS
  const finalTaxBalance = taxWithheld - baseTaxLiability;
  const isRefund = finalTaxBalance >= 0;

  const effectiveTaxRate =
    totalGrossIncome > 0
      ? Number(((baseTaxLiability / totalGrossIncome) * 100).toFixed(1))
      : 0;

  let taxAdvice = '';
  if (properties.length === 0) {
    taxAdvice =
      'You currently hold zero real estate. All of your salary is taxed at full ordinary rates. Acquiring rental properties will unlock building depreciation write-offs to shelter your income!';
  } else if (cashRatio > 0.4 && cash > 30000) {
    taxAdvice = `You hold a high percentage of idle liquid cash (${Math.round(
      cashRatio * 100
    )}% of assets). Uninvested cash incurred an idle cash drag penalty of ${liquidCashPenalty.toLocaleString()}. Deploy cash into additional properties to capture more depreciation deductions!`;
  } else if (isRefund) {
    taxAdvice = `Excellent real estate tax sheltering! Your $${depreciationDeduction.toLocaleString()} in building depreciation and mortgage deductions wiped out your rental taxes and shielded your career paycheck, resulting in a healthy tax refund!`;
  } else {
    taxAdvice = `Balanced tax return. Your property write-offs shielded $${totalTaxDeductions.toLocaleString()} of gross income, keeping your effective tax rate at a low ${effectiveTaxRate}%.`;
  }

  return {
    taxYear,
    w2SalaryIncome: annualSalary,
    grossRentalIncome: annualGrossRent,
    stockDividendIncome: annualDividends,
    totalGrossIncome,
    depreciationDeduction,
    mortgageInterestDeduction: annualMortgageInterest,
    operatingExpensesDeduction: annualOperatingExpenses,
    studentLoanInterestDeduction: studentLoanInterest,
    totalTaxDeductions,
    liquidCashPenalty,
    netTaxableIncome,
    baseTaxLiability,
    taxWithheld,
    finalTaxBalance,
    isRefund,
    effectiveTaxRate,
    taxAdvice,
  };
}
