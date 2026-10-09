import React, { useState } from 'react';
import {
  CareerField,
  DegreeProgram,
  JobPosition,
  LifeState,
  Property,
  StudentLoan,
} from '../types/game';
import { DEGREE_PROGRAMS, JOB_POSITIONS } from '../data/careerData';
import { formatCurrency, formatPercent } from '../utils/calculator';
import {
  GraduationCap,
  Briefcase,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { playCashSound, playClickSound, playSuccessSound } from '../utils/audio';

interface CareerLifeViewProps {
  lifeState: LifeState;
  cash: number;
  properties: Property[];
  onApplyJob: (job: JobPosition) => void;
  onEnrollDegree: (degree: DegreeProgram, useStudentLoan: boolean) => void;
  onPayCreditCard: (amount: number) => void;
  onPayStudentLoanExtra: (loanId: string, amount: number) => void;
  onToggleMasterManagement: (hire: boolean) => void;
  onTogglePropertyManagement: (propertyId: string, isSelfManaged: boolean) => void;
}

export const CareerLifeView: React.FC<CareerLifeViewProps> = ({
  lifeState,
  cash,
  properties,
  onApplyJob,
  onEnrollDegree,
  onPayCreditCard,
  onPayStudentLoanExtra,
  onToggleMasterManagement,
  onTogglePropertyManagement,
}) => {
  const [activeTab, setActiveTab] = useState<'career' | 'education' | 'credit' | 'management'>('career');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('all');

  const {
    ageYears,
    ageMonths,
    currentJob,
    currentDegreeProgram,
    completedDegrees,
    fieldExperienceMonths,
    studentLoans,
    creditCard,
    creditReport,
    workStress,
    hiredMasterManagementFirm,
  } = lifeState;

  // Filter jobs
  const availableJobs = JOB_POSITIONS.filter((j) => {
    if (selectedFieldFilter === 'all') return true;
    return j.field === selectedFieldFilter;
  });

  // Check if eligible for job
  const checkJobEligibility = (job: JobPosition) => {
    const hasDegree = !job.requiredDegreeId || completedDegrees.includes(job.requiredDegreeId);
    const exp = fieldExperienceMonths[job.field] || 0;
    const hasExp = exp >= job.experienceMonthsRequired;
    return {
      eligible: hasDegree && hasExp,
      missingDegree: !hasDegree,
      missingExp: !hasExp,
      requiredExp: job.experienceMonthsRequired,
      currentExp: exp,
    };
  };

  const selfManagedCount = properties.filter((p) => p.isSelfManaged).length;
  const managedCount = properties.filter((p) => !p.isSelfManaged).length;

  return (
    <div className="space-y-6">
      {/* Life & Character Identity Banner */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <span className="text-xs text-slate-400 font-medium">Character Age</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {ageYears} <span className="text-sm font-normal text-slate-400">yrs</span> {ageMonths} <span className="text-sm font-normal text-slate-400">mos</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {ageYears < 22 ? 'Young Adult' : ageYears < 35 ? 'Career Builder' : ageYears < 50 ? 'Wealth Accumulation' : 'Estate Tycoon'}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Current Day Job</span>
          <div className="text-base font-bold text-emerald-400 mt-1 truncate">
            {currentJob.title}
          </div>
          <div className="text-xs font-mono text-slate-300 tabular-nums mt-0.5">
            {formatCurrency(currentJob.monthlySalary)}/mo salary ({formatCurrency(currentJob.monthlySalary * 12)}/yr)
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">FICO Credit Score</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {creditReport.score}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {creditReport.rating} · DTI {creditReport.dtiRatioPercent}%
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-400 font-medium">Landlord Workload & Stress</span>
          <div className="flex items-center justify-between text-xs font-mono mt-1">
            <span
              className={
                workStress > 60
                  ? 'text-rose-400 font-bold'
                  : workStress > 30
                  ? 'text-amber-400 font-semibold'
                  : 'text-emerald-400 font-semibold'
              }
            >
              {workStress}% Stress
            </span>
            <span className="text-slate-400 text-[11px]">
              {selfManagedCount > 0 ? `${selfManagedCount} self-managed` : '100% passive'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div
              className={`h-full transition-all ${
                workStress > 60 ? 'bg-rose-500' : workStress > 30 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${workStress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => {
            setActiveTab('career');
            playClickSound();
          }}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'career'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Day Jobs & Promotions</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('education');
            playClickSound();
          }}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'education'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Higher Education & Degrees</span>
          {currentDegreeProgram && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('credit');
            playClickSound();
          }}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'credit'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Credit Bureau & Student Debt</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('management');
            playClickSound();
          }}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'management'
              ? 'border-emerald-400 text-emerald-400 font-semibold'
              : 'border-transparent hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Passive Income & Property Managers</span>
        </button>
      </div>

      {/* Tab 1: Career & Jobs */}
      {activeTab === 'career' && (
        <div className="space-y-6">
          {/* Unemployment alert banner */}
          {currentJob.id === 'job_unemployed' && (
            <div className="p-4 rounded-xl border border-rose-500/50 bg-rose-950/30 flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
              <div className="text-xs text-rose-200">
                <strong className="text-white block font-semibold text-sm">
                  You are currently unemployed!
                </strong>
                You were terminated or stepped away from your role. Select any entry-level job (such as Retail Associate or Logistics Fulfillment) or eligible career below to start earning a steady paycheck again!
              </div>
            </div>
          )}

          {/* Current Job Spotlight */}
          <div className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            currentJob.id === 'job_unemployed'
              ? 'border-rose-500/30 bg-rose-950/10'
              : 'border-slate-800 bg-slate-900/40'
          }`}>
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Your Current Employment
              </span>
              <h3 className="text-lg font-bold text-white mt-1">{currentJob.title}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">{currentJob.description}</p>
            </div>
            <div className="text-right font-mono tabular-nums shrink-0">
              <div className="text-xs text-slate-400">Monthly Paycheck</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                {formatCurrency(currentJob.monthlySalary)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Deposited automatically each month
              </div>
            </div>
          </div>

          {/* Job Filter Controls */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold shrink-0">Filter by Field:</span>
            {[
              { id: 'all', label: 'All Careers' },
              { id: 'entry', label: 'Entry Level' },
              { id: 'public_service', label: 'Police & Public Safety' },
              { id: 'trades', label: 'Electrician & Trades' },
              { id: 'tech', label: 'Computer Science & Tech' },
              { id: 'pharmacy', label: 'Pharmacy' },
              { id: 'law', label: 'Law & Legal' },
              { id: 'medical', label: 'Medicine & Doctors' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setSelectedFieldFilter(f.id);
                  playClickSound();
                }}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  selectedFieldFilter === f.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Job Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableJobs.map((job) => {
              const isCurrent = job.id === currentJob.id;
              const { eligible, missingDegree, missingExp, requiredExp, currentExp } =
                checkJobEligibility(job);

              return (
                <div
                  key={job.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-emerald-500/60 bg-emerald-950/15'
                      : eligible
                      ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      : 'border-slate-800/50 bg-slate-950/40 opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-400 capitalize">
                        {job.field.replace('_', ' ')} · Tier {job.tier}
                      </span>
                      {isCurrent && (
                        <span className="text-[11px] text-emerald-400 font-mono font-medium">
                          CURRENT JOB
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-white mt-1.5">{job.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {job.description}
                    </p>

                    <div className="mt-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono tabular-nums text-xs space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Monthly Salary:</span>
                        <span className="text-emerald-400 font-bold">
                          {formatCurrency(job.monthlySalary)}/mo
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Annual Earnings:</span>
                        <span className="text-white">
                          {formatCurrency(job.monthlySalary * 12)}/yr
                        </span>
                      </div>
                    </div>

                    {/* Requirements readout */}
                    <div className="mt-3 text-[11px] space-y-1">
                      {job.requiredDegreeId && (
                        <div
                          className={`flex items-center gap-1.5 ${
                            completedDegrees.includes(job.requiredDegreeId)
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {completedDegrees.includes(job.requiredDegreeId) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          )}
                          <span>
                            Requires:{' '}
                            {DEGREE_PROGRAMS.find((d) => d.id === job.requiredDegreeId)?.name}
                          </span>
                        </div>
                      )}
                      {job.experienceMonthsRequired > 0 && (
                        <div
                          className={`flex items-center gap-1.5 ${
                            currentExp >= requiredExp ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Experience: {currentExp} / {requiredExp} mos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg cursor-default"
                      >
                        Currently Employed Here
                      </button>
                    ) : eligible ? (
                      <button
                        onClick={() => {
                          onApplyJob(job);
                          playSuccessSound();
                        }}
                        className="w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>Accept Position & Start</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 text-xs font-medium text-slate-500 bg-slate-900 border border-slate-800 rounded-lg cursor-not-allowed"
                      >
                        {missingDegree ? 'Degree Required' : 'More Experience Needed'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Higher Education & Degrees */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          {/* Active Enrollment Banner if studying */}
          {currentDegreeProgram && (
            <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>Actively Enrolled in University</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    {currentDegreeProgram.degree.name}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {currentDegreeProgram.isFundedWithStudentLoan
                      ? 'Funded via Federal Student Loan (Payments defer until graduation)'
                      : `Funded out-of-pocket: ${formatCurrency(
                          currentDegreeProgram.degree.monthlyTuitionCash
                        )}/mo deducted from monthly income`}
                  </p>
                </div>

                <div className="text-right font-mono tabular-nums shrink-0">
                  <div className="text-xs text-slate-400">Completion Progress</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {currentDegreeProgram.monthsEnrolled} / {currentDegreeProgram.degree.durationMonths} mos
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentDegreeProgram.monthsEnrolled /
                        currentDegreeProgram.degree.durationMonths) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Completed Degrees Roster */}
          {completedDegrees.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Diplomas & Credentials Earned:
              </span>
              <div className="flex flex-wrap gap-2">
                {completedDegrees.map((degId) => {
                  const deg = DEGREE_PROGRAMS.find((d) => d.id === degId);
                  return (
                    <span
                      key={degId}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {deg?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Degree Offerings Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Available Degree & Vocational Programs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEGREE_PROGRAMS.map((program) => {
                const isCompleted = completedDegrees.includes(program.id);
                const isCurrentlyEnrolled = currentDegreeProgram?.degree.id === program.id;

                return (
                  <div
                    key={program.id}
                    className={`p-5 rounded-xl border flex flex-col justify-between transition-all ${
                      isCompleted
                        ? 'border-emerald-500/30 bg-emerald-950/10'
                        : isCurrentlyEnrolled
                        ? 'border-emerald-500 bg-slate-900'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                        <span>Duration: {program.durationMonths} Months ({Math.round(program.durationMonths / 12)} Yrs)</span>
                        {isCompleted && (
                          <span className="text-emerald-400 font-semibold">GRADUATED</span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-white mt-1.5">{program.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {program.description}
                      </p>

                      <div className="mt-3.5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 font-mono tabular-nums text-xs space-y-1">
                        <div className="flex justify-between text-slate-400">
                          <span>Total Tuition:</span>
                          <span className="text-white font-bold">{formatCurrency(program.totalTuitionCost)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Monthly Tuition (Cash):</span>
                          <span className="text-amber-300 font-medium">{formatCurrency(program.monthlyTuitionCash)}/mo</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Student Loan Available:</span>
                          <span className="text-sky-400">{formatCurrency(program.studentLoanAvailable)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                      {isCompleted ? (
                        <div className="text-center py-2 text-xs font-semibold text-emerald-400">
                          Degree Completed
                        </div>
                      ) : isCurrentlyEnrolled ? (
                        <div className="text-center py-2 text-xs font-semibold text-sky-400 font-mono">
                          Currently Studying...
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              onEnrollDegree(program, false);
                              playCashSound();
                            }}
                            disabled={currentDegreeProgram !== null}
                            className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                              currentDegreeProgram !== null
                                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                                : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-white'
                            }`}
                          >
                            Pay Cash
                          </button>
                          <button
                            onClick={() => {
                              onEnrollDegree(program, true);
                              playSuccessSound();
                            }}
                            disabled={currentDegreeProgram !== null}
                            className={`py-2 text-xs font-bold rounded-lg transition-colors ${
                              currentDegreeProgram !== null
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950'
                            }`}
                          >
                            Student Loan
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Credit Bureau & Student Debt */}
      {activeTab === 'credit' && (
        <div className="space-y-6">
          {/* Credit Overview */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">FICO Credit Score</span>
              <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
                {creditReport.score}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Rating: <strong className="text-white">{creditReport.rating}</strong> (Prime loan rate discount: {creditReport.primeRateDiscount}%)
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Credit Card Utilization</span>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {creditReport.utilizationPercent}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Balance: {formatCurrency(creditCard.currentBalance)} / {formatCurrency(creditCard.creditLimit)} limit
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Debt-to-Income (DTI) Ratio</span>
              <div
                className={`text-2xl font-bold font-mono tabular-nums ${
                  creditReport.dtiRatioPercent <= 36
                    ? 'text-emerald-400'
                    : creditReport.dtiRatioPercent <= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {creditReport.dtiRatioPercent}%
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {creditReport.dtiRatioPercent <= 36
                  ? 'Healthy debt load. Mortgage underwriters approve instantly.'
                  : 'Elevated debt. Pay down cards or student debt to qualify for larger mortgages.'}
              </p>
            </div>
          </div>

          {/* Revolving Credit Card Control */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>{creditCard.name}</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep utilization low and pay monthly on-time to steadily increase your FICO score.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {creditCard.currentBalance > 0 && (
                  <button
                    onClick={() => {
                      onPayCreditCard(creditCard.currentBalance);
                      playCashSound();
                    }}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm transition-all"
                  >
                    Pay Balance in Full ({formatCurrency(creditCard.currentBalance)})
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono tabular-nums bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              <div>
                <span className="text-slate-500">Current Balance:</span>
                <div className="text-white font-bold mt-0.5">{formatCurrency(creditCard.currentBalance)}</div>
              </div>
              <div>
                <span className="text-slate-500">Available Limit:</span>
                <div className="text-emerald-400 font-bold mt-0.5">{formatCurrency(creditCard.creditLimit)}</div>
              </div>
              <div>
                <span className="text-slate-500">APR Rate:</span>
                <div className="text-amber-300 font-bold mt-0.5">{creditCard.apr}%</div>
              </div>
              <div>
                <span className="text-slate-500">On-Time Months:</span>
                <div className="text-sky-400 font-bold mt-0.5">{creditCard.onTimeMonths} mos streak</div>
              </div>
            </div>
          </div>

          {/* Active Student Loans */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Student Loan Debt Balances</h4>
                <p className="text-xs text-slate-400">
                  Total Student Loans: {formatCurrency(studentLoans.reduce((sum, l) => sum + l.principalRemaining, 0))}
                </p>
              </div>
            </div>

            {studentLoans.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
                No active student loans. You are debt-free from university!
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {studentLoans.map((loan) => (
                  <div key={loan.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="font-semibold text-white">{loan.name}</div>
                      <div className="text-slate-400 mt-0.5 font-mono tabular-nums">
                        {loan.interestRate}% Interest · {loan.termMonthsRemaining} months remaining
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono tabular-nums">
                        <div className="text-amber-400 font-bold text-sm">
                          {formatCurrency(loan.principalRemaining)}
                        </div>
                        <div className="text-rose-400 text-[11px]">
                          -{formatCurrency(loan.monthlyPayment)}/mo pmt
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const paymentAmount = Math.min(cash, Math.min(2500, loan.principalRemaining));
                          if (paymentAmount <= 0) {
                            alert('Insufficient cash for extra payment!');
                            return;
                          }
                          onPayStudentLoanExtra(loan.id, paymentAmount);
                          playCashSound();
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Pay Down $2,500
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Passive Income & Property Managers */}
      {activeTab === 'management' && (
        <div className="space-y-6">
          {/* Master Management Banner */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Transition to Genuine Passive Real Estate Income</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Professional Property Management
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                When you own 1–2 properties, self-managing saves you money. But as you scale and hold demanding high-paying jobs (like Doctor, Lawyer, or VP), self-managing creates burnout.
                Hiring property managers charges an <strong>8% gross rental fee</strong>, in exchange for <strong>100% automated tenant screening, emergency repair dispatch, zero landlord stress, and pure mailbox passive income.</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80 text-center shrink-0 space-y-2">
              <div className="text-xs text-slate-400">Current Portfolio Automation</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {managedCount} / {properties.length} Units Managed
              </div>
              <button
                onClick={() => {
                  onToggleMasterManagement(!hiredMasterManagementFirm);
                  playClickSound();
                }}
                className={`w-full px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  hiredMasterManagementFirm
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 shadow-sm'
                }`}
              >
                {hiredMasterManagementFirm
                  ? 'Revert to Self-Management'
                  : 'Automate Entire Portfolio (8% Fee)'}
              </button>
            </div>
          </div>

          {/* Properties Individual Management Roster */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Individual Property Management Toggles
            </h4>

            {properties.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-800 rounded-lg">
                No properties owned yet. Acquire properties to configure management styles.
              </div>
            ) : (
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-slate-400 mt-0.5">
                        {p.address} · {p.units} {p.units === 1 ? 'unit' : 'units'} · Gross Rent: {formatCurrency(p.units * p.actualRentPerUnit)}/mo
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono tabular-nums">
                        <div
                          className={`font-semibold ${
                            p.isSelfManaged ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {p.isSelfManaged ? 'Self-Managed (0% Fee)' : 'Professionally Managed (8% Fee)'}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {p.isSelfManaged
                            ? 'You answer emergency repair calls'
                            : `Management fee: -${formatCurrency(p.units * p.actualRentPerUnit * 0.08)}/mo`}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onTogglePropertyManagement(p.id, !p.isSelfManaged);
                          playClickSound();
                        }}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                          p.isSelfManaged
                            ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {p.isSelfManaged ? 'Hire Manager' : 'Self-Manage'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
