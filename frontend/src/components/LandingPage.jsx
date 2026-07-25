import React, { useState } from 'react';
import { Sprout, ArrowRight, Cpu, Play, Sparkles, Satellite, Sun } from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  // Simple Yield Estimator Sandbox
  const [fieldArea, setFieldArea] = useState(15);
  const [selectedCrop, setSelectedCrop] = useState('Corn');
  const [ndviVigor, setNdviVigor] = useState(0.78);

  const cropBaselines = { Corn: 9.5, Rice: 6.8, Wheat: 5.2, Soybeans: 3.4, Cotton: 2.8 };
  const baseYield = cropBaselines[selectedCrop] || 7.0;
  const calculatedYield = Math.round((baseYield * (ndviVigor / 0.65)) * 100) / 100;
  const calculatedTonnage = Math.round(calculatedYield * fieldArea * 10) / 10;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">GeoCrop AI</span>
          </div>

          <button
            onClick={onLaunchApp}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Open App Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-6 sm:px-12 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Spatial AI Crop Yield Prediction Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          Predict Crop Yields via{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Satellite & Weather Data Fusion
          </span>
        </h1>

        <p className="text-slate-400 text-base max-w-2xl leading-relaxed mb-8">
          Combine Sentinel-2 multispectral satellite imagery with Open-Meteo weather data to forecast yield rates (t/ha), 95% confidence intervals, and SHAP drivers in real time.
        </p>

        <button
          onClick={onLaunchApp}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center space-x-2"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Launch Interactive Map</span>
        </button>
      </section>

      {/* Simplified Yield Estimator Sandbox */}
      <section className="py-12 px-6 sm:px-12 max-w-5xl mx-auto w-full">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-2">Live Yield Estimator</h2>
          <p className="text-xs text-slate-400 mb-6">Adjust parameters to see instant yield predictions.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-2">Crop Type</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {['Corn', 'Rice', 'Wheat', 'Soybeans'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrop(c)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        selectedCrop === c ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Field Parcel Area</span>
                  <span className="text-emerald-400 font-mono">{fieldArea} Ha</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xl space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Yield Prediction</span>
              <div className="text-3xl font-black text-slate-900">{calculatedYield} <span className="text-sm font-bold text-emerald-600">t/ha</span></div>
              <p className="text-xs text-slate-500">Expected Harvest: <span className="font-bold text-slate-800">{calculatedTonnage} Tons</span></p>

              <button
                onClick={onLaunchApp}
                className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
              >
                Open Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500 mt-auto">
        GeoCrop AI &copy; 2026. Precision Crop Yield Prediction.
      </footer>
    </div>
  );
}
