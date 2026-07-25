import React from 'react';
import { Cpu, TrendingUp, Sparkles, Scale, Info } from 'lucide-react';

export default function YieldPredictCard({ prediction, areaHectares, cropType }) {
  if (!prediction) return null;

  const { predicted_yield_t_per_ha, total_production_tons, confidence_interval } = prediction;
  const lower = confidence_interval?.lower_bound || roundVal(predicted_yield_t_per_ha * 0.9);
  const upper = confidence_interval?.upper_bound || roundVal(predicted_yield_t_per_ha * 1.1);

  // Position percentage of expected yield within confidence range
  const rangeSpan = Math.max(0.1, upper - lower);
  const expectedPositionPercent = Math.min(100, Math.max(0, ((predicted_yield_t_per_ha - lower) / rangeSpan) * 100));

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

      {/* Main Yield Rate Display */}
      <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800/80">
        <div>
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Predicted Yield Rate
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white">{predicted_yield_t_per_ha}</span>
            <span className="text-sm font-bold text-emerald-400">t/ha</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Metric Tons per Hectare</span>
        </div>

        <div className="border-l border-slate-800/80 pl-4">
          <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block mb-1">
            Total Harvest Forecast
          </span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-black tracking-tight text-white">{total_production_tons}</span>
            <span className="text-sm font-bold text-teal-400">Tons</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">{areaHectares} Hectares Total</span>
        </div>
      </div>

      {/* Visual Confidence Range Bar (Pessimistic, Expected, Optimistic) */}
      <div className="mt-4 pt-1">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span>95% Confidence Range Gauge</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {lower} – {upper} t/ha
          </span>
        </div>

        {/* Range Bar Track */}
        <div className="relative w-full h-3 bg-slate-950 rounded-full border border-slate-800 p-0.5 overflow-visible">
          {/* Active Range Gradient */}
          <div className="absolute left-0 right-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-red-500/20 via-amber-500/30 to-emerald-500/40" />

          {/* Expected Marker Pin */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-lg shadow-emerald-500/50 transition-all duration-500"
            style={{ left: `calc(${expectedPositionPercent}% - 8px)` }}
          />
        </div>

        {/* Range Labels: Pessimistic, Expected, Optimistic */}
        <div className="grid grid-cols-3 text-[11px] mt-2 pt-1 font-medium">
          <div className="text-left text-red-400/90">
            <span className="block text-[10px] text-slate-500 uppercase">Pessimistic</span>
            <span className="font-mono font-bold">{lower} t/ha</span>
          </div>
          <div className="text-center text-emerald-400">
            <span className="block text-[10px] text-slate-500 uppercase">Expected</span>
            <span className="font-mono font-bold">{predicted_yield_t_per_ha} t/ha</span>
          </div>
          <div className="text-right text-emerald-300">
            <span className="block text-[10px] text-slate-500 uppercase">Optimistic</span>
            <span className="font-mono font-bold">{upper} t/ha</span>
          </div>
        </div>
      </div>
    </div>
  );
}
