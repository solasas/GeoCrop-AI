import React, { useEffect, useState } from 'react';
import { fetchFields, createField, deleteField } from './services/api';
import LandingPage from './components/LandingPage';
import TopNavbar from './components/TopNavbar';
import LeftSidebarNav from './components/LeftSidebarNav';
import FieldSidebar from './components/FieldSidebar';
import InteractiveMap from './components/InteractiveMap';
import AnalyticsDrawer from './components/AnalyticsDrawer';
import { Calendar as CalendarIcon, X, CheckCircle2, Sprout } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('Farm Map');
  const [activeLeftView, setActiveLeftView] = useState('map');
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Read URL Hash on load (#app, #dashboard, #analytics)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#app' || hash === '#dashboard' || hash === '#analytics') {
      setCurrentView('app');
      setActiveNavTab(hash === '#analytics' ? 'Analytics' : 'Farm Map');
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const fieldsData = await fetchFields().catch(() => []);
      setFields(fieldsData);
      if (fieldsData.length > 0 && !selectedFieldId) {
        setSelectedFieldId(fieldsData[0].id);
      }
    } catch (err) {
      console.error("Failed to load initial workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLeftViewChange = (viewId) => {
    setActiveLeftView(viewId);
    if (viewId === 'map') {
      setActiveNavTab('Farm Map');
    } else if (viewId === 'analytics') {
      setActiveNavTab('Analytics');
    } else if (viewId === 'calendar') {
      setCalendarOpen(true);
    }
  };

  const handleSelectField = (fieldId) => {
    setSelectedFieldId(fieldId);
    setActiveNavTab('Analytics');
  };

  const handleSubmitField = async (formData) => {
    try {
      const newField = await createField(formData);
      setFields((prev) => [newField, ...prev]);
      setSelectedFieldId(newField.id);
      setIsDrawing(false);
      setDrawnPolygon(null);
      setActiveNavTab('Analytics');
    } catch (err) {
      alert(`Failed to save field boundary: ${err?.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteField = async (id) => {
    if (!window.confirm('Are you sure you want to delete this field boundary?')) return;
    try {
      await deleteField(id);
      setFields((prev) => prev.filter((f) => f.id !== id));
      if (selectedFieldId === id) {
        setSelectedFieldId(null);
      }
    } catch (err) {
      alert(`Failed to delete field: ${err.message}`);
    }
  };

  const selectedField = fields.find((f) => f.id === selectedFieldId) || (fields.length > 0 ? fields[0] : null);

  // If in landing view, render Landing Page
  if (currentView === 'landing') {
    return <LandingPage onLaunchApp={() => setCurrentView('app')} />;
  }

  // Standard Precision Agriculture Workspace View
  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col font-sans overflow-hidden">
      {/* Top Horizontal Navbar */}
      <TopNavbar
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Minimal Left Icon Sidebar */}
        <LeftSidebarNav
          activeView={activeLeftView}
          onViewChange={handleLeftViewChange}
        />

        {/* Floating Left White Card & Parcel List */}
        <FieldSidebar
          fields={fields}
          selectedField={selectedField}
          onSelectField={handleSelectField}
          onDeleteField={handleDeleteField}
          onStartDraw={() => {
            setIsDrawing(true);
            setDrawnPolygon(null);
          }}
          isDrawing={isDrawing}
          drawnPolygon={drawnPolygon}
          onCancelDraw={() => {
            setIsDrawing(false);
            setDrawnPolygon(null);
          }}
          onSubmitField={handleSubmitField}
        />

        {/* Central Aerial Satellite Map */}
        <InteractiveMap
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={handleSelectField}
          isDrawing={isDrawing}
          onPolygonDrawn={(geometry) => setDrawnPolygon(geometry)}
        />

        {/* Right Collapsible Analytics & Prediction Drawer */}
        {selectedField && activeNavTab === 'Analytics' && (
          <AnalyticsDrawer
            field={selectedField}
            onClose={() => setActiveNavTab('Farm Map')}
          />
        )}
      </div>

      {/* Crop Calendar & Planting Schedule Modal */}
      {calendarOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 font-bold">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">Crop Schedule Calendar</h3>
              </div>

              <button onClick={() => setCalendarOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((f) => {
                const acres = Math.round(f.area_hectares * 2.47105 * 100) / 100;
                return (
                  <div key={f.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{f.name} ({f.crop_type})</div>
                      <div className="text-[11px] text-slate-500 font-medium">{acres} Acres &bull; Planted: {f.planting_date || '2026-07-25'}</div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>On Track</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setCalendarOpen(false)}
              className="mt-5 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
