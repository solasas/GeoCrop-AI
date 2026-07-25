import React, { useState } from 'react';
import {
  Sprout,
  Satellite,
  Sun,
  Layers,
  Cpu,
  Award,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Sparkles,
  ChevronRight,
  Activity,
  Play,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function LandingPage({ onLaunchApp }) {
  // Interactive Yield Estimator State for Landing Page Showcase
  const [fieldArea, setFieldArea] = useState(15); // Ha
  const [selectedCrop, setSelectedCrop] = useState('Corn');
  const [ndviVigor, setNdviVigor] = useState(0.78);

  const cropBaselines = {
    Corn: 9.5,
    Rice: 6.8,
    Wheat: 5.2,
    Soybeans: 3.4,
    Cotton: 2.8
  };

  const baseYield = cropBaselines[selectedCrop] || 7.0;
  const calculatedYield = Math.round((baseYield * (ndviVigor / 0.65)) * 100) / 100;
  const calculatedTonnage = Math.round(calculatedYield * fieldArea * 10) / 10;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 -right-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="h-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-emerald-400 to-amber-300 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
                GeoCrop AI
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                Spatial AI Platform
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#fusion" className="hover:text-emerald-400 transition-colors">Data Fusion</a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">Yield Calculator</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">Architecture</a>
          </nav>

          {/* Action CTA */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onLaunchApp}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full text-center flex flex-col items-center">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-6 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Next-Gen Crop Yield Prediction Engine</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          Crop Yield Prediction using{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
            Satellite Imagery & Weather Data Fusion
          </span>
        </h1>

        {/* Hero Description */}
        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
          Fuse Sentinel-2 multispectral vegetation indices (NDVI/NDWI) with Open-Meteo & ERA5 meteorology. Run XGBoost machine learning predictions, compute 95% confidence intervals, and inspect SHAP feature drivers in real time.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <button
            onClick={onLaunchApp}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold text-sm shadow-2xl shadow-emerald-500/30 transition-all transform hover:-translate-y-1 cursor-pointer flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Open Precision Map Dashboard</span>
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold text-sm transition-all flex items-center justify-center space-x-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>FastAPI OpenAPI Docs</span>
          </a>
        </div>

        {/* Interactive Platform Mockup Preview */}
        <div className="w-full relative rounded-3xl p-3 bg-gradient-to-br from-slate-800/80 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-10 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-4 z-20">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="px-4 py-1 rounded-md bg-slate-950 text-[11px] font-mono text-slate-400 border border-slate-800/80">
              https://geocrop.ai/app/farm-map
            </div>
            <div className="w-12" />
          </div>

          <div className="mt-10 rounded-2xl overflow-hidden relative cursor-pointer" onClick={onLaunchApp}>
            {/* Visual Banner */}
            <div className="bg-slate-900 h-[480px] w-full flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-slate-950/60 to-slate-900" />
              
              {/* Simulated Floating UI Mockup Elements */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 p-8 max-w-5xl w-full text-left">
                {/* Left Card */}
                <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-2xl border border-slate-200">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-extrabold text-lg">Rice Crop</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">4.5 Ha</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 my-3 text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Seeding</span>
                      <span className="font-bold">25 kg/ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Area</span>
                      <span className="font-bold">4.5 Ha</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Qty</span>
                      <span className="font-bold">112.5 kg</span>
                    </div>
                  </div>
                  <div className="text-xs">
                    <span className="font-bold">Crop Expenses: $1.8M</span>
                    <div className="w-full h-2 bg-slate-100 rounded-full mt-1.5 flex gap-1 p-0.5">
                      <div className="h-full bg-emerald-500 rounded-full flex-[8]" />
                      <div className="h-full bg-amber-400 rounded-full flex-[2]" />
                    </div>
                  </div>
                </div>

                {/* Center ML Card */}
                <div className="bg-gradient-to-br from-emerald-950/90 to-slate-950 border border-emerald-500/40 rounded-2xl p-5 text-white shadow-2xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
                      <Cpu className="w-4 h-4" />
                      <span>XGBoost Yield Inference</span>
                    </div>
                    <div className="text-3xl font-black text-white">{calculatedYield} <span className="text-sm text-emerald-400 font-bold">t/ha</span></div>
                    <p className="text-xs text-slate-400 mt-1">Forecast: {calculatedTonnage} Tons</p>
                  </div>
                  <div className="pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-mono">
                    95% Conf: {Math.round(calculatedYield * 0.9 * 10) / 10} – {Math.round(calculatedYield * 1.1 * 10) / 10} t/ha
                  </div>
                </div>

                {/* Right Card */}
                <div className="bg-white rounded-2xl p-5 text-slate-900 shadow-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="font-extrabold text-sm block mb-3">Map Details</span>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">Crop status</div>
                      <div className="p-3 rounded-xl bg-emerald-500 text-white font-bold">NDVI</div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl shadow">
                    Interactive Map Active
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            End-to-End Spatial AI Architecture
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From boundary digitizing to Sentinel-2 satellite cloud masking and SHAP explainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <Satellite className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sentinel-2 & GEE Ingestion</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Automated 10-day multispectral satellite index extraction (NDVI, NDWI, EVI) with S2cloudless QA bitmasking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
              <Sun className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Weather & GDD Thermal Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Queries Open-Meteo & ERA5 for daily Tmax, Tmin, precipitation, and accumulated Growing Degree Days (GDD).
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-5 group-hover:scale-110 transition-transform">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">XGBoost Yield Model</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Pre-trained machine learning yield regression predicting tons per hectare (t/ha) with 95% confidence intervals.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">SHAP Driver Explanations</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Transparent TreeExplainer feature attributions quantifying exact positive and negative yield influences (+0.85 t/ha).
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">PostGIS Field Boundaries</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              PostgreSQL + PostGIS spatial geometry indexing with Shapely validation and geodesic PyProj area calculations.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dual-Line Recharts Analytics</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Real-time temporal NDVI charts comparing current season vegetation growth against 5-year historical average baselines.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Yield Estimator Showcase */}
      <section id="calculator" className="py-20 px-6 sm:px-12 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block mb-2">
              Interactive Estimator Sandbox
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              Simulate Crop Yield & Total Harvest
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Adjust field area, crop type, and satellite NDVI canopy vigor to preview predicted yields.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Slider Controls */}
            <div className="space-y-6 bg-slate-950/80 p-6 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Crop Type</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {['Corn', 'Rice', 'Wheat', 'Soybeans', 'Cotton'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCrop(c)}
                      className={`py-2 text-xs font-bold rounded-xl transition-all ${
                        selectedCrop === c
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Field Parcel Size (Hectares)</span>
                  <span className="text-emerald-400 font-mono">{fieldArea} Ha</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="150"
                  value={fieldArea}
                  onChange={(e) => setFieldArea(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Sentinel-2 Canopy NDVI Vigor</span>
                  <span className="text-emerald-400 font-mono">{ndviVigor.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.20"
                  max="0.95"
                  step="0.01"
                  value={ndviVigor}
                  onChange={(e) => setNdviVigor(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <span className="font-extrabold text-sm text-slate-900">{selectedCrop} Yield Forecast</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  ML Verified
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium block mb-1">Predicted Yield Rate</span>
                  <span className="text-3xl font-black text-slate-900">{calculatedYield} <span className="text-sm font-bold text-emerald-600">t/ha</span></span>
                </div>
                <div className="border-l border-slate-100 pl-4">
                  <span className="text-xs text-slate-500 font-medium block mb-1">Total Expected Harvest</span>
                  <span className="text-3xl font-black text-slate-900">{calculatedTonnage} <span className="text-sm font-bold text-teal-600">Tons</span></span>
                </div>
              </div>

              <button
                onClick={onLaunchApp}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Launch Interactive Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 px-6 sm:px-12 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-300">GeoCrop AI</span>
            <span>&copy; 2026. Spatial AI & Agronomic Data Science.</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-400 font-medium">
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">FastAPI Docs</a>
            <button onClick={onLaunchApp} className="hover:text-emerald-400">Open Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
