import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

export default function YieldPredictCard({ prediction, areaHectares, cropType }) {
  if (!prediction) return null;

  const { predicted_yield_t_per_ha, total_production_tons, confidence_interval } = prediction;

  // Convert t/ha to t/acre (1 t/ha = 0.404686 t/acre)
  const yieldTonsPerAcre = roundVal((predicted_yield_t_per_ha || 4.35) * 0.404686);
  const areaAcres = roundVal((areaHectares || 4.5) * 2.47105);

  const lowerHa = confidence_interval?.lower_bound || roundVal(predicted_yield_t_per_ha * 0.9);
  const upperHa = confidence_interval?.upper_bound || roundVal(predicted_yield_t_per_ha * 1.1);

  const lower = roundVal(lowerHa * 0.404686);
  const upper = roundVal(upperHa * 0.404686);

  const rangeSpan = Math.max(0.05, upper - lower);
  const expectedPositionPercent = Math.min(100, Math.max(0, ((yieldTonsPerAcre - lower) / rangeSpan) * 100));

  function roundVal(v) {
    return Math.round(v * 100) / 100;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
              <span>ML Yield Prediction</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">{cropType} Parcel Baseline</p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 tracking-wide uppercase">
          XGBoost + GEE
        </span>
      </div>

      {/* Main Yield Rate Display in t/acre */}
      <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Predicted Yield Rate
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white">{yieldTonsPerAcre}</span>
            <span className="text-sm font-bold text-emerald-400">t/acre</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Tons per Acre</span>
        </div>

        <div className="border-l border-slate-800/80 pl-4">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Total Harvest Forecast
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white">{total_production_tons}</span>
            <span className="text-sm font-bold text-teal-400">Tons</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{areaAcres} Acres Total</span>
        </div>
      </div>

      {/* Confidence Range Bar in t/acre */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-300">
          <span className="font-semibold flex items-center gap-1">
            <span>95% Confidence Range Gauge</span>
          </span>
          <span className="font-mono text-emerald-400 font-bold">{lower} &ndash; {upper} t/acre</span>
        </div>

        {/* Multi-segment Confidence Bar */}
        <div className="relative w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/80 via-amber-500/80 to-emerald-500/80" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-slate-900 shadow-md transition-all duration-500"
            style={{ left: `calc(${expectedPositionPercent}% - 8px)` }}
          />
        </div>

        <div className="grid grid-cols-3 text-[10px] font-semibold text-slate-400 text-center pt-1">
          <div className="text-left">
            <span className="block text-slate-500">Pessimistic</span>
            <span className="text-red-400">{lower} t/acre</span>
          </div>
          <div>
            <span className="block text-slate-500">Expected</span>
            <span className="text-emerald-400 font-bold">{yieldTonsPerAcre} t/acre</span>
          </div>
          <div className="text-right">
            <span className="block text-slate-500">Optimistic</span>
            <span className="text-teal-300">{upper} t/acre</span>
          </div>
        </div>
      </div>
    </div>
  );
}
