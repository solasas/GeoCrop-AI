import React, { useEffect, useState } from 'react';
import { fetchHealthCheck } from './services/api';
import { Activity, Satellite, CloudSun, Database, ShieldCheck, Layers, Cpu } from 'lucide-react';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealthCheck()
      .then((data) => {
        setHealthStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to reach API gateway');
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Satellite className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                GeoCrop AI
              </h1>
              <p className="text-xs text-slate-400">Satellite & Weather Yield Analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <div className={`w-2 h-2 rounded-full ${healthStatus?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {loading ? 'Connecting API...' : healthStatus?.status === 'online' ? 'FastAPI Gateway Online' : 'Offline / Standby'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col gap-8">
        {/* Hero Banner */}
        <section className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/40 p-8 border border-slate-800 overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 1 Scaffolding Complete</span>
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl mb-3">
              Spatial AI Crop Yield Prediction Platform
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Fusing multispectral satellite imagery (Sentinel-2, Landsat) with high-resolution meteorology datasets (ERA5, CHIRPS) via FastAPI, Xarray, PostGIS, and Mapbox GL JS.
            </p>
          </div>
        </section>

        {/* System Architecture & Health Status Grid */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Backend Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Backend Infrastructure</h3>
              <p className="text-slate-400 text-sm mb-4">Python FastAPI microservice architecture with async route handlers.</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Framework</span>
                <span className="text-slate-200 font-mono">FastAPI</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Endpoint</span>
                <span className="text-emerald-400 font-mono">/api/v1/health</span>
              </div>
            </div>
          </div>

          {/* Geospatial Engines Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Spatial & Weather Stack</h3>
              <p className="text-slate-400 text-sm mb-4">GeoPandas & Xarray multi-dimensional temporal array processing.</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>GeoPandas Status</span>
                <span className="text-slate-200 font-mono">{healthStatus?.geospatial_engines?.geopandas || 'Configured'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Xarray Engine</span>
                <span className="text-slate-200 font-mono">{healthStatus?.geospatial_engines?.xarray || 'Configured'}</span>
              </div>
            </div>
          </div>

          {/* Earth Engine Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <CloudSun className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">GEE & Database</h3>
              <p className="text-slate-400 text-sm mb-4">Google Earth Engine Python API + PostgreSQL / PostGIS geometry store.</p>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>GEE Python SDK</span>
                <span className="text-slate-200 font-mono">{healthStatus?.geospatial_engines?.earthengine || 'Configured'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Spatial Storage</span>
                <span className="text-slate-200 font-mono">PostGIS (Geometry)</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        GeoCrop AI Platform &copy; 2026. Spatial AI & Agronomic Data Science.
      </footer>
    </div>
  );
}

export default App;
