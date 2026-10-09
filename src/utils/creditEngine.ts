import { CreditCardAccount, CreditReport, StudentLoan, Property } from '../types/game';
import { getSeniorMortgagePayment, getEquityLoansPayment } from './calculator';

export function calculateCreditReport(
  baseScore: number,
  card: CreditCardAccount,
  studentLoans: StudentLoan[],
  properties: Property[],
  monthlySalary: number
): CreditReport {
  // Utilization
  const cardBalance = card.currentBalance;
  const cardLimit = Math.max(500, card.creditLimit);
  const utilization = Math.min(100, Math.round((cardBalance / cardLimit) * 100));

  // Total Debt Service
  const cardMin = Math.round(cardBalance * 0.03);
  const studentLoanMonthly = studentLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const propertyDebtMonthly = properties.reduce(
    (sum, p) => sum + getSeniorMortgagePayment(p) + getEquityLoansPayment(p),
    0
  );
  const totalMonthlyDebtObligations = cardMin + studentLoanMonthly + propertyDebtMonthly;

  // Total Gross Income
  const totalRentalGross = properties.reduce(
    (sum, p) => sum + p.units * p.actualRentPerUnit,
    0
  );
  const totalGrossIncome = Math.max(1000, monthlySalary + totalRentalGross);

  const dtiRatio = Math.min(100, Math.round((totalMonthlyDebtObligations / totalGrossIncome) * 100));

  // Determine score rating
  let rating: CreditReport['rating'] = 'Good';
  let primeRateDiscount = 0;

  if (baseScore >= 780) {
    rating = 'Exceptional';
    primeRateDiscount = -0.5;
  } else if (baseScore >= 720) {
    rating = 'Very Good';
    primeRateDiscount = -0.25;
  } else if (baseScore >= 660) {
    rating = 'Good';
    primeRateDiscount = 0;
  } else if (baseScore >= 600) {
    rating = 'Fair';
    primeRateDiscount = 1.25;
  } else {
    rating = 'Poor';
    primeRateDiscount = 2.5;
  }

  return {
    score: Math.min(850, Math.max(300, baseScore)),
    rating,
    paymentHistoryPercent: 99,
    utilizationPercent: utilization,
    dtiRatioPercent: dtiRatio,
    primeRateDiscount,
  };
}

export function advanceCreditMonth(
  currentScore: number,
  isCardPaidOnTime: boolean,
  utilizationPercent: number,
  hasOverdraft: boolean
): number {
  let scoreDelta = 0;

  if (isCardPaidOnTime) {
    scoreDelta += 3;
  } else {
    scoreDelta -= 35;
  }

  if (utilizationPercent < 15) {
    scoreDelta += 2;
  } else if (utilizationPercent > 60) {
    scoreDelta -= 8;
  }

  if (hasOverdraft) {
    scoreDelta -= 25;
  }

  return Math.min(850, Math.max(300, currentScore + scoreDelta));
}
