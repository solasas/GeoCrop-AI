import React, { useEffect, useState } from 'react';
import { X, RefreshCw, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';
import YieldPredictCard from './YieldPredictCard';
import YieldFactorsSHAP from './YieldFactorsSHAP';
import NDVITimeSeriesChart from './NDVITimeSeriesChart';
import apiClient from '../services/api';

export default function AnalyticsDrawer({ field, onClose }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFieldData = async () => {
    if (!field?.id) return;
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, predictionRes] = await Promise.all([
        apiClient.get(`/fields/${field.id}/analytics?force_mock=true`),
        apiClient.get(`/fields/${field.id}/yield-prediction?force_mock=true`)
      ]);
      setAnalyticsData(analyticsRes.data);
      setPredictionData(predictionRes.data);
    } catch (err) {
      console.error("Failed to load drawer analytics or prediction:", err);
      const msg = err?.response?.data?.detail || err.message || "Failed to retrieve field analytics data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFieldData();
  }, [field?.id]);

  if (!field) return null;

  const prediction = predictionData?.prediction || null;
  const timeSeries = analyticsData?.time_series || [];

  return (
    <aside className="w-full lg:w-[480px] bg-white/95 backdrop-blur-xl border-l border-slate-200 flex flex-col h-full z-30 shadow-2xl transition-all pointer-events-auto text-slate-900">
      {/* Drawer Top Bar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <span>{field.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                {field.crop_type}
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {field.area_hectares} Ha &bull; Planted: {field.planting_date}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          title="Close Drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-slate-400 text-xs space-y-2">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
            <span className="font-medium text-slate-600">Processing Sentinel-2 & XGBoost Yield Model...</span>
          </div>
        ) : error ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-slate-500 text-xs text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <p className="text-slate-600 max-w-xs">{error}</p>
            <button
              onClick={loadFieldData}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Pipeline</span>
            </button>
          </div>
        ) : (
          <>
            {/* 1. ML Yield Prediction Card */}
            <YieldPredictCard
              prediction={prediction}
              areaHectares={field.area_hectares}
              cropType={field.crop_type}
            />

            {/* 2. SHAP Yield Factors Analysis */}
            {prediction?.shap_explanations && (
              <YieldFactorsSHAP shapExplanations={prediction.shap_explanations} />
            )}

            {/* 3. Dual-Line NDVI Time-Series vs 5-Year Benchmark */}
            <NDVITimeSeriesChart timeSeries={timeSeries} />
          </>
        )}
      </div>
    </aside>
  );
}
