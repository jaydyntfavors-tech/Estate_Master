import { Property, Tenant } from '../types/game';

/**
 * Standard fixed-rate monthly mortgage payment formula
 * PMT = P * [ r(1 + r)^n ] / [ (1 + r)^n - 1 ]
 */
export function calculateMonthlyMortgagePayment(
  principal: number,
  annualInterestRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualInterestRate <= 0) return principal / termMonths;

  const monthlyRate = annualInterestRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const payment = (principal * (monthlyRate * factor)) / (factor - 1);
  return Math.round(payment);
}

/**
 * Total debt outstanding across senior mortgage and all equity loans
 */
export function getPropertyTotalDebt(property: Property): number {
  const seniorDebt = property.mortgage?.principalRemaining ?? 0;
  const equityDebt = property.equityLoans.reduce(
    (sum, loan) => sum + loan.principalRemaining,
    0
  );
  return Math.round(seniorDebt + equityDebt);
}

/**
 * Current equity in the property (Market Value - Total Debt)
 */
export function getPropertyEquity(property: Property): number {
  const debt = getPropertyTotalDebt(property);
  return Math.max(0, Math.round(property.currentMarketValue - debt));
}

/**
 * Loan-to-Value (LTV) ratio as percentage
 */
export function getPropertyLTV(property: Property): number {
  if (property.currentMarketValue <= 0) return 0;
  const debt = getPropertyTotalDebt(property);
  return Math.min(100, (debt / property.currentMarketValue) * 100);
}

/**
 * Maximum cash-out equity loan possible at maxLTV (e.g., 75% or 80%)
 */
export function calculateMaxCashOutLoan(
  property: Property,
  maxLTVPercent: number = 75
): number {
  const maxBorrowable = (property.currentMarketValue * maxLTVPercent) / 100;
  const currentDebt = getPropertyTotalDebt(property);
  const available = maxBorrowable - currentDebt;
  return Math.max(0, Math.round(available));
}

/**
 * Monthly property tax calculation
 */
export function getMonthlyPropertyTax(property: Property): number {
  return Math.round((property.currentMarketValue * property.propertyTaxRateAnnual) / 12);
}

/**
 * Monthly maintenance estimate based on base upkeep and condition
 * Lower condition results in higher ongoing repair drag
 */
export function getMonthlyMaintenanceCost(property: Property): number {
  // If condition is below 70, maintenance costs scale up because old parts keep breaking
  const conditionFactor = property.condition < 70 ? 1 + (70 - property.condition) / 50 : 1;
  return Math.round(property.baseMaintenanceCost * conditionFactor);
}

/**
 * Monthly senior mortgage payment
 */
export function getSeniorMortgagePayment(property: Property): number {
  return property.mortgage?.monthlyPayment ?? 0;
}

/**
 * Monthly total equity loan payments
 */
export function getEquityLoansPayment(property: Property): number {
  return property.equityLoans.reduce((sum, loan) => sum + loan.monthlyPayment, 0);
}

/**
 * Total monthly debt service (senior + all equity loans)
 */
export function getTotalDebtService(property: Property): number {
  return getSeniorMortgagePayment(property) + getEquityLoansPayment(property);
}

/**
 * Calculate rent elasticity & vacancy probability
 * Ratio of Actual Rent vs Fair Market Rent, adjusted for Condition
 */
export function calculateOccupancyRate(
  actualRentPerUnit: number,
  marketRentPerUnit: number,
  condition: number
): { occupancyRate: number; tenantSatisfactionScore: number; feedback: string } {
  if (marketRentPerUnit <= 0) {
    return { occupancyRate: 1, tenantSatisfactionScore: 100, feedback: 'Fair pricing' };
  }

  // Value perception depends on rent charged vs market, plus condition quality
  const conditionModifier = condition / 80; // 80% condition is normal market standard
  const adjustedMarketRent = marketRentPerUnit * conditionModifier;
  const priceRatio = actualRentPerUnit / adjustedMarketRent;

  let occupancyRate = 1.0;
  let satisfaction = 85;
  let feedback = 'Market competitive';

  if (priceRatio <= 0.85) {
    occupancyRate = 1.0;
    satisfaction = 98;
    feedback = 'Underpriced bargain · Extremely high tenant demand & loyalty';
  } else if (priceRatio <= 0.95) {
    occupancyRate = 1.0;
    satisfaction = 92;
    feedback = 'Attractive rate · Low vacancy risk & happy tenants';
  } else if (priceRatio <= 1.03) {
    occupancyRate = 0.98;
    satisfaction = 82;
    feedback = 'Fair market rent · Balanced occupancy';
  } else if (priceRatio <= 1.15) {
    occupancyRate = 0.88;
    satisfaction = 65;
    feedback = 'Above market · Higher vacancy turnover risk';
  } else if (priceRatio <= 1.30) {
    occupancyRate = 0.70;
    satisfaction = 45;
    feedback = 'Substantially overpriced · Frequent vacancies & complaints';
  } else {
    occupancyRate = 0.45;
    satisfaction = 25;
    feedback = 'Severe price gouging · Tenants leaving, unit sits vacant';
  }

  // Condition penalty if physical state is poor
  if (condition < 50) {
    satisfaction = Math.max(10, satisfaction - 25);
    occupancyRate = Math.max(0.3, occupancyRate - 0.2);
    feedback += ' · Poor condition causing tenant complaints!';
  }

  return {
    occupancyRate: Math.min(1, Math.max(0, occupancyRate)),
    tenantSatisfactionScore: Math.round(satisfaction),
    feedback,
  };
}

/**
 * Monthly Operating Expenses for a property (before debt service)
 */
export function getPropertyOperatingExpenses(
  property: Property,
  projectedGrossRent: number
): {
  taxes: number;
  insurance: number;
  maintenance: number;
  management: number;
  totalOperatingExpenses: number;
} {
  const taxes = getMonthlyPropertyTax(property);
  const insurance = property.monthlyInsuranceCost;
  const maintenance = getMonthlyMaintenanceCost(property);
  const management = property.isSelfManaged ? 0 : Math.round(projectedGrossRent * 0.08);

  const totalOperatingExpenses = taxes + insurance + maintenance + management;

  return {
    taxes,
    insurance,
    maintenance,
    management,
    totalOperatingExpenses,
  };
}

/**
 * Break-even rent per unit to cover all operating expenses and debt service
 */
export function calculateBreakEvenRentPerUnit(property: Property): number {
  if (property.units <= 0) return 0;

  const taxes = getMonthlyPropertyTax(property);
  const insurance = property.monthlyInsuranceCost;
  const maintenance = getMonthlyMaintenanceCost(property);
  const debt = getTotalDebtService(property);

  // If managed, management takes 8%, so gross rent needed satisfies:
  // Rent - 0.08*Rent = Expenses + Debt  =>  0.92*Rent = Expenses + Debt
  const fixedMonthlyLoad = taxes + insurance + maintenance + debt;
  const managementRetention = property.isSelfManaged ? 1.0 : 0.92;

  const requiredTotalGross = fixedMonthlyLoad / managementRetention;
  return Math.ceil(requiredTotalGross / property.units);
}

/**
 * Full Monthly Cashflow Breakdown for a single property
 */
export function getPropertyFinancialBreakdown(property: Property) {
  const elasticity = calculateOccupancyRate(
    property.actualRentPerUnit,
    property.marketRentPerUnit,
    property.condition
  );

  const occupiedUnits = Math.round(property.units * elasticity.occupancyRate);
  const grossRentCollected = occupiedUnits * property.actualRentPerUnit;
  const theoreticalFullGrossRent = property.units * property.actualRentPerUnit;

  const opEx = getPropertyOperatingExpenses(property, grossRentCollected);
  const netOperatingIncome = grossRentCollected - opEx.totalOperatingExpenses;

  const seniorMortgage = getSeniorMortgagePayment(property);
  const equityLoans = getEquityLoansPayment(property);
  const totalDebtService = seniorMortgage + equityLoans;

  const netCashFlow = netOperatingIncome - totalDebtService;
  const breakEvenRent = calculateBreakEvenRentPerUnit(property);

  // Annualized metrics
  const annualNOI = netOperatingIncome * 12;
  const capRate =
    property.currentMarketValue > 0
      ? (annualNOI / property.currentMarketValue) * 100
      : 0;

  return {
    occupiedUnits,
    occupancyRate: elasticity.occupancyRate,
    satisfactionScore: elasticity.tenantSatisfactionScore,
    pricingFeedback: elasticity.feedback,
    grossRentCollected,
    theoreticalFullGrossRent,
    breakEvenRent,
    operatingExpenses: opEx,
    netOperatingIncome,
    seniorMortgage,
    equityLoans,
    totalDebtService,
    netCashFlow,
    capRate,
    totalDebt: getPropertyTotalDebt(property),
    equity: getPropertyEquity(property),
    ltv: getPropertyLTV(property),
  };
}

/**
 * Amortization month step for a loan
 * Returns interest paid, principal paid, and new remaining balance
 */
export function processMonthlyLoanPayment(
  principal: number,
  annualRate: number,
  monthlyPayment: number,
  termMonthsRemaining: number
): {
  interestPaid: number;
  principalPaid: number;
  newBalance: number;
  newTermRemaining: number;
} {
  if (principal <= 0 || termMonthsRemaining <= 0) {
    return { interestPaid: 0, principalPaid: 0, newBalance: 0, newTermRemaining: 0 };
  }

  const monthlyRate = annualRate / 100 / 12;
  const interestPaid = Math.round(principal * monthlyRate);
  const actualPayment = Math.min(monthlyPayment, principal + interestPaid);
  const principalPaid = Math.max(0, actualPayment - interestPaid);
  const newBalance = Math.max(0, Math.round(principal - principalPaid));
  const newTermRemaining = newBalance <= 0 ? 0 : Math.max(0, termMonthsRemaining - 1);

  return {
    interestPaid,
    principalPaid,
    newBalance,
    newTermRemaining,
  };
}

/**
 * Format currency helper
 */
export function formatCurrency(amount: number): string {
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));
  const formatted = abs.toLocaleString('en-US');
  return isNegative ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Format percent helper
 */
export function formatPercent(val: number, decimals: number = 1): string {
  return `${val.toFixed(decimals)}%`;
}
