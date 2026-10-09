import React, { useState } from 'react';
import { CareerWorkEvent, CareerWorkOption } from '../types/game';
import { formatCurrency } from '../utils/calculator';
import { Briefcase, AlertTriangle, ArrowRight, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { playCashSound, playClickSound, playWarningSound, playSuccessSound } from '../utils/audio';

interface CareerEventModalProps {
  event: CareerWorkEvent;
  currentJobTitle: string;
  onSelectOption: (option: CareerWorkOption) => void;
}

export const CareerEventModal: React.FC<CareerEventModalProps> = ({
  event,
  currentJobTitle,
  onSelectOption,
}) => {
  const [selectedOpt, setSelectedOpt] = useState<CareerWorkOption | null>(null);
  const [hasResolved, setHasResolved] = useState<boolean>(false);

  const handlePick = (opt: CareerWorkOption) => {
    setSelectedOpt(opt);
    setHasResolved(true);
    if (opt.bonusCash || opt.monthlySalaryBonus) {
      playSuccessSound();
    } else if (opt.loseJob || opt.dockPayThisMonth) {
      playWarningSound();
    } else {
      playClickSound();
    }
  };

  const handleConfirm = () => {
    if (selectedOpt) {
      onSelectOption(selectedOpt);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Workplace Event · {currentJobTitle}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{event.title}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {event.scenario}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          {!hasResolved ? (
            <>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Choose How to Respond:
              </div>

              {event.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handlePick(opt)}
                  className="w-full p-4 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900 text-left transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white group-hover:text-emerald-300 transition-colors">
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {opt.description}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0 mt-1" />
                </button>
              ))}
            </>
          ) : (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border ${
                  selectedOpt?.bonusCash || selectedOpt?.monthlySalaryBonus
                    ? 'border-emerald-500/50 bg-emerald-950/20'
                    : selectedOpt?.loseJob || selectedOpt?.dockPayThisMonth
                    ? 'border-rose-500/50 bg-rose-950/20'
                    : 'border-slate-800 bg-slate-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-white">
                  {selectedOpt?.bonusCash || selectedOpt?.monthlySalaryBonus ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : selectedOpt?.loseJob || selectedOpt?.dockPayThisMonth ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                  )}
                  <span>Outcome of Your Decision:</span>
                </div>

                <p className="text-xs text-slate-200 mt-2 leading-relaxed">
                  {selectedOpt?.outcomeText}
                </p>

                {/* Consequences readout */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs font-mono tabular-nums">
                  {selectedOpt?.bonusCash && (
                    <span className="text-emerald-400 font-semibold">
                      +{formatCurrency(selectedOpt.bonusCash)} Spot Bonus
                    </span>
                  )}
                  {selectedOpt?.monthlySalaryBonus && (
                    <span className="text-emerald-400 font-semibold">
                      +{formatCurrency(selectedOpt.monthlySalaryBonus)}/mo Permanent Raise
                    </span>
                  )}
                  {selectedOpt?.dockPayThisMonth && (
                    <span className="text-rose-400 font-semibold">
                      Monthly Paycheck Docked
                    </span>
                  )}
                  {selectedOpt?.loseJob && (
                    <span className="text-rose-400 font-semibold">
                      Terminated from Job (Must find new work)
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleConfirm}
                className="w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all"
              >
                Acknowledge & Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
