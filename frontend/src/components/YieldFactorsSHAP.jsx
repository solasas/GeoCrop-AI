import React from 'react';
import { Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function YieldFactorsSHAP({ shapExplanations }) {
  if (!shapExplanations || shapExplanations.length === 0) return null;

  // Find max absolute impact to normalize progress bar width
  const maxAbsImpact = Math.max(...shapExplanations.map(s => Math.abs(s.impact)), 0.1);

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-sm text-slate-100">SHAP Yield Driver Analysis</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Marginal Impact (t/acre)</span>
      </div>

      <div className="space-y-3.5">
        {shapExplanations.map((factor, idx) => {
          const isPositive = factor.is_positive;
          const absImpact = Math.abs(factor.impact);
          const barWidthPercent = Math.min(100, Math.max(12, (absImpact / maxAbsImpact) * 100));

          // Convert impact from t/ha to t/acre (1 t/ha = 0.404686 t/acre)
          const impactAcresVal = (factor.impact * 0.404686);
          const displayLabel = `${impactAcresVal >= 0 ? '+' : ''}${impactAcresVal.toFixed(2)} t/acre`;

          return (
            <div key={idx} className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 flex-none" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400 flex-none" />
                  )}
                  <span className="font-semibold text-slate-200">{factor.feature_name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({factor.value})</span>
                </div>

                <span
                  className={`font-bold font-mono text-xs px-2 py-0.5 rounded ${
                    isPositive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {displayLabel}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-red-600 to-red-400 shadow-sm shadow-red-500/30'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
