import React from 'react';
import { ActionableDecisionOption, ActionableEvent } from '../types/game';
import { formatCurrency } from '../utils/calculator';
import { AlertTriangle, Wrench, ShieldAlert } from 'lucide-react';
import { playClickSound, playCashSound } from '../utils/audio';

interface EventModalProps {
  event: ActionableEvent;
  cash: number;
  onSelectOption: (eventId: string, option: ActionableDecisionOption) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  cash,
  onSelectOption,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-amber-950/20 flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
              Landlord Decision Required · {event.propertyName}
            </div>
            <h2 className="text-lg font-bold text-white mt-1">{event.title}</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="p-6 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Select Your Action:
          </div>

          {event.options.map((opt) => {
            const canAfford = cash >= opt.cost;

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all ${
                  canAfford
                    ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                    : 'border-slate-800/40 bg-slate-950/20 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-white">{opt.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{opt.description}</div>

                    {/* Impact chips */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono">
                      {opt.conditionImpact !== undefined && opt.conditionImpact !== 0 && (
                        <span
                          className={
                            opt.conditionImpact > 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {opt.conditionImpact > 0 ? '+' : ''}
                          {opt.conditionImpact}% Condition
                        </span>
                      )}
                      {opt.satisfactionImpact !== undefined && opt.satisfactionImpact !== 0 && (
                        <span
                          className={
                            opt.satisfactionImpact > 0
                              ? 'text-emerald-400'
                              : 'text-rose-400'
                          }
                        >
                          {opt.satisfactionImpact > 0 ? '+' : ''}
                          {opt.satisfactionImpact}% Tenant Satisfaction
                        </span>
                      )}
                      {opt.riskDescription && (
                        <span className="text-amber-400">
                          Risk: {opt.riskDescription}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold font-mono tabular-nums text-white">
                      {opt.cost > 0 ? formatCurrency(opt.cost) : 'Free'}
                    </div>
                    <button
                      onClick={() => {
                        if (canAfford) {
                          onSelectOption(event.id, opt);
                          playCashSound();
                        }
                      }}
                      disabled={!canAfford}
                      className={`mt-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? 'Choose' : 'Short Funds'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
