export type PropertyCategory =
  | 'starter_residential'
  | 'multi_family'
  | 'apartment_complex'
  | 'commercial_retail'
  | 'commercial_office'
  | 'commercial_industrial';

export type InsurancePlan = 'basic' | 'standard' | 'premium';

export interface MortgageDetails {
  principalRemaining: number;
  originalLoanAmount: number;
  interestRate: number; // annual % e.g. 6.5
  monthlyPayment: number;
  termMonthsRemaining: number;
  originalTermMonths: number;
}

export interface EquityLoan {
  id: string;
  name: string;
  principalRemaining: number;
  interestRate: number; // annual % e.g. 7.5
  monthlyPayment: number;
  termMonthsRemaining: number;
  originalLoanAmount: number;
}

export interface Tenant {
  id: string;
  name: string;
  monthlyRent: number;
  satisfaction: number; // 0 - 100
  creditScore: number;
  leaseMonthsRemaining: number;
  status: 'active' | 'late' | 'notice_given';
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  category: PropertyCategory;
  tier: number; // 1 to 5
  units: number;
  squareFeet: number;
  yearBuilt: number;

  // Valuation & Condition
  purchasePrice: number;
  currentMarketValue: number;
  condition: number; // 0 to 100
  accumulatedAppreciation: number;

  // Financing
  mortgage: MortgageDetails | null;
  equityLoans: EquityLoan[];

  // Rental Settings
  actualRentPerUnit: number;
  marketRentPerUnit: number;
  tenants: Tenant[];

  // Operating Costs
  insurancePlan: InsurancePlan;
  monthlyInsuranceCost: number;
  propertyTaxRateAnnual: number; // e.g. 0.015 (1.5%)
  baseMaintenanceCost: number; // baseline monthly upkeep
  isSelfManaged: boolean; // if false, 8% property management fee

  // Status
  isUnderRenovation?: boolean;
  renovationMonthsLeft?: number;
}

export type MarketCycle = 'boom' | 'steady' | 'cooling' | 'recession';

export interface MarketState {
  cycle: MarketCycle;
  name: string;
  description: string;
  appreciationRateAnnual: number; // e.g. 0.045 = 4.5%
  benchmarkMortgageRate: number; // e.g. 6.5 = 6.5%
  inflationRate: number;
  demandIndex: number; // 0.8 to 1.3 multiplier for market rent
  stockMarketReturnAnnual: number; // e.g. 0.12 (12%) in boom, -0.15 in recession
  monthsInCycle: number;
}

export interface GameEvent {
  id: string;
  month: number;
  year: number;
  title: string;
  description: string;
  type: 'financial' | 'tenant' | 'maintenance' | 'market' | 'milestone' | 'career' | 'tax';
  amount?: number; // positive = income/gain, negative = cost
  propertyId?: string;
  propertyName?: string;
}

export interface ActionableDecisionOption {
  id: string;
  label: string;
  cost: number;
  description: string;
  conditionImpact?: number;
  satisfactionImpact?: number;
  riskDescription?: string;
}

export interface ActionableEvent {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  options: ActionableDecisionOption[];
}

// -------------------------------------------------------------
// Character Life, Education, Jobs & Credit System
// -------------------------------------------------------------

export type CareerField =
  | 'entry'
  | 'tech'
  | 'medical'
  | 'pharmacy'
  | 'law'
  | 'public_service'
  | 'trades';

export interface DegreeProgram {
  id: string;
  name: string;
  field: CareerField;
  durationMonths: number;
  totalTuitionCost: number;
  monthlyTuitionCash: number;
  studentLoanAvailable: number;
  description: string;
}

export interface JobPosition {
  id: string;
  title: string;
  field: CareerField;
  tier: number; // 1 to 4
  monthlySalary: number; // gross monthly
  requiredDegreeId: string | null;
  experienceMonthsRequired: number;
  description: string;
  stressRating: number; // 10 - 80
}

export interface CareerWorkOption {
  id: string;
  label: string;
  description: string;
  outcomeText: string;
  bonusCash?: number;
  promotedToJobId?: string;
  monthlySalaryBonus?: number;
  loseJob?: boolean;
  dockPayThisMonth?: boolean;
  stressChange?: number;
  creditChange?: number;
}

export interface CareerWorkEvent {
  id: string;
  title: string;
  scenario: string;
  field: CareerField | 'any';
  options: CareerWorkOption[];
}

export interface StudentLoan {
  id: string;
  name: string;
  principalRemaining: number;
  interestRate: number; // annual % e.g. 5.5
  monthlyPayment: number;
  termMonthsRemaining: number;
}

export interface CreditCardAccount {
  id: string;
  name: string;
  creditLimit: number;
  currentBalance: number;
  apr: number;
  onTimeMonths: number;
}

export interface CreditReport {
  score: number; // 300 - 850
  rating: 'Poor' | 'Fair' | 'Good' | 'Very Good' | 'Exceptional';
  paymentHistoryPercent: number; // e.g. 99%
  utilizationPercent: number; // e.g. 12%
  dtiRatioPercent: number; // Debt-to-income
  primeRateDiscount: number; // -0.5% or +1.5%
}

// -------------------------------------------------------------
// Stock Market & Equities System
// -------------------------------------------------------------

export interface StockAsset {
  symbol: string;
  name: string;
  category: 'Broad Market ETF' | 'Tech Growth 100' | 'Real Estate REIT' | 'Treasury Yield';
  currentPrice: number;
  annualDividendYield: number; // % e.g. 1.8
  volatility: number; // multiplier
  description: string;
  priceHistory: number[];
}

export interface StockHolding {
  symbol: string;
  shares: number;
  avgCostBasis: number;
  totalInvested: number;
}

// -------------------------------------------------------------
// Yearly Tax Season System (April Filing)
// -------------------------------------------------------------

export interface TaxReturnSummary {
  taxYear: number;
  w2SalaryIncome: number;
  grossRentalIncome: number;
  stockDividendIncome: number;
  totalGrossIncome: number;

  // Deductions & Real Estate Shelters
  depreciationDeduction: number; // Depreciation write-off (27.5-year straight line)
  mortgageInterestDeduction: number;
  operatingExpensesDeduction: number;
  studentLoanInterestDeduction: number;
  totalTaxDeductions: number;

  // Liquid Cash / Inefficiency penalty
  liquidCashPenalty: number;
  netTaxableIncome: number;
  baseTaxLiability: number;
  taxWithheld: number;

  finalTaxBalance: number; // >0 is REFUND, <0 is TAX BILL
  isRefund: boolean;
  effectiveTaxRate: number;
  taxAdvice: string;
}

export interface LifeState {
  ageYears: number; // Starts at 18
  ageMonths: number; // 0 - 11
  currentJob: JobPosition;
  currentDegreeProgram: {
    degree: DegreeProgram;
    monthsEnrolled: number;
    isFundedWithStudentLoan: boolean;
  } | null;
  completedDegrees: string[];
  fieldExperienceMonths: Record<CareerField, number>;
  studentLoans: StudentLoan[];
  creditCard: CreditCardAccount;
  creditReport: CreditReport;
  stockHoldings: StockHolding[];
  workStress: number; // 0 - 100
  hiredMasterManagementFirm: boolean; // Portfoliowide auto-management
  managementFeePercent: number; // default 8%
  isRetired?: boolean;
  salaryBonus?: number;
}

export interface MonthlyFinancialSummary {
  month: number;
  year: number;
  ageYears: number;
  ageMonths: number;

  // Day Job & Life
  jobSalaryEarned: number;
  stockDividendsEarned: number;
  studentLoanPayments: number;
  creditCardPayments: number;
  livingExpenses: number;

  // Real Estate Portfolio
  grossRentalIncome: number;
  propertyTaxes: number;
  insuranceTotal: number;
  routineMaintenance: number;
  managementFees: number;
  seniorMortgagePayments: number;
  equityLoanPayments: number;
  specialExpenses: number;

  netOperatingIncome: number; // Before property debt
  netRentalCashFlow: number; // After property debt
  totalMonthlyCashFlow: number; // Salary + Rental Net + Dividends - Living & Student Debt
  startingCash: number;
  endingCash: number;
  totalPropertyValue: number;
  totalStockValue: number;
  totalDebt: number;
  netWorth: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  difficulty: 'Beginner' | 'Moderate' | 'Challenging' | 'Sandbox';
  description: string;
  startingAgeYears: number;
  startingCash: number;
  startingCreditScore: number;
  startingJobId: string;
  initialProperties: Property[];
  startingStudentLoans?: StudentLoan[];
  startingCompletedDegrees?: string[];
  startingStockHoldings?: StockHolding[];
}

export interface PlayerStats {
  cash: number;
  creditScore: number;
  month: number;
  year: number;
  totalRentCollected: number;
  totalSalaryEarned: number;
  totalDividendsCollected: number;
  totalMortgagePaid: number;
  totalRepairsPaid: number;
  totalAppreciationGained: number;
  totalTaxRefundsCollected: number;
  totalTaxPaid: number;
  maxPropertiesOwned: number;
  bankruptWarningMonths: number;
}
