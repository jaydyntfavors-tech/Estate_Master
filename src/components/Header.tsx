import React from 'react';
import { Play, Pause, FastForward, RotateCcw, Volume2, VolumeX, Briefcase, TrendingUp } from 'lucide-react';
import { getIsMuted, setMuted, playClickSound } from '../utils/audio';
import { formatCurrency } from '../utils/calculator';

interface HeaderProps {
  currentTab: 'portfolio' | 'career' | 'stocks' | 'marketplace' | 'refinance' | 'ledger' | 'milestones';
  setCurrentTab: (tab: 'portfolio' | 'career' | 'stocks' | 'marketplace' | 'refinance' | 'ledger' | 'milestones') => void;
  month: number;
  year: number;
  ageYears: number;
  ageMonths: number;
  cash: number;
  netWorth: number;
  creditScore: number;
  monthlyCashFlow: number;
  jobTitle: string;
  isPlaying: boolean;
  setIsPlaying: (val: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
  onAdvanceMonth: () => void;
  onResetScenario: () => void;
  actionableEventsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  month,
  year,
  ageYears,
  ageMonths,
  cash,
  netWorth,
  creditScore,
  monthlyCashFlow,
  jobTitle,
  isPlaying,
  setIsPlaying,
  simulationSpeed,
  setSimulationSpeed,
  onAdvanceMonth,
  onResetScenario,
  actionableEventsCount,
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playClickSound();
  };

  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentMonthName = monthNames[(month - 1) % 12];

  // Life phase label
  const lifePhase =
    ageYears >= 70
      ? { label: 'Retired Tycoon', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
      : ageYears >= 55
      ? { label: 'Senior Mogul', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' }
      : ageYears >= 40
      ? { label: 'Prime Investor', color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' }
      : ageYears >= 25
      ? { label: 'Career Builder', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' }
      : { label: 'Young Starter', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <header className="px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark & Prominent Character Age */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#portfolio"
            onClick={(e) => {
              e.preventDefault();
              setCurrentTab('portfolio');
              playClickSound();
            }}
            className="text-lg font-bold tracking-tight text-white flex items-center gap-2 hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0"
          >
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
            EstateMaster
          </a>

          {/* Prominent Character Age & Life Phase Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono tabular-nums shrink-0 shadow-sm">
            <span className="text-white font-bold flex items-center gap-1">
              <span className="text-slate-400 font-normal">Age</span> {ageYears}
              <span className="text-slate-500 text-[11px] font-normal">({ageMonths}m)</span>
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-sans font-medium ${lifePhase.color}`}>
              {lifePhase.label}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
          <button
            onClick={() => {
              setCurrentTab('portfolio');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'portfolio' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Portfolio
          </button>

          <button
            onClick={() => {
              setCurrentTab('career');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentTab === 'career' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career & Life</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('stocks');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentTab === 'stocks' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Stocks & ETFs</span>
          </button>

          <button
            onClick={() => {
              setCurrentTab('marketplace');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'marketplace' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Properties
          </button>

          <button
            onClick={() => {
              setCurrentTab('refinance');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'refinance' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Refinance
          </button>

          <button
            onClick={() => {
              setCurrentTab('ledger');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              currentTab === 'ledger' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Ledger
          </button>

          <button
            onClick={() => {
              setCurrentTab('milestones');
              playClickSound();
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              currentTab === 'milestones' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            Trophies
            {actionableEventsCount > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1.5 py-0.2">
                {actionableEventsCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Area (Time Control & Turn Advancement) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Audio Mute toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            aria-label="Toggle sound"
          >
            {muted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Play/Pause Simulation */}
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              playClickSound();
            }}
            title={isPlaying ? 'Pause auto-progress' : 'Auto-advance months'}
            className={`p-2 rounded-lg border transition-colors ${
              isPlaying
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border-slate-800'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Speed toggle when playing */}
          {isPlaying && (
            <button
              onClick={() => {
                setSimulationSpeed(simulationSpeed === 1 ? 2 : 1);
                playClickSound();
              }}
              className="text-xs font-mono font-medium px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white flex items-center gap-1"
            >
              <FastForward className="w-3 h-3" />
              {simulationSpeed}x
            </button>
          )}

          {/* Reset / Scenario switch */}
          <button
            onClick={onResetScenario}
            title="New Game / Change Scenario"
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 border border-slate-800 transition-colors hidden sm:block"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Primary Action Button: Next Month */}
          <button
            onClick={() => {
              onAdvanceMonth();
              playClickSound();
            }}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 flex items-center gap-2 active:scale-95"
          >
            <span>Next Month</span>
            <span className="font-mono text-[10px] bg-slate-950/20 px-1 py-0.5 rounded">
              M{month}
            </span>
          </button>
        </div>
      </header>

      {/* Subtle compact reminder bar when viewing other tabs (Career, Stocks, Properties, Refinance, etc.) */}
      {currentTab !== 'portfolio' && (
        <div className="px-4 sm:px-8 py-2 bg-slate-900/80 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <span>
              Liquid Cash: <strong className={cash < 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatCurrency(cash)}</strong>
            </span>
            <span>
              Net Worth: <strong className="text-white">{formatCurrency(netWorth)}</strong>
            </span>
            <span>
              Monthly Cash Flow:{' '}
              <strong className={monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {monthlyCashFlow >= 0 ? `+${formatCurrency(monthlyCashFlow)}` : formatCurrency(monthlyCashFlow)}/mo
              </strong>
            </span>
            <span>
              Borrower Credit: <strong className="text-sky-400">{creditScore}</strong>
            </span>
            <span className="hidden sm:inline">
              Job: <strong className="text-slate-300 font-sans">{jobTitle}</strong>
            </span>
          </div>

          <div className="text-slate-400 text-[11px] font-sans flex items-center gap-2">
            <span className="text-slate-500 font-mono">Age {ageYears}</span>
            <span className="text-slate-600">·</span>
            <span>{currentMonthName} {year}</span>
          </div>
        </div>
      )}
    </div>
  );
};
