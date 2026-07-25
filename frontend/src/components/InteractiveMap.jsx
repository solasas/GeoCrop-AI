import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MousePointer, CheckCircle2 } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function InteractiveMap({
  fields = [],
  selectedFieldId,
  onSelectField,
  isDrawing,
  onPolygonDrawn
}) {
  const mapContainerRef = useRef(null);
  const mapboxRef = useRef(null);
  const mapboxDrawRef = useRef(null);

  // Leaflet references
  const leafletMapRef = useRef(null);
  const leafletDrawLayerRef = useRef(null);
  const leafletFieldsLayerRef = useRef(null);

  const [activeViewMode, setActiveViewMode] = useState('Crop status');
  const [drawingVertices, setDrawingVertices] = useState([]);

  // 1. Initialize Mapbox GL JS if Mapbox Token is provided
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-102.45, 38.55],
      zoom: 12,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: { polygon: true, trash: true },
      defaultMode: 'simple_select'
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(draw, 'top-right');

    mapboxDrawRef.current = draw;
    mapboxRef.current = map;

    map.on('load', () => {
      map.addSource('fields-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fields.map(f => ({
            type: 'Feature',
            id: f.id,
            properties: { id: f.id, name: f.name, crop_type: f.crop_type, area_hectares: f.area_hectares },
            geometry: f.geometry
          }))
        }
      });

      map.addLayer({
        id: 'fields-fill',
        type: 'fill',
        source: 'fields-source',
        paint: {
          'fill-color': ['case', ['==', ['get', 'id'], selectedFieldId || -1], '#22c55e', '#84cc16'],
          'fill-opacity': 0.45
        }
      });

      map.addLayer({
        id: 'fields-line',
        type: 'line',
        source: 'fields-source',
        paint: {
          'line-color': ['case', ['==', ['get', 'id'], selectedFieldId || -1], '#facc15', '#ffffff'],
          'line-width': ['case', ['==', ['get', 'id'], selectedFieldId || -1], 3.5, 2]
        }
      });
    });

    const handleDraw = () => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        onPolygonDrawn(data.features[data.features.length - 1].geometry);
      }
    };

    map.on('draw.create', handleDraw);
    map.on('draw.update', handleDraw);

    return () => map.remove();
  }, [MAPBOX_TOKEN]);

  // 2. Initialize Leaflet map instance
  useEffect(() => {
    if (MAPBOX_TOKEN || !mapContainerRef.current) return;
    if (leafletMapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.55, -102.45],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Non-blocking pane for city & place labels
    map.createPane('labelsPane');
    map.getPane('labelsPane').style.zIndex = 650;
    map.getPane('labelsPane').style.pointerEvents = 'none';

    // Satellite Imagery Layer
    const esriTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
      }
    );

    // Non-blocking Labels Layer
    const labelsOverlayLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        pane: 'labelsPane'
      }
    );

    esriTileLayer.addTo(map);
    labelsOverlayLayer.addTo(map);

    const fieldsGroup = L.featureGroup().addTo(map);
    const drawGroup = L.featureGroup().addTo(map);

    leafletMapRef.current = map;
    leafletFieldsLayerRef.current = fieldsGroup;
    leafletDrawLayerRef.current = drawGroup;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [MAPBOX_TOKEN]);

  // Handle Leaflet interactive map clicks for polygon drawing
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || MAPBOX_TOKEN) return;

    const handleMapClick = (e) => {
      if (!isDrawing) return;

      const { lat, lng } = e.latlng;
      setDrawingVertices((prev) => {
        const next = [...prev, [lng, lat]];

        const drawGroup = leafletDrawLayerRef.current;
        if (drawGroup) {
          drawGroup.clearLayers();

          next.forEach(([l, a]) => {
            L.circleMarker([a, l], {
              radius: 6,
              color: '#facc15',
              fillColor: '#22c55e',
              fillOpacity: 0.9
            }).addTo(drawGroup);
          });

          if (next.length >= 2) {
            const latLngs = next.map(([l, a]) => [a, l]);
            L.polygon(latLngs, {
              color: '#facc15',
              weight: 3,
              fillColor: '#22c55e',
              fillOpacity: 0.4,
              dashArray: '5, 5'
            }).addTo(drawGroup);
          }
        }

        if (next.length >= 3) {
          const closedRing = [...next, next[0]];
          onPolygonDrawn({
            type: 'Polygon',
            coordinates: [closedRing]
          });
        }

        return next;
      });
    };

    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [isDrawing, MAPBOX_TOKEN]);

  // Render ingested field boundaries with full click interactivity
  useEffect(() => {
    if (MAPBOX_TOKEN || !leafletFieldsLayerRef.current) return;

    const fieldsGroup = leafletFieldsLayerRef.current;
    fieldsGroup.clearLayers();

    const fieldColors = [
      { fill: '#22c55e', stroke: '#facc15' },
      { fill: '#a855f7', stroke: '#e9d5ff' },
      { fill: '#d97706', stroke: '#fef08a' },
      { fill: '#16a34a', stroke: '#facc15' }
    ];

    fields.forEach((field, idx) => {
      const isSelected = selectedFieldId === field.id;
      const coords = field.geometry?.coordinates?.[0] || [];
      if (!coords.length) return;

      const latLngs = coords.map(([lon, lat]) => [lat, lon]);
      const palette = fieldColors[idx % fieldColors.length];
      const fillColor = activeViewMode === 'NDVI' ? '#10b981' : palette.fill;
      const strokeColor = isSelected ? '#facc15' : palette.stroke;

      const polygonLayer = L.polygon(latLngs, {
        color: strokeColor,
        weight: isSelected ? 5 : 2.5,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.65 : 0.4,
        interactive: true
      });

      const acres = Math.round((field.area_hectares || 4.5) * 2.47105 * 100) / 100;

      polygonLayer.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px;">
          <b>${field.name}</b> (${field.crop_type})<br/>
          Area: <b>${acres} Acres</b>
        </div>`,
        { permanent: false, direction: 'top' }
      );

      // Direct click handler for field selection
      polygonLayer.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        onSelectField(field.id);
      });

      polygonLayer.addTo(fieldsGroup);

      if (isSelected && latLngs.length > 0) {
        const centerLat = latLngs.reduce((acc, p) => acc + p[0], 0) / latLngs.length;
        const centerLng = latLngs.reduce((acc, p) => acc + p[1], 0) / latLngs.length;

        const greenMarkerIcon = L.divIcon({
          className: 'custom-green-pin',
          html: `<div style="
            width: 26px;
            height: 26px;
            background: #22c55e;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 14px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
          </div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });

        L.marker([centerLat, centerLng], { icon: greenMarkerIcon }).addTo(fieldsGroup);
      }
    });
  }, [fields, selectedFieldId, activeViewMode, MAPBOX_TOKEN]);

  useEffect(() => {
    if (!isDrawing) {
      setDrawingVertices([]);
      if (leafletDrawLayerRef.current) {
        leafletDrawLayerRef.current.clearLayers();
      }
    }
  }, [isDrawing]);

  return (
    <div className="relative flex-1 h-full w-full bg-slate-900 overflow-hidden select-none">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* View Mode Switcher Card */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-slate-200/80 w-64 text-slate-900">
          <h3 className="font-extrabold text-xs text-slate-900 mb-2">Map View Layer</h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveViewMode('Crop status')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeViewMode === 'Crop status'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Crop Status
            </button>

            <button
              onClick={() => setActiveViewMode('NDVI')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeViewMode === 'NDVI'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              NDVI Canopy
            </button>
          </div>
        </div>
      </div>

      {/* Instant Field Selector Bar on Map */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 p-2 rounded-2xl text-xs text-slate-700 font-semibold shadow-2xl z-[1000] flex items-center space-x-2">
        <span className="text-[11px] font-bold text-slate-500 pl-2">Select Field:</span>
        <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md">
          {fields.map((f) => {
            const isSel = selectedFieldId === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onSelectField(f.id)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isSel
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{f.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
