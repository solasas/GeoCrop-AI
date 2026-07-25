import React, { useState } from 'react';
import { Plus, Trash2, Sprout, Calendar, MapPin, X, Check, Ruler, LineChart } from 'lucide-react';
import AnalyticsCharts from './AnalyticsCharts';

const CROP_OPTIONS = ['Corn', 'Wheat', 'Soybeans', 'Rice', 'Cotton', 'Barley', 'Sunflower'];

export default function FieldSidebar({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onStartDraw,
  isDrawing,
  drawnPolygon,
  onCancelDraw,
  onSubmitField
}) {
  const [formData, setFormData] = useState({
    name: '',
    crop_type: 'Corn',
    planting_date: new Date().toISOString().split('T')[0],
    expected_harvest: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('fields'); // 'fields' | 'analytics'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!drawnPolygon) return;

    setSubmitting(true);
    try {
      await onSubmitField({
        ...formData,
        geometry: drawnPolygon
      });
      setFormData({
        name: '',
        crop_type: 'Corn',
        planting_date: new Date().toISOString().split('T')[0],
        expected_harvest: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Failed to submit field:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-80 sm:w-96 bg-slate-900/90 backdrop-blur-md border-r border-slate-800 flex flex-col h-full z-10">
      {/* Sidebar Top Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-100 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span>Field Boundaries</span>
          </h2>
          <p className="text-xs text-slate-400">{fields.length} Active Field Parcels</p>
        </div>

        {!isDrawing && (
          <button
            onClick={onStartDraw}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Draw Field</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs (Parcels vs Spatial Analytics) */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs">
        <button
          onClick={() => setActiveTab('fields')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition-all ${
            activeTab === 'fields'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Field Parcels ({fields.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2.5 font-medium border-b-2 transition-all flex items-center justify-center space-x-1 ${
            activeTab === 'analytics'
              ? 'border-emerald-400 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LineChart className="w-3.5 h-3.5" />
          <span>Analytics & Fusion</span>
        </button>
      </div>

      {/* Drawing active prompt / Form Modal */}
      {isDrawing && (
        <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/30">
          {!drawnPolygon ? (
            <div className="flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Click map canvas to draw polygon vertices...</span>
              </div>
              <button
                onClick={onCancelDraw}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Polygon Captured
                </span>
                <button
                  type="button"
                  onClick={onCancelDraw}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Sector A2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Crop Type</label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full px-2 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Expected Harvest</label>
                <input
                  type="date"
                  required
                  value={formData.expected_harvest}
                  onChange={(e) => setFormData({ ...formData, expected_harvest: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-md bg-slate-950 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium text-xs rounded-md shadow transition-all cursor-pointer flex items-center justify-center space-x-1"
              >
                <span>{submitting ? 'Saving Field...' : 'Save Field Boundary'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'fields' ? (
          <div className="p-4 space-y-3">
            {fields.length === 0 ? (
              <div className="h-48 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-sm font-medium text-slate-400">No Fields Defined</p>
                <p className="text-xs text-slate-500 mt-1">Click 'Draw Field' to digitize field boundaries on the map.</p>
              </div>
            ) : (
              fields.map((field) => {
                const isSelected = selectedFieldId === field.id;
                return (
                  <div
                    key={field.id}
                    onClick={() => {
                      onSelectField(field.id);
                      setActiveTab('analytics');
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                          <span>{field.name}</span>
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            {field.crop_type}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Ruler className="w-3 h-3 text-slate-500" />
                            {field.area_hectares} ha
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteField(field.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Delete field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Planted: {field.planting_date}</span>
                      </div>
                      <div className="text-right">
                        <span>Harvest: {field.expected_harvest}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <AnalyticsCharts fieldId={selectedFieldId} />
        )}
      </div>
    </aside>
  );
}
