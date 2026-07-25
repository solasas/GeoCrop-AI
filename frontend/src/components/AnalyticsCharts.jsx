import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, AreaChart, Area } from 'recharts';
import { Activity, Sun, CloudRain, TrendingUp, RefreshCw } from 'lucide-react';
import apiClient from '../services/api';

export default function AnalyticsCharts({ fieldId }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fieldId) return;

    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get(`/fields/${fieldId}/analytics?force_mock=true`);
        setAnalyticsData(response.data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
        setError("Could not load satellite and weather analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [fieldId]);

  if (!fieldId) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-slate-500 text-xs">
        Select a field boundary parcel to view satellite vegetation indices and weather fusion charts.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-slate-400 text-xs space-y-2">
        <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
        <span>Fusing Sentinel-2 & Open-Meteo Weather Series...</span>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-red-400 text-xs">
        {error || 'No analytics data available'}
      </div>
    );
  }

  const { summary } = analyticsData.metadata;
  const timeSeries = analyticsData.time_series || [];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-4 bg-slate-900/60 backdrop-blur-md border-t border-slate-800">
      {/* Metric Summary Banner */}
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
          <span className="text-[10px] text-slate-500">Thermal Crop Units</span>
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
