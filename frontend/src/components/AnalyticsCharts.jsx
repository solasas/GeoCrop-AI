import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Activity, Sun, CloudRain, TrendingUp, RefreshCw, Cpu, Award, AlertTriangle, RotateCcw } from 'lucide-react';
import apiClient from '../services/api';

export default function AnalyticsCharts({ fieldId }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFieldData = async () => {
    if (!fieldId) return;
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, predictionRes] = await Promise.all([
        apiClient.get(`/fields/${fieldId}/analytics?force_mock=true`),
        apiClient.get(`/fields/${fieldId}/yield-prediction?force_mock=true`)
      ]);
      setAnalyticsData(analyticsRes.data);
      setPredictionData(predictionRes.data);
    } catch (err) {
      console.error("Failed to load analytics or ML prediction:", err);
      const msg = err?.response?.data?.detail || err.message || "Could not connect to FastAPI server";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFieldData();
  }, [fieldId]);

  if (!fieldId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs text-center">
        Select a field boundary parcel to view satellite vegetation indices, weather fusion, and ML yield predictions.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs space-y-2">
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Fusing Sentinel-2 Satellite Imagery & Open-Meteo Weather Series...</span>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs text-center space-y-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-200 text-sm mb-1">Backend Connection Notice</h4>
          <p className="text-slate-400 max-w-xs text-[11px] leading-relaxed">
            {error || 'Ensure the FastAPI backend server is running on port 8000.'}
          </p>
        </div>
        <button
          onClick={loadFieldData}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  const { summary } = analyticsData.metadata;
  const timeSeries = analyticsData.time_series || [];
  const prediction = predictionData?.prediction || null;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 bg-slate-900/60 backdrop-blur-md border-t border-slate-800">
      
      {/* ML Yield Prediction Hero Card */}
      {prediction && (
        <div className="bg-gradient-to-br from-emerald-950/60 via-slate-950 to-slate-950 border border-emerald-500/40 p-4 rounded-xl shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                XGBoost Crop Yield Inference
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              95% Confidence Interval
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-3 pt-2 border-t border-emerald-500/20">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Estimated Yield Rate</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-white">{prediction.predicted_yield_t_per_ha}</span>
                <span className="text-xs font-semibold text-emerald-400">t/ha</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Range: {prediction.confidence_interval?.lower_bound} – {prediction.confidence_interval?.upper_bound} t/ha
              </span>
            </div>

            <div className="border-l border-slate-800 pl-4">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Estimated Field Harvest</span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-black text-white">{prediction.total_production_tons}</span>
                <span className="text-xs font-semibold text-teal-400">Tons</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Field Size: {predictionData.area_hectares} ha
              </span>
            </div>
          </div>

          {/* SHAP Feature Driver Explanations */}
          {prediction.shap_explanations && prediction.shap_explanations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center space-x-1 mb-2">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-slate-200">SHAP Feature Driver Explanations</span>
              </div>

              <div className="space-y-1.5">
                {prediction.shap_explanations.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/80 border border-slate-800/80 px-2.5 py-1.5 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 font-medium">{item.feature_name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({item.value})</span>
                    </div>
                    <span className={`font-semibold font-mono text-[11px] px-2 py-0.5 rounded ${
                      item.is_positive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30'
                    }`}>
                      {item.impact_label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metric Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Peak NDVI</span>
          </div>
          <p className="text-lg font-bold text-emerald-400">{summary.peak_ndvi}</p>
          <span className="text-[10px] text-slate-500">Max Canopy Density</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Activity className="w-3.5 h-3.5 text-teal-400" />
            <span>Latest NDVI</span>
          </div>
          <p className="text-lg font-bold text-teal-300">{summary.latest_ndvi}</p>
          <span className="text-[10px] text-slate-500">Current Health Index</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Accum. GDD</span>
          </div>
          <p className="text-lg font-bold text-amber-400">{summary.accumulated_gdd} °C</p>
          <span className="text-[10px] text-slate-500">Thermal Heat Units</span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Accum. Precip</span>
          </div>
          <p className="text-lg font-bold text-cyan-400">{summary.accumulated_precip_mm} mm</p>
          <span className="text-[10px] text-slate-500">Total Field Rainfall</span>
        </div>
      </div>

      {/* Chart 1: Sentinel-2 NDVI & NDWI Time-Series */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Sentinel-2 Vegetation & Water Indices (NDVI / NDWI)</span>
          </h4>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={10} domain={[-0.5, 1.0]} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Line type="monotone" dataKey="ndvi" name="NDVI (Canopy)" stroke="#10b981" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="ndwi" name="NDWI (Moisture)" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Weather & Accumulated Growing Degree Days (GDD) */}
      <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Accumulated Thermal Heat Units (GDD) & Daily Temperatures (°C)</span>
          </h4>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              <Area yAxisId="right" type="monotone" dataKey="accumulated_gdd" name="Accumulated GDD (°C)" fill="#f59e0b" fillOpacity={0.15} stroke="#f59e0b" strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="tmax" name="Tmax (°C)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              <Line yAxisId="left" type="monotone" dataKey="tmin" name="Tmin (°C)" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
