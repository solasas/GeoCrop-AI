import React, { useEffect, useState } from 'react';
import { fetchHealthCheck, fetchFields, createField, deleteField } from './services/api';
import LandingPage from './components/LandingPage';
import TopNavbar from './components/TopNavbar';
import LeftSidebarNav from './components/LeftSidebarNav';
import FieldSidebar from './components/FieldSidebar';
import InteractiveMap from './components/InteractiveMap';
import AnalyticsDrawer from './components/AnalyticsDrawer';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [healthStatus, setHealthStatus] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('Farm Map');
  const [activeLeftView, setActiveLeftView] = useState('map');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState(null);

  const [loading, setLoading] = useState(true);

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
      console.error("Failed to load initial workspace data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Precision Agriculture Workspace View
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
          onViewChange={setActiveLeftView}
        />

        {/* Floating Left White Card & Parcel List */}
        <FieldSidebar
          fields={fields}
          selectedField={selectedField}
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

        {/* Central Aerial Satellite Map with Yellow Highlight & Right Map Details Card */}
        <InteractiveMap
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelectField={setSelectedFieldId}
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
    </div>
  );
}

export default App;
