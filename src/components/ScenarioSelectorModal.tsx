import React from 'react';
import { SCENARIO_PRESETS } from '../data/initialScenarios';
import { ScenarioPreset } from '../types/game';
import { formatCurrency } from '../utils/calculator';
import { X, Play, Sparkles } from 'lucide-react';
import { playClickSound } from '../utils/audio';

interface ScenarioSelectorModalProps {
  onClose: () => void;
  onSelectScenario: (scenario: ScenarioPreset) => void;
}

export const ScenarioSelectorModal: React.FC<ScenarioSelectorModalProps> = ({
  onClose,
  onSelectScenario,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>CAREER SCENARIOS</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">Select Investment Scenario</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose your starting capital, portfolio leverage, and initial property footing.
            </p>
          </div>

          <button
            onClick={() => {
              onClose();
              playClickSound();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Cards */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
          {SCENARIO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-950/50 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{preset.name}</span>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                      preset.difficulty === 'Beginner'
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20'
                        : preset.difficulty === 'Moderate'
                        ? 'border-sky-500/40 text-sky-300 bg-sky-950/20'
                        : preset.difficulty === 'Challenging'
                        ? 'border-amber-500/40 text-amber-300 bg-amber-950/20'
                        : 'border-purple-500/40 text-purple-300 bg-purple-950/20'
                    }`}
                  >
                    {preset.difficulty}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1 text-xs font-mono tabular-nums">
                  <div className="flex justify-between text-slate-400">
                    <span>Starting Age:</span>
                    <span className="text-white font-bold">Age {preset.startingAgeYears}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Starting Liquid Cash:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatCurrency(preset.startingCash)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Credit Score:</span>
                    <span className="text-white">{preset.startingCreditScore}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Initial Holdings:</span>
                    <span className="text-sky-400">
                      {preset.initialProperties.length === 0
                        ? 'None (Rent & save)'
                        : `${preset.initialProperties.length} ${
                            preset.initialProperties.length === 1 ? 'Property' : 'Properties'
                          }`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onSelectScenario(preset);
                  playClickSound();
                }}
                className="mt-4 w-full py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start This Career</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
