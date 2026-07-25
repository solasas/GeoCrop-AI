import React, { useEffect, useState } from 'react';
import { fetchHealthCheck, fetchFields, createField, deleteField } from './services/api';
import FieldSidebar from './components/FieldSidebar';
import InteractiveMap from './components/InteractiveMap';
import { Satellite, ShieldCheck, Activity, AlertCircle } from 'lucide-react';

function App() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial health check and saved field boundaries from FastAPI backend
  const loadData = async () => {
    try {
      setLoading(true);
      const [health, fieldsData] = await Promise.all([
        fetchHealthCheck().catch(() => ({ status: 'offline' })),
        fetchFields().catch(() => [])
      ]);
      setHealthStatus(health);
      setFields(fieldsData);
      if (fieldsData.length > 0 && !selectedFieldId) {
        setSelectedFieldId(fieldsData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to communicate with API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Field Ingestion submission
  const handleSubmitField = async (formData) => {
    try {
      const newField = await createField(formData);
      setFields((prev) => [newField, ...prev]);
      setSelectedFieldId(newField.id);
      setIsDrawing(false);
      setDrawnPolygon(null);
    } catch (err) {
      alert(`Failed to save field boundary: ${err?.response?.data?.detail || err.message}`);
    }
  };

  // Handle Field Deletion
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

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* App Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md h-14 flex-none z-30 px-6">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Satellite className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                GeoCrop AI
              </h1>
              <p className="text-[10px] text-slate-400">Field Ingestion & Yield Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs">
              <div className={`w-2 h-2 rounded-full ${healthStatus?.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {loading ? 'Initializing API...' : healthStatus?.status === 'online' ? 'FastAPI & PostGIS Online' : 'Standby / Offline'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Field Management Sidebar */}
        <FieldSidebar
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
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

        {/* Right Interactive Spatial Map Area */}
        <InteractiveMap
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
          isDrawing={isDrawing}
          onPolygonDrawn={(geometry) => setDrawnPolygon(geometry)}
        />
      </div>
    </div>
  );
}

export default App;
