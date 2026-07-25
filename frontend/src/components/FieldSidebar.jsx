import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Copy, X, CheckCircle2, Sparkles, MousePointer } from 'lucide-react';

const CROP_OPTIONS = ['Rice', 'Corn', 'Wheat', 'Soybeans', 'Cotton', 'Barley', 'Sunflower'];

const CROP_COST_PER_ACRE = {
  Rice: 160,
  Corn: 155,
  Wheat: 115,
  Soybeans: 100,
  Cotton: 130,
  Barley: 105,
  Sunflower: 90
};

export default function FieldSidebar({
  fields,
  selectedField,
  onSelectField,
  onDeleteField,
  onStartDraw,
  isDrawing,
  drawnPolygon,
  onCancelDraw,
  onSubmitField
}) {
  const [formData, setFormData] = useState({
    name: 'New Field Parcel',
    crop_type: 'Corn',
    planting_date: new Date().toISOString().split('T')[0],
    expected_harvest: new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0]
  });

  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active selected field details
  const activeField = selectedField || (fields.length > 0 ? fields[0] : null);
  const cropName = activeField?.name || 'Rice Crop';
  const cropType = activeField?.crop_type || 'Rice';

  // Convert Hectares to Acres (1 Ha = 2.47105 Acres)
  const areaHa = activeField?.area_hectares || 4.5;
  const areaAcres = Math.round(areaHa * 2.47105 * 100) / 100;
  const seedRateAcres = 10;
  const totalSeedQty = Math.round(seedRateAcres * areaAcres * 10) / 10;

  const unitCostAcres = CROP_COST_PER_ACRE[cropType] || 140;
  const totalExpenseRaw = Math.round(areaAcres * unitCostAcres * 150);

  function formatExpense(amount) {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  }

  const formattedExpense = formatExpense(totalExpenseRaw);

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
        name: 'New Field Parcel',
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

  const handleCopy = () => {
    navigator.clipboard.writeText(`${cropName}: ${areaAcres} Acres, ${totalSeedQty} kg Seed, ${formattedExpense} Expenses`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <aside className="w-88 sm:w-[380px] p-4 flex flex-col gap-4 z-20 pointer-events-auto">
        {/* Active Field Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 text-slate-900 transition-all">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span>{cropName}</span>
            </h2>

            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => {
                  const newName = prompt('Edit Field Name:', cropName);
                  if (newName && activeField) {
                    activeField.name = newName;
                  }
                }}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Edit crop details"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative"
                title="Copy details"
              >
                <Copy className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-0.5 px-2 rounded-md shadow">
                    Copied
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Seeding & Area Metrics */}
          <div className="mt-4 space-y-3">
            <span className="text-xs font-bold text-slate-900 block">Seeding</span>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Amount</span>
                <span className="text-sm font-extrabold text-slate-900">{seedRateAcres} <span className="text-[11px] font-semibold text-slate-500">kg/acre</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Area</span>
                <span className="text-sm font-extrabold text-slate-900">{areaAcres} <span className="text-[11px] font-semibold text-slate-500">Acres</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-medium block">Seed Quantity</span>
                <span className="text-sm font-extrabold text-slate-900">{totalSeedQty} <span className="text-[11px] font-semibold text-slate-500">kg</span></span>
              </div>
            </div>
          </div>

          {/* Expenses */}
          <div className="mt-5 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-900">Crop Expenses</span>
              <span className="text-xs font-extrabold text-slate-900">{formattedExpense} <span className="text-[10px] font-normal text-slate-500">Total</span></span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-200/60">
              <div className="h-full bg-emerald-500 rounded-full flex-[8]" title="Seeds & Fertilizer (80%)" />
              <div className="h-full bg-amber-400 rounded-full flex-[2]" title="Equipment & Irrigation (20%)" />
            </div>
          </div>
        </div>

        {/* Farm Field Parcels List */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 text-slate-900 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Farm Parcels</h3>
              <span className="text-[11px] text-slate-500">{fields.length} Active Field Geometries</span>
            </div>

            {!isDrawing && (
              <button
                onClick={onStartDraw}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Draw Boundary</span>
              </button>
            )}
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
            {fields.map((field) => {
              const isSelected = activeField?.id === field.id;
              const acres = Math.round(field.area_hectares * 2.47105 * 100) / 100;
              return (
                <div
                  key={field.id}
                  onClick={() => onSelectField(field.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-slate-100 border-slate-900 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{field.name}</div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {field.crop_type} &bull; {acres} Acres
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteField(field.id);
                    }}
                    className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-200/60"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* NON-BLOCKING Floating Instruction Banner when Drawing is Active */}
      {isDrawing && !drawnPolygon && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1500] pointer-events-auto">
          <div className="bg-slate-900/95 text-white backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center space-x-4 animate-bounce">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div className="text-xs font-bold">
              <span className="text-emerald-400">Drawing Active:</span> Click 3 or more spots on the map to outline your field.
            </div>
            <button
              onClick={onCancelDraw}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Modal ONLY AFTER 3+ Points are clicked & polygon is captured */}
      {isDrawing && drawnPolygon && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-slate-900 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Boundary Captured!</h3>
              </div>

              <button onClick={onCancelDraw} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs text-emerald-800 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-none" />
                <span>Geodesic Polygon Closed & Validated!</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Name</label>
                <input
                  type="text"
                  required
                  placeholder="Field Name (e.g. Corn Sector A)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop Type</label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  >
                    {CROP_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    required
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>{submitting ? 'Saving Boundary...' : 'Save Field & Run AI Prediction'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
