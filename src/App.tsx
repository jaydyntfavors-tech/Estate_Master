import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ActionableDecisionOption,
  ActionableEvent,
  CareerWorkEvent,
  CareerWorkOption,
  DegreeProgram,
  EquityLoan,
  GameEvent,
  JobPosition,
  LifeState,
  MarketState,
  MonthlyFinancialSummary,
  PlayerStats,
  Property,
  ScenarioPreset,
  StockAsset,
  StockHolding,
  StudentLoan,
  TaxReturnSummary,
} from './types/game';
import { SCENARIO_PRESETS, STARTER_DUPLEX } from './data/initialScenarios';
import { DEGREE_PROGRAMS, JOB_POSITIONS } from './data/careerData';
import { INITIAL_STOCK_ASSETS } from './data/stockData';
import { MARKET_CYCLES, generateRandomPropertyEvent } from './data/eventsCatalog';
import { getRandomCareerEvent, UNEMPLOYED_JOB, RETIRED_JOB } from './data/careerEvents';
import { MarketCatalogItem } from './data/marketProperties';
import {
  calculateMonthlyMortgagePayment,
  formatCurrency,
  getPropertyFinancialBreakdown,
  getPropertyTotalDebt,
  processMonthlyLoanPayment,
} from './utils/calculator';
import { advanceCreditMonth, calculateCreditReport } from './utils/creditEngine';
import { calculateYearlyTaxReturn } from './utils/taxCalculator';
import { Header } from './components/Header';
import { PortfolioOverview } from './components/PortfolioOverview';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { RefinanceModal } from './components/RefinanceModal';
import { MarketplaceModal } from './components/MarketplaceModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { EventModal } from './components/EventModal';
import { CareerEventModal } from './components/CareerEventModal';
import { RetirementLegacyModal } from './components/RetirementLegacyModal';
import { LedgerView } from './components/LedgerView';
import { MilestonesPanel } from './components/MilestonesPanel';
import { ScenarioSelectorModal } from './components/ScenarioSelectorModal';
import { CareerLifeView } from './components/CareerLifeView';
import { StockPortfolioView } from './components/StockPortfolioView';
import { TaxReturnModal } from './components/TaxReturnModal';
import { playCashSound, playClickSound, playSuccessSound, playWarningSound } from './utils/audio';
import { PlusCircle, Coins, Building2, Briefcase, TrendingUp } from 'lucide-react';

const STORAGE_KEY = 'estatemaster_save_v5';

export default function App() {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<
    'portfolio' | 'career' | 'stocks' | 'marketplace' | 'refinance' | 'ledger' | 'milestones'
  >('portfolio');

  // Player & Character Life State (18-year-old starter: $1,000 cash, 520 credit score)
  const [cash, setCash] = useState<number>(1000);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2026);
  const [properties, setProperties] = useState<Property[]>([]);

  // Stock Market Assets
  const [stockAssets, setStockAssets] = useState<StockAsset[]>(INITIAL_STOCK_ASSETS);

  // Character Career, Age, Credit & Stock Holdings State
  const [lifeState, setLifeState] = useState<LifeState>({
    ageYears: 18,
    ageMonths: 0,
    currentJob: JOB_POSITIONS[0], // Retail Store Associate ($2,300/mo)
    currentDegreeProgram: null,
    completedDegrees: [],
    fieldExperienceMonths: {
      entry: 0,
      tech: 0,
      medical: 0,
      pharmacy: 0,
      law: 0,
      public_service: 0,
      trades: 0,
    },
    studentLoans: [],
    creditCard: {
      id: 'starter_visa',
      name: 'Starter Platinum Visa',
      creditLimit: 500,
      currentBalance: 100,
      apr: 24.9,
      onTimeMonths: 1,
    },
    creditReport: {
      score: 520,
      rating: 'Poor',
      paymentHistoryPercent: 95,
      utilizationPercent: 20,
      dtiRatioPercent: 5,
      primeRateDiscount: 2.0,
    },
    stockHoldings: [],
    workStress: 15,
    hiredMasterManagementFirm: false,
    managementFeePercent: 8,
    isRetired: false,
  });

  // Market Macro State
  const [marketState, setMarketState] = useState<MarketState>(MARKET_CYCLES.steady);

  // Stats & Ledger History
  const [stats, setStats] = useState<PlayerStats>({
    cash: 1000,
    creditScore: 520,
    month: 1,
    year: 2026,
    totalRentCollected: 0,
    totalSalaryEarned: 0,
    totalDividendsCollected: 0,
    totalMortgagePaid: 0,
    totalRepairsPaid: 0,
    totalAppreciationGained: 0,
    totalTaxRefundsCollected: 0,
    totalTaxPaid: 0,
    maxPropertiesOwned: 0,
    bankruptWarningMonths: 0,
  });
  const [ledgerHistory, setLedgerHistory] = useState<MonthlyFinancialSummary[]>([]);

  // Modals & Popups
  const [inspectedProperty, setInspectedProperty] = useState<Property | null>(null);
  const [refinanceProperty, setRefinanceProperty] = useState<Property | null>(null);
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState<boolean>(false);
  const [isRefinanceModalOpen, setIsRefinanceModalOpen] = useState<boolean>(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [latestMonthlyReport, setLatestMonthlyReport] = useState<{
    summary: MonthlyFinancialSummary;
    events: GameEvent[];
  } | null>(null);
  const [activeEvent, setActiveEvent] = useState<ActionableEvent | null>(null);
  const [activeCareerEvent, setActiveCareerEvent] = useState<CareerWorkEvent | null>(null);
  const [isRetirementModalOpen, setIsRetirementModalOpen] = useState<boolean>(false);
  const [activeTaxReturn, setActiveTaxReturn] = useState<TaxReturnSummary | null>(null);

  // Career event pacing tracker
  const careerEventCounterRef = useRef<number>(0);

  // Time & Auto-simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const timerRef = useRef<number | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lifeState) {
          setCash(parsed.cash ?? 2500);
          setMonth(parsed.month ?? 1);
          setYear(parsed.year ?? 2026);
          setProperties(parsed.properties ?? []);
          setStockAssets(parsed.stockAssets ?? INITIAL_STOCK_ASSETS);
          setLifeState(parsed.lifeState);
          setMarketState(parsed.marketState ?? MARKET_CYCLES.steady);
          setStats(parsed.stats ?? stats);
          setLedgerHistory(parsed.ledgerHistory ?? []);
        }
      }
    } catch (e) {
      console.error('Failed to load save state:', e);
    }
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    try {
      const savePayload = {
        cash,
        month,
        year,
        properties,
        stockAssets,
        lifeState,
        marketState,
        stats,
        ledgerHistory,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savePayload));
    } catch (e) {
      console.error('Failed to persist state:', e);
    }
  }, [cash, month, year, properties, stockAssets, lifeState, marketState, stats, ledgerHistory]);

  // Recalculate credit report whenever loans, properties, or credit balances change
  useEffect(() => {
    const report = calculateCreditReport(
      lifeState.creditReport.score,
      lifeState.creditCard,
      lifeState.studentLoans,
      properties,
      lifeState.currentJob.monthlySalary
    );
    setLifeState((prev) => ({
      ...prev,
      creditReport: report,
    }));
  }, [
    lifeState.creditCard.currentBalance,
    lifeState.studentLoans.length,
    properties.length,
    lifeState.currentJob.monthlySalary,
  ]);

  // Handle month advance logic
  const advanceMonth = useCallback(() => {
    const nextMonth = month + 1;
    const nextYear = year + Math.floor(month / 12);
    const monthEvents: GameEvent[] = [];

    // 1. Character Age Progression
    let nextAgeYears = lifeState.ageYears;
    let nextAgeMonths = lifeState.ageMonths + 1;
    if (nextAgeMonths >= 12) {
      nextAgeYears += 1;
      nextAgeMonths = 0;
      monthEvents.push({
        id: `event-birthday-${Date.now()}`,
        month: nextMonth,
        year: nextYear,
        title: `Happy Birthday! You turned ${nextAgeYears} years old`,
        description: `Another year of life and investing experience. Your financial foundation continues to mature.`,
        type: 'career',
      });
    }

    // 1b. Age 70 Mandatory Retirement Check
    let nextJob = lifeState.currentJob;
    let nextIsRetired = lifeState.isRetired || false;
    if (nextAgeYears >= 70 && !lifeState.isRetired) {
      nextIsRetired = true;
      nextJob = RETIRED_JOB;
      setIsRetirementModalOpen(true);
      monthEvents.push({
        id: `event-retire-${Date.now()}`,
        month: nextMonth,
        year: nextYear,
        title: `Life Milestone: Non-Negotiable Retirement at Age 70`,
        description: `You have reached age 70! Mandatory retirement from traditional employment is now in effect. You transition to a guaranteed pension ($2,400/mo) while living fully off passive rental cashflow and equities!`,
        type: 'career',
      });
      playSuccessSound();
    }

    // 2. Career Paycheck & Work Experience
    const monthlySalary = nextJob.monthlySalary;
    const currentField = nextJob.field;
    const updatedExperience = {
      ...lifeState.fieldExperienceMonths,
      [currentField]: (lifeState.fieldExperienceMonths[currentField] || 0) + 1,
    };

    // 3. Education Progress
    let nextDegreeProgram = lifeState.currentDegreeProgram
      ? { ...lifeState.currentDegreeProgram }
      : null;
    let tuitionCashCost = 0;
    const nextCompletedDegrees = [...lifeState.completedDegrees];
    const nextStudentLoans: StudentLoan[] = [...lifeState.studentLoans];

    if (nextDegreeProgram) {
      nextDegreeProgram.monthsEnrolled += 1;

      // If paying cash
      if (!nextDegreeProgram.isFundedWithStudentLoan) {
        tuitionCashCost = nextDegreeProgram.degree.monthlyTuitionCash;
      }

      // Check for graduation!
      if (nextDegreeProgram.monthsEnrolled >= nextDegreeProgram.degree.durationMonths) {
        nextCompletedDegrees.push(nextDegreeProgram.degree.id);

        if (nextDegreeProgram.isFundedWithStudentLoan) {
          const loanPrincipal = nextDegreeProgram.degree.studentLoanAvailable;
          const monthlyLoanPmt = calculateMonthlyMortgagePayment(loanPrincipal, 5.5, 120);
          nextStudentLoans.push({
            id: `student-loan-${nextDegreeProgram.degree.id}-${Date.now()}`,
            name: `${nextDegreeProgram.degree.name} Student Loan`,
            principalRemaining: loanPrincipal,
            interestRate: 5.5,
            monthlyPayment: monthlyLoanPmt,
            termMonthsRemaining: 120,
          });
        }

        monthEvents.push({
          id: `event-grad-${Date.now()}`,
          month: nextMonth,
          year: nextYear,
          title: `Graduation Day! Earned ${nextDegreeProgram.degree.name}`,
          description: `You completed your studies! You are now qualified for high-paying positions in ${nextDegreeProgram.degree.field.replace(
            '_',
            ' '
          )}.`,
          type: 'career',
        });

        nextDegreeProgram = null;
        playSuccessSound();
      }
    }

    // 4. Student Loans Monthly Payments
    let totalStudentLoanPmt = 0;
    const updatedStudentLoans = nextStudentLoans
      .map((loan) => {
        const pmt = processMonthlyLoanPayment(
          loan.principalRemaining,
          loan.interestRate,
          loan.monthlyPayment,
          loan.termMonthsRemaining
        );
        totalStudentLoanPmt += loan.monthlyPayment;
        return {
          ...loan,
          principalRemaining: pmt.newBalance,
          termMonthsRemaining: pmt.newTermRemaining,
        };
      })
      .filter((l) => l.principalRemaining > 0);

    // 5. Stock Market Fluctuations & Dividends
    const stockReturnFactor =
      marketState.cycle === 'boom'
        ? 0.012 + (Math.random() * 0.008)
        : marketState.cycle === 'steady'
        ? 0.007 + (Math.random() * 0.004)
        : marketState.cycle === 'cooling'
        ? 0.001 + (Math.random() * 0.003)
        : -0.015 + (Math.random() * 0.006);

    const updatedStockAssets = stockAssets.map((asset) => {
      const priceDelta = asset.currentPrice * (stockReturnFactor * asset.volatility);
      const newPrice = Math.max(5, Number((asset.currentPrice + priceDelta).toFixed(2)));
      const updatedHistory = [...asset.priceHistory.slice(-5), newPrice];
      return {
        ...asset,
        currentPrice: newPrice,
        priceHistory: updatedHistory,
      };
    });

    let totalMonthlyDividends = 0;
    lifeState.stockHoldings.forEach((holding) => {
      const asset = updatedStockAssets.find((a) => a.symbol === holding.symbol);
      if (asset) {
        const annualDiv = asset.currentPrice * holding.shares * (asset.annualDividendYield / 100);
        totalMonthlyDividends += Math.round(annualDiv / 12);
      }
    });

    // 6. Living Expenses
    const livingExpenses = Math.min(1800, Math.max(900, Math.round(monthlySalary * 0.35)));

    // 7. Credit Card Payments
    let cardPayment = 0;
    let nextCard = { ...lifeState.creditCard };
    if (nextCard.currentBalance > 0) {
      cardPayment = Math.min(nextCard.currentBalance, Math.max(50, Math.round(nextCard.currentBalance * 0.2)));
      nextCard.currentBalance = Math.max(0, nextCard.currentBalance - cardPayment);
      nextCard.onTimeMonths += 1;
    }
    nextCard.currentBalance = Math.min(nextCard.creditLimit * 0.8, nextCard.currentBalance + 120);

    // 8. Real Estate Portfolio Processing
    let totalGrossRent = 0;
    let totalTaxes = 0;
    let totalInsurance = 0;
    let totalMaintenance = 0;
    let totalManagementFees = 0;
    let totalSeniorMortgagePayment = 0;
    let totalEquityLoanPayment = 0;
    let totalPrincipalPaidDown = 0;
    let totalAppreciationThisMonth = 0;

    const monthlyAppreciationRate = marketState.appreciationRateAnnual / 12;

    const updatedProperties = properties.map((prop) => {
      const isSelfManaged = lifeState.hiredMasterManagementFirm ? false : prop.isSelfManaged;

      const breakdown = getPropertyFinancialBreakdown({
        ...prop,
        isSelfManaged,
      });

      totalGrossRent += breakdown.grossRentCollected;
      totalTaxes += breakdown.operatingExpenses.taxes;
      totalInsurance += breakdown.operatingExpenses.insurance;
      totalMaintenance += breakdown.operatingExpenses.maintenance;
      totalManagementFees += breakdown.operatingExpenses.management;

      let updatedMortgage = prop.mortgage ? { ...prop.mortgage } : null;
      if (updatedMortgage && updatedMortgage.principalRemaining > 0) {
        const pmt = processMonthlyLoanPayment(
          updatedMortgage.principalRemaining,
          updatedMortgage.interestRate,
          updatedMortgage.monthlyPayment,
          updatedMortgage.termMonthsRemaining
        );
        totalSeniorMortgagePayment += updatedMortgage.monthlyPayment;
        totalPrincipalPaidDown += pmt.principalPaid;
        updatedMortgage.principalRemaining = pmt.newBalance;
        updatedMortgage.termMonthsRemaining = pmt.newTermRemaining;
      }

      const updatedEquityLoans: EquityLoan[] = prop.equityLoans
        .map((loan) => {
          const pmt = processMonthlyLoanPayment(
            loan.principalRemaining,
            loan.interestRate,
            loan.monthlyPayment,
            loan.termMonthsRemaining
          );
          totalEquityLoanPayment += loan.monthlyPayment;
          totalPrincipalPaidDown += pmt.principalPaid;
          return {
            ...loan,
            principalRemaining: pmt.newBalance,
            termMonthsRemaining: pmt.newTermRemaining,
          };
        })
        .filter((l) => l.principalRemaining > 0);

      const appreciationDelta = Math.round(prop.currentMarketValue * monthlyAppreciationRate);
      totalAppreciationThisMonth += appreciationDelta;
      const newCondition = Math.max(15, Math.round(prop.condition - 0.4));

      return {
        ...prop,
        isSelfManaged,
        currentMarketValue: Math.max(10000, prop.currentMarketValue + appreciationDelta),
        accumulatedAppreciation: prop.accumulatedAppreciation + appreciationDelta,
        condition: newCondition,
        mortgage: updatedMortgage,
        equityLoans: updatedEquityLoans,
      };
    });

    // 9. Financial Totals
    const totalOperatingOutflows =
      totalTaxes + totalInsurance + totalMaintenance + totalManagementFees;
    const totalRealEstateDebt = totalSeniorMortgagePayment + totalEquityLoanPayment;
    const netRentalCashFlow = totalGrossRent - totalOperatingOutflows - totalRealEstateDebt;

    const careerNetInflow =
      monthlySalary + totalMonthlyDividends - tuitionCashCost - totalStudentLoanPmt - livingExpenses - cardPayment;
    const totalMonthlyCashFlow = careerNetInflow + netRentalCashFlow;
    const newEndingCash = cash + totalMonthlyCashFlow;

    // Credit score advance
    const isOverdraft = newEndingCash < 0;
    const newScore = advanceCreditMonth(
      lifeState.creditReport.score,
      true,
      lifeState.creditReport.utilizationPercent,
      isOverdraft
    );
    const updatedCreditReport = calculateCreditReport(
      newScore,
      nextCard,
      updatedStudentLoans,
      updatedProperties,
      monthlySalary
    );

    // Overdraft warning
    let bankruptWarning = stats.bankruptWarningMonths;
    if (newEndingCash < 0) {
      bankruptWarning += 1;
      playWarningSound();
      monthEvents.push({
        id: `event-overdraft-${Date.now()}`,
        month: nextMonth,
        year: nextYear,
        title: 'Account In Overdraft',
        description: `Your checking balance fell to ${formatCurrency(newEndingCash)}. Consider selling stock, taking an equity loan, or adjusting rent!`,
        type: 'financial',
        amount: newEndingCash,
      });
    } else {
      bankruptWarning = 0;
    }

    // 10. Stress Calculation
    const selfManagedUnits = updatedProperties
      .filter((p) => p.isSelfManaged)
      .reduce((sum, p) => sum + p.units, 0);
    const calculatedStress = Math.min(
      100,
      Math.round(lifeState.currentJob.stressRating + selfManagedUnits * 6)
    );

    // 11. Property Emergency Event
    if (
      updatedProperties.length > 0 &&
      selfManagedUnits > 0 &&
      Math.random() < 0.4 &&
      !activeEvent
    ) {
      const selfManagedProps = updatedProperties.filter((p) => p.isSelfManaged);
      const randomProp = selfManagedProps[Math.floor(Math.random() * selfManagedProps.length)];
      const generatedEvent = generateRandomPropertyEvent(randomProp);
      if (generatedEvent) {
        setActiveEvent(generatedEvent);
        playWarningSound();
      }
    }

    // 12. YEARLY TAX SEASON (Every April: month % 12 === 4)
    const isAprilTaxSeason = (nextMonth - 1) % 12 === 3;

    // 11b. Random Workplace & Career Events (Every couple of months)
    careerEventCounterRef.current += 1;
    const isPlayerRetired = nextAgeYears >= 70 || nextIsRetired;
    const canTriggerCareerEvent =
      !isPlayerRetired &&
      nextJob.id !== 'job_unemployed' &&
      !activeEvent &&
      !activeCareerEvent &&
      !isAprilTaxSeason &&
      (careerEventCounterRef.current >= 5 ||
        (careerEventCounterRef.current >= 2 && Math.random() < 0.38));

    if (canTriggerCareerEvent) {
      const workEvent = getRandomCareerEvent();
      setActiveCareerEvent(workEvent);
      careerEventCounterRef.current = 0;
      playWarningSound();
    }

    if (isAprilTaxSeason) {
      const taxReturn = calculateYearlyTaxReturn(
        nextYear - 1,
        monthlySalary,
        updatedProperties,
        updatedStudentLoans,
        newEndingCash,
        totalMonthlyDividends * 12
      );
      setActiveTaxReturn(taxReturn);
      monthEvents.push({
        id: `event-tax-${Date.now()}`,
        month: nextMonth,
        year: nextYear,
        title: `April Tax Season: Form 1040 Settlement Due`,
        description: taxReturn.isRefund
          ? `IRS approved tax refund of +${formatCurrency(taxReturn.finalTaxBalance)}!`
          : `Tax liability of ${formatCurrency(Math.abs(taxReturn.finalTaxBalance))} due for settlement.`,
        type: 'tax',
      });
      playWarningSound();
    }

    // 13. Valuations
    const totalPortfolioValue = updatedProperties.reduce(
      (sum, p) => sum + p.currentMarketValue,
      0
    );
    const totalStockValue = lifeState.stockHoldings.reduce((sum, h) => {
      const asset = updatedStockAssets.find((a) => a.symbol === h.symbol);
      return sum + (asset ? asset.currentPrice * h.shares : 0);
    }, 0);
    const totalPortfolioDebt = updatedProperties.reduce(
      (sum, p) => sum + getPropertyTotalDebt(p),
      0
    );
    const totalDebtAll =
      totalPortfolioDebt +
      updatedStudentLoans.reduce((sum, l) => sum + l.principalRemaining, 0) +
      nextCard.currentBalance;
    const netWorth = totalPortfolioValue + totalStockValue - totalDebtAll + newEndingCash;

    // Statement Summary
    const summary: MonthlyFinancialSummary = {
      month: nextMonth,
      year: nextYear,
      ageYears: nextAgeYears,
      ageMonths: nextAgeMonths,
      jobSalaryEarned: monthlySalary,
      stockDividendsEarned: totalMonthlyDividends,
      studentLoanPayments: totalStudentLoanPmt,
      creditCardPayments: cardPayment,
      livingExpenses,
      grossRentalIncome: totalGrossRent,
      propertyTaxes: totalTaxes,
      insuranceTotal: totalInsurance,
      routineMaintenance: totalMaintenance,
      managementFees: totalManagementFees,
      seniorMortgagePayments: totalSeniorMortgagePayment,
      equityLoanPayments: totalEquityLoanPayment,
      specialExpenses: 0,
      netOperatingIncome: totalGrossRent - totalOperatingOutflows,
      netRentalCashFlow,
      totalMonthlyCashFlow,
      startingCash: cash,
      endingCash: newEndingCash,
      totalPropertyValue: totalPortfolioValue,
      totalStockValue,
      totalDebt: totalDebtAll,
      netWorth,
    };

    // Update state
    setMonth(nextMonth);
    setYear(nextYear);
    setCash(newEndingCash);
    setProperties(updatedProperties);
    setStockAssets(updatedStockAssets);
    setLedgerHistory((prev) => [...prev, summary]);
    setStats((prev) => ({
      ...prev,
      cash: newEndingCash,
      creditScore: newScore,
      month: nextMonth,
      year: nextYear,
      totalRentCollected: prev.totalRentCollected + totalGrossRent,
      totalSalaryEarned: prev.totalSalaryEarned + monthlySalary,
      totalDividendsCollected: prev.totalDividendsCollected + totalMonthlyDividends,
      totalMortgagePaid: prev.totalMortgagePaid + totalPrincipalPaidDown,
      totalAppreciationGained: prev.totalAppreciationGained + totalAppreciationThisMonth,
      bankruptWarningMonths: bankruptWarning,
    }));

    setLifeState((prev) => ({
      ...prev,
      ageYears: nextAgeYears,
      ageMonths: nextAgeMonths,
      currentJob: nextJob,
      isRetired: nextIsRetired,
      fieldExperienceMonths: updatedExperience,
      currentDegreeProgram: nextDegreeProgram,
      completedDegrees: nextCompletedDegrees,
      studentLoans: updatedStudentLoans,
      creditCard: nextCard,
      creditReport: updatedCreditReport,
      workStress: calculatedStress,
    }));

    if (inspectedProperty) {
      const updatedInspected = updatedProperties.find((p) => p.id === inspectedProperty.id);
      if (updatedInspected) setInspectedProperty(updatedInspected);
    }

    if (!isPlaying && !isAprilTaxSeason) {
      setLatestMonthlyReport({ summary, events: monthEvents });
      playCashSound();
    }
  }, [
    month,
    year,
    cash,
    properties,
    stockAssets,
    marketState,
    stats,
    isPlaying,
    activeEvent,
    activeCareerEvent,
    inspectedProperty,
    lifeState,
  ]);

  // Auto-simulation ticker
  useEffect(() => {
    if (isPlaying) {
      const delay = simulationSpeed === 2 ? 1400 : 2600;
      timerRef.current = window.setTimeout(() => {
        advanceMonth();
      }, delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, simulationSpeed, advanceMonth]);

  // Tax Settlement handler
  const handleSettleTax = (netBalance: number) => {
    setCash((prev) => prev + netBalance);
    setStats((prev) => ({
      ...prev,
      totalTaxRefundsCollected: netBalance > 0 ? prev.totalTaxRefundsCollected + netBalance : prev.totalTaxRefundsCollected,
      totalTaxPaid: netBalance < 0 ? prev.totalTaxPaid + Math.abs(netBalance) : prev.totalTaxPaid,
    }));
    setActiveTaxReturn(null);
  };

  // Stock trading handlers
  const handleBuyStock = (symbol: string, shares: number, totalCost: number) => {
    setCash((prev) => prev - totalCost);
    setLifeState((prev) => {
      const existing = prev.stockHoldings.find((h) => h.symbol === symbol);
      if (existing) {
        return {
          ...prev,
          stockHoldings: prev.stockHoldings.map((h) =>
            h.symbol === symbol
              ? {
                  ...h,
                  shares: h.shares + shares,
                  totalInvested: h.totalInvested + totalCost,
                  avgCostBasis: (h.totalInvested + totalCost) / (h.shares + shares),
                }
              : h
          ),
        };
      } else {
        return {
          ...prev,
          stockHoldings: [
            ...prev.stockHoldings,
            {
              symbol,
              shares,
              totalInvested: totalCost,
              avgCostBasis: totalCost / shares,
            },
          ],
        };
      }
    });
  };

  const handleSellStock = (symbol: string, shares: number, totalProceeds: number) => {
    setCash((prev) => prev + totalProceeds);
    setLifeState((prev) => ({
      ...prev,
      stockHoldings: prev.stockHoldings
        .map((h) => {
          if (h.symbol === symbol) {
            const remaining = h.shares - shares;
            return {
              ...h,
              shares: remaining,
              totalInvested: Math.max(0, h.totalInvested - h.avgCostBasis * shares),
            };
          }
          return h;
        })
        .filter((h) => h.shares > 0),
    }));
  };

  // Rent updater from card slider
  const handleUpdateRent = (propertyId: string, newRent: number) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, actualRentPerUnit: newRent } : p))
    );
  };

  // Inspect full property
  const handleInspectProperty = (property: Property) => {
    setInspectedProperty(property);
  };

  // Open refinance modal
  const handleOpenRefinance = (property?: Property) => {
    if (property) {
      setRefinanceProperty(property);
    } else {
      setRefinanceProperty(properties[0] || null);
    }
    setIsRefinanceModalOpen(true);
  };

  // Execute Cash-Out Equity Loan (BRRRR mechanism)
  const handleExecuteEquityLoan = (
    propertyId: string,
    newLoan: EquityLoan,
    cashReceived: number
  ) => {
    setCash((prev) => prev + cashReceived);
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          return {
            ...p,
            equityLoans: [...p.equityLoans, newLoan],
          };
        }
        return p;
      })
    );
    playSuccessSound();
  };

  // Purchase new property from marketplace
  const handlePurchaseProperty = (
    item: MarketCatalogItem,
    cashSpent: number,
    mortgageAmount: number,
    annualRate: number,
    termMonths: number
  ) => {
    setCash((prev) => prev - cashSpent);

    const initialTenants = Array.from({ length: item.units }).map((_, idx) => ({
      id: `tenant-${Date.now()}-${idx}`,
      name: `Tenant Unit #${idx + 1}`,
      monthlyRent: item.marketRentPerUnit,
      satisfaction: 90,
      creditScore: 720 + Math.floor(Math.random() * 60),
      leaseMonthsRemaining: 12,
      status: 'active' as const,
    }));

    const newProperty: Property = {
      id: `prop-${item.id}-${Date.now()}`,
      name: item.name,
      address: item.address,
      city: item.city,
      category: item.category,
      tier: item.tier,
      units: item.units,
      squareFeet: item.squareFeet,
      yearBuilt: item.yearBuilt,
      purchasePrice: item.basePrice,
      currentMarketValue: item.basePrice,
      condition: item.condition,
      accumulatedAppreciation: 0,
      mortgage:
        mortgageAmount > 0
          ? {
              principalRemaining: mortgageAmount,
              originalLoanAmount: mortgageAmount,
              interestRate: annualRate,
              monthlyPayment: calculateMonthlyMortgagePayment(mortgageAmount, annualRate, termMonths),
              termMonthsRemaining: termMonths,
              originalTermMonths: termMonths,
            }
          : null,
      equityLoans: [],
      actualRentPerUnit: item.marketRentPerUnit,
      marketRentPerUnit: item.marketRentPerUnit,
      tenants: initialTenants,
      insurancePlan: 'standard',
      monthlyInsuranceCost: item.monthlyInsuranceCost,
      propertyTaxRateAnnual: item.propertyTaxRateAnnual,
      baseMaintenanceCost: item.baseMaintenanceCost,
      isSelfManaged: !lifeState.hiredMasterManagementFirm,
    };

    setProperties((prev) => [...prev, newProperty]);
    setStats((prev) => ({
      ...prev,
      maxPropertiesOwned: Math.max(prev.maxPropertiesOwned, properties.length + 1),
    }));
    playSuccessSound();
  };

  // Career: Apply for new job
  const handleApplyJob = (job: JobPosition) => {
    setLifeState((prev) => ({
      ...prev,
      currentJob: job,
    }));
  };

  // Education: Enroll in degree
  const handleEnrollDegree = (degree: DegreeProgram, useStudentLoan: boolean) => {
    setLifeState((prev) => ({
      ...prev,
      currentDegreeProgram: {
        degree,
        monthsEnrolled: 0,
        isFundedWithStudentLoan: useStudentLoan,
      },
    }));
  };

  // Credit Card: Pay balance
  const handlePayCreditCard = (amount: number) => {
    const payment = Math.min(cash, amount);
    setCash((prev) => prev - payment);
    setLifeState((prev) => ({
      ...prev,
      creditCard: {
        ...prev.creditCard,
        currentBalance: Math.max(0, prev.creditCard.currentBalance - payment),
      },
    }));
  };

  // Student Loan: Extra principal payment
  const handlePayStudentLoanExtra = (loanId: string, amount: number) => {
    const payment = Math.min(cash, amount);
    setCash((prev) => prev - payment);
    setLifeState((prev) => ({
      ...prev,
      studentLoans: prev.studentLoans.map((l) =>
        l.id === loanId
          ? { ...l, principalRemaining: Math.max(0, l.principalRemaining - payment) }
          : l
      ),
    }));
  };

  // Property Management: Toggle Master Firm
  const handleToggleMasterManagement = (hire: boolean) => {
    setLifeState((prev) => ({
      ...prev,
      hiredMasterManagementFirm: hire,
    }));
    setProperties((prev) =>
      prev.map((p) => ({
        ...p,
        isSelfManaged: !hire,
      }))
    );
  };

  // Property Management: Toggle Individual Property
  const handleTogglePropertyManagement = (propertyId: string, isSelfManaged: boolean) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === propertyId ? { ...p, isSelfManaged } : p))
    );
  };

  // Quick renovation shortcut from card
  const handleQuickRenovate = (property: Property) => {
    const cost = property.units * 300;
    if (cash < cost) {
      alert(`Insufficient cash! You need ${formatCurrency(cost)} to perform routine upkeep.`);
      return;
    }
    setCash((prev) => prev - cost);
    setStats((prev) => ({ ...prev, totalRepairsPaid: prev.totalRepairsPaid + cost }));
    setProperties((prev) =>
      prev.map((p) =>
        p.id === property.id ? { ...p, condition: Math.min(100, p.condition + 8) } : p
      )
    );
    playCashSound();
  };

  // Spend cash helper
  const handleSpendCash = (amount: number, reason: string) => {
    setCash((prev) => prev - amount);
    setStats((prev) => ({ ...prev, totalRepairsPaid: prev.totalRepairsPaid + amount }));
  };

  // Update property in state
  const handleUpdateProperty = (updated: Property) => {
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setInspectedProperty(updated);
  };

  // Handle Event choice
  const handleSelectEventOption = (eventId: string, option: ActionableDecisionOption) => {
    if (!activeEvent) return;

    if (option.cost > 0) {
      setCash((prev) => prev - option.cost);
      setStats((prev) => ({
        ...prev,
        totalRepairsPaid: prev.totalRepairsPaid + option.cost,
      }));
    }

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === activeEvent.propertyId) {
          const conditionBoost = option.conditionImpact || 0;
          return {
            ...p,
            condition: Math.min(100, Math.max(10, p.condition + conditionBoost)),
          };
        }
        return p;
      })
    );

    setActiveEvent(null);
  };

  // Career Event Option selection handler
  const handleSelectCareerOption = (option: CareerWorkOption) => {
    if (!activeCareerEvent) return;

    if (option.bonusCash !== undefined && option.bonusCash > 0) {
      const bonus = option.bonusCash;
      setCash((prev) => prev + bonus);
      setStats((prev) => ({
        ...prev,
        totalSalaryEarned: prev.totalSalaryEarned + bonus,
      }));
      playCashSound();
    }

    if (option.dockPayThisMonth) {
      const docked = Math.round(lifeState.currentJob.monthlySalary * 0.7);
      setCash((prev) => prev - Math.min(prev, docked));
      playWarningSound();
    }

    if (option.monthlySalaryBonus !== undefined && option.monthlySalaryBonus > 0) {
      const raise = option.monthlySalaryBonus;
      setLifeState((prev) => ({
        ...prev,
        currentJob: {
          ...prev.currentJob,
          monthlySalary: prev.currentJob.monthlySalary + raise,
        },
      }));
      playSuccessSound();
    }

    if (option.loseJob) {
      setLifeState((prev) => ({
        ...prev,
        currentJob: UNEMPLOYED_JOB,
      }));
      playWarningSound();
    }

    if (option.creditChange) {
      const newScore = Math.min(850, Math.max(300, lifeState.creditReport.score + option.creditChange));
      setLifeState((prev) => ({
        ...prev,
        creditReport: {
          ...prev.creditReport,
          score: newScore,
        },
      }));
    }

    setActiveCareerEvent(null);
  };

  // Retirement modal handlers
  const handleContinueRetirementSandbox = () => {
    setLifeState((prev) => ({
      ...prev,
      isRetired: true,
      currentJob: RETIRED_JOB,
    }));
    setIsRetirementModalOpen(false);
  };

  const handleRestartGameAt18 = () => {
    const starter = SCENARIO_PRESETS[0];
    handleSelectScenario(starter);
    setIsRetirementModalOpen(false);
  };

  // Reset or select new scenario
  const handleSelectScenario = (scenario: ScenarioPreset) => {
    const job = JOB_POSITIONS.find((j) => j.id === scenario.startingJobId) || JOB_POSITIONS[0];

    setCash(scenario.startingCash);
    setMonth(1);
    setYear(2026);
    setProperties(scenario.initialProperties.map((p) => ({ ...p })));
    setStockAssets(INITIAL_STOCK_ASSETS);
    setMarketState(MARKET_CYCLES.steady);
    setLedgerHistory([]);

    const isStarterHustler = scenario.startingCash <= 2000;

    setLifeState({
      ageYears: scenario.startingAgeYears,
      ageMonths: 0,
      currentJob: job,
      currentDegreeProgram: null,
      completedDegrees: scenario.startingCompletedDegrees || [],
      fieldExperienceMonths: {
        entry: 0,
        tech: 0,
        medical: 0,
        pharmacy: 0,
        law: 0,
        public_service: 0,
        trades: 0,
      },
      studentLoans: scenario.startingStudentLoans || [],
      creditCard: {
        id: 'starter_visa',
        name: 'Starter Platinum Visa',
        creditLimit: isStarterHustler ? 500 : 2500,
        currentBalance: isStarterHustler ? 100 : 200,
        apr: 24.9,
        onTimeMonths: isStarterHustler ? 1 : 12,
      },
      creditReport: {
        score: scenario.startingCreditScore,
        rating: scenario.startingCreditScore < 580 ? 'Poor' : scenario.startingCreditScore < 670 ? 'Fair' : 'Good',
        paymentHistoryPercent: scenario.startingCreditScore < 580 ? 95 : 99,
        utilizationPercent: scenario.startingCreditScore < 580 ? 20 : 8,
        dtiRatioPercent: 10,
        primeRateDiscount: scenario.startingCreditScore < 580 ? 2.0 : 0,
      },
      stockHoldings: scenario.startingStockHoldings || [],
      workStress: job.stressRating,
      hiredMasterManagementFirm: false,
      managementFeePercent: 8,
      isRetired: false,
    });

    setStats({
      cash: scenario.startingCash,
      creditScore: scenario.startingCreditScore,
      month: 1,
      year: 2026,
      totalRentCollected: 0,
      totalSalaryEarned: 0,
      totalDividendsCollected: 0,
      totalMortgagePaid: 0,
      totalRepairsPaid: 0,
      totalAppreciationGained: 0,
      totalTaxRefundsCollected: 0,
      totalTaxPaid: 0,
      maxPropertiesOwned: scenario.initialProperties.length,
      bankruptWarningMonths: 0,
    });

    setIsScenarioModalOpen(false);
    playSuccessSound();
  };

  // Dynamic financial totals for header status bar and portfolio
  const totalPropertyValue = properties.reduce((sum, p) => sum + p.currentMarketValue, 0);
  const totalStockValue = lifeState.stockHoldings.reduce((sum, h) => {
    const asset = stockAssets.find((a) => a.symbol === h.symbol);
    return sum + (asset ? asset.currentPrice * h.shares : 0);
  }, 0);
  const totalRealEstateDebt = properties.reduce((sum, p) => sum + getPropertyTotalDebt(p), 0);
  const totalStudentDebt = lifeState.studentLoans.reduce((sum, l) => sum + l.principalRemaining, 0);
  const totalDebtAll = totalRealEstateDebt + totalStudentDebt + lifeState.creditCard.currentBalance;
  const currentNetWorth = totalPropertyValue + totalStockValue - totalDebtAll + cash;

  const netRentalCashFlow = properties.reduce((sum, p) => {
    const b = getPropertyFinancialBreakdown(p);
    return sum + b.netCashFlow;
  }, 0);
  const currentMonthlySalary = lifeState.currentJob.monthlySalary;
  const estimatedLivingCosts = Math.min(1800, Math.max(900, Math.round(currentMonthlySalary * 0.35)));
  const totalStudentLoanPmt = lifeState.studentLoans.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const currentMonthlyCashFlow = currentMonthlySalary + netRentalCashFlow - estimatedLivingCosts - totalStudentLoanPmt;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Universal Top Bar */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        month={month}
        year={year}
        ageYears={lifeState.ageYears}
        ageMonths={lifeState.ageMonths}
        cash={cash}
        netWorth={currentNetWorth}
        creditScore={lifeState.creditReport.score}
        monthlyCashFlow={currentMonthlyCashFlow}
        jobTitle={lifeState.currentJob.title}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        simulationSpeed={simulationSpeed}
        setSimulationSpeed={setSimulationSpeed}
        onAdvanceMonth={advanceMonth}
        onResetScenario={() => setIsScenarioModalOpen(true)}
        actionableEventsCount={(activeEvent ? 1 : 0) + (activeCareerEvent ? 1 : 0)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Tab 1: Portfolio View */}
        {currentTab === 'portfolio' && (
          <div className="space-y-8">
            {/* Top Portfolio KPI Banner & Heatmap */}
            <PortfolioOverview
              cash={cash}
              creditScore={lifeState.creditReport.score}
              properties={properties}
              marketState={marketState}
              onOpenMarketplace={() => setCurrentTab('marketplace')}
              onOpenRefinance={() => handleOpenRefinance()}
            />

            {/* Managed Real Estate Holdings */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Managed Real Estate Holdings ({properties.length})
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Adjust rent to cover mortgage fees, manage wear & tear, and cash-out equity to fund next deals.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('stocks')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Stock Market</span>
                  </button>

                  <button
                    onClick={() => handleOpenRefinance()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>Borrow Equity</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('marketplace')}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Acquire Property</span>
                  </button>
                </div>
              </div>

              {/* Properties Grid */}
              {properties.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 space-y-4">
                  <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-white">No Properties Currently Owned</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      You are earning {formatCurrency(lifeState.currentJob.monthlySalary)}/mo at your job. Save your salary, invest in index funds, or scout starter homes!
                    </p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setCurrentTab('career')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      View Career & Degrees
                    </button>
                    <button
                      onClick={() => setCurrentTab('stocks')}
                      className="px-4 py-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors"
                    >
                      Trade Index Funds
                    </button>
                    <button
                      onClick={() => setCurrentTab('marketplace')}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all"
                    >
                      Browse Starter Homes
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      onInspect={handleInspectProperty}
                      onRefinance={(p) => handleOpenRefinance(p)}
                      onQuickRenovate={handleQuickRenovate}
                      onUpdateRent={handleUpdateRent}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Career & Life View */}
        {currentTab === 'career' && (
          <CareerLifeView
            lifeState={lifeState}
            cash={cash}
            properties={properties}
            onApplyJob={handleApplyJob}
            onEnrollDegree={handleEnrollDegree}
            onPayCreditCard={handlePayCreditCard}
            onPayStudentLoanExtra={handlePayStudentLoanExtra}
            onToggleMasterManagement={handleToggleMasterManagement}
            onTogglePropertyManagement={handleTogglePropertyManagement}
          />
        )}

        {/* Tab 3: Stock Portfolio View */}
        {currentTab === 'stocks' && (
          <StockPortfolioView
            stockAssets={stockAssets}
            holdings={lifeState.stockHoldings}
            cash={cash}
            marketState={marketState}
            onBuyStock={handleBuyStock}
            onSellStock={handleSellStock}
          />
        )}

        {/* Tab 4: Acquisitions Marketplace View */}
        {currentTab === 'marketplace' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Property Acquisitions & Scaling
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expand from starter residential to multi-family flats, commercial strip malls, and trophy skyscrapers.
                </p>
              </div>
            </div>

            <MarketplaceModal
              cash={cash}
              creditScore={lifeState.creditReport.score}
              marketState={marketState}
              ownedPropertyIds={properties.map((p) => p.id)}
              onClose={() => setCurrentTab('portfolio')}
              onPurchaseProperty={handlePurchaseProperty}
              onOpenRefinance={() => setCurrentTab('refinance')}
            />
          </div>
        )}

        {/* Tab 5: Equity & Refinance View */}
        {currentTab === 'refinance' && (
          <div className="space-y-4">
            <RefinanceModal
              properties={properties}
              marketState={marketState}
              onClose={() => setCurrentTab('portfolio')}
              onExecuteEquityLoan={handleExecuteEquityLoan}
            />
          </div>
        )}

        {/* Tab 6: Financial Ledger View */}
        {currentTab === 'ledger' && (
          <LedgerView stats={stats} history={ledgerHistory} properties={properties} />
        )}

        {/* Tab 7: Milestones & Trophy View */}
        {currentTab === 'milestones' && (
          <MilestonesPanel stats={stats} properties={properties} cash={cash} />
        )}
      </main>

      {/* Floating Modals */}
      {/* 1. Property Detail Deep-Dive Inspector */}
      {inspectedProperty && (
        <PropertyDetailModal
          property={inspectedProperty}
          cash={cash}
          onClose={() => setInspectedProperty(null)}
          onUpdateProperty={handleUpdateProperty}
          onOpenRefinance={(p) => handleOpenRefinance(p)}
          onSpendCash={handleSpendCash}
        />
      )}

      {/* 2. Refinance Modal */}
      {isRefinanceModalOpen && (
        <RefinanceModal
          properties={properties}
          selectedPropertyId={refinanceProperty?.id}
          marketState={marketState}
          onClose={() => setIsRefinanceModalOpen(false)}
          onExecuteEquityLoan={handleExecuteEquityLoan}
        />
      )}

      {/* 3. Marketplace Modal */}
      {isMarketplaceOpen && (
        <MarketplaceModal
          cash={cash}
          creditScore={lifeState.creditReport.score}
          marketState={marketState}
          ownedPropertyIds={properties.map((p) => p.id)}
          onClose={() => setIsMarketplaceOpen(false)}
          onPurchaseProperty={handlePurchaseProperty}
          onOpenRefinance={() => {
            setIsMarketplaceOpen(false);
            setIsRefinanceModalOpen(true);
          }}
        />
      )}

      {/* 4. Actionable Landlord Emergency Event */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          cash={cash}
          onSelectOption={handleSelectEventOption}
        />
      )}

      {/* 4b. Random Workplace & Career Decision Event */}
      {activeCareerEvent && (
        <CareerEventModal
          event={activeCareerEvent}
          currentJobTitle={lifeState.currentJob.title}
          onSelectOption={handleSelectCareerOption}
        />
      )}

      {/* 4c. Non-Negotiable Retirement & Hall of Fame Modal (Age 70+) */}
      {isRetirementModalOpen && (
        <RetirementLegacyModal
          ageYears={lifeState.ageYears}
          netWorth={currentNetWorth}
          cash={cash}
          properties={properties}
          stats={stats}
          onContinueSandbox={handleContinueRetirementSandbox}
          onNewGame={handleRestartGameAt18}
        />
      )}

      {/* 5. Yearly Tax Return Filing Modal (Every April) */}
      {activeTaxReturn && (
        <TaxReturnModal
          taxSummary={activeTaxReturn}
          onSettleTax={handleSettleTax}
        />
      )}

      {/* 6. Monthly Report Settlement Statement */}
      {latestMonthlyReport && (
        <MonthlyReportModal
          summary={latestMonthlyReport.summary}
          monthEvents={latestMonthlyReport.events}
          onClose={() => setLatestMonthlyReport(null)}
        />
      )}

      {/* 7. Scenario Preset Selector Modal */}
      {isScenarioModalOpen && (
        <ScenarioSelectorModal
          onClose={() => setIsScenarioModalOpen(false)}
          onSelectScenario={handleSelectScenario}
        />
      )}
    </div>
  );
}
