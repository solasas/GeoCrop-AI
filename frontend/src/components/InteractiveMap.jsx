import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Layers, MousePointer, MapPin, Eye } from 'lucide-react';

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

  // Active Map Details Toggles
  const [activeToggle, setActiveToggle] = useState('Nodes'); // 'Nodes' | 'Sectors' | 'Equipment' | 'Measure'
  const [activeViewMode, setActiveViewMode] = useState('Crop status'); // 'Crop status' | 'NDVI'
  const [drawingVertices, setDrawingVertices] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

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
      setMapLoaded(true);
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

      // Yellow outline highlight layer
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

  // 2. Initialize Leaflet zero-token Satellite / OpenStreetMap engine if Mapbox Token is absent
  useEffect(() => {
    if (MAPBOX_TOKEN || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [38.55, -102.45],
      zoom: 13,
      zoomControl: false
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    // High-Resolution Esri World Imagery Satellite Tile Layer (Zero Token Required)
    const esriTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, USDA, USGS'
      }
    );

    esriTileLayer.addTo(map);

    const fieldsGroup = L.featureGroup().addTo(map);
    const drawGroup = L.featureGroup().addTo(map);

    leafletMapRef.current = map;
    leafletFieldsLayerRef.current = fieldsGroup;
    leafletDrawLayerRef.current = drawGroup;

    setMapLoaded(true);

    return () => {
      map.remove();
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

  // Render ingested field boundaries with thin yellow highlight & green marker pin
  useEffect(() => {
    if (MAPBOX_TOKEN || !leafletFieldsLayerRef.current) return;

    const fieldsGroup = leafletFieldsLayerRef.current;
    fieldsGroup.clearLayers();

    // Palette for farm fields (vibrant green, purple, yellow-brown)
    const fieldColors = [
      { fill: '#22c55e', stroke: '#facc15' }, // Green with yellow outline
      { fill: '#a855f7', stroke: '#e9d5ff' }, // Purple
      { fill: '#d97706', stroke: '#fef08a' }, // Yellow-brown
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

      // Polygon Layer with yellow highlight outline on selected field
      const polygonLayer = L.polygon(latLngs, {
        color: strokeColor,
        weight: isSelected ? 4 : 2,
        fillColor: fillColor,
        fillOpacity: isSelected ? 0.55 : 0.35
      });

      polygonLayer.bindTooltip(
        `<div style="font-family: sans-serif; font-size: 11px;">
          <b>${field.name}</b> (${field.crop_type})<br/>
          Area: <b>${field.area_hectares} Ha</b>
        </div>`,
        { permanent: false, direction: 'top' }
      );

      polygonLayer.on('click', () => {
        onSelectField(field.id);
      });

      polygonLayer.addTo(fieldsGroup);

      // Render Green Marker Pin at centroid for selected field
      if (isSelected && latLngs.length > 0) {
        const centerLat = latLngs.reduce((acc, p) => acc + p[0], 0) / latLngs.length;
        const centerLng = latLngs.reduce((acc, p) => acc + p[1], 0) / latLngs.length;

        const greenMarkerIcon = L.divIcon({
          className: 'custom-green-pin',
          html: `<div style="
            width: 24px;
            height: 24px;
            background: #22c55e;
            border: 3px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 8px; height: 8px; background: #ffffff; border-radius: 50%;"></div>
          </div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        L.marker([centerLat, centerLng], { icon: greenMarkerIcon }).addTo(fieldsGroup);
      }
    });
  }, [fields, selectedFieldId, activeViewMode, MAPBOX_TOKEN]);

  // Reset drawing layer when drawing state finishes or cancels
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
      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Right "Map details" White Card Panel */}
      <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
        <div className="bg-white rounded-2xl p-4 shadow-xl border border-slate-200/80 w-72 text-slate-900 transition-all">
          <h3 className="font-extrabold text-sm text-slate-900 mb-3">Map details</h3>

          {/* Two Map Thumbnails: "Crop status" and "NDVI" */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Thumbnail 1: Crop Status */}
            <button
              onClick={() => setActiveViewMode('Crop status')}
              className={`rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                activeViewMode === 'Crop status'
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="h-16 bg-gradient-to-br from-emerald-500 via-purple-600 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-2 border border-yellow-300 rounded" />
              </div>
              <span className="block p-1.5 text-[11px] font-semibold text-slate-700 text-center bg-white">
                Crop status
              </span>
            </button>

            {/* Thumbnail 2: NDVI */}
            <button
              onClick={() => setActiveViewMode('NDVI')}
              className={`rounded-xl overflow-hidden border transition-all text-left group cursor-pointer ${
                activeViewMode === 'NDVI'
                  ? 'border-slate-900 ring-2 ring-slate-900/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="h-16 bg-gradient-to-br from-emerald-400 via-lime-300 to-red-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
              </div>
              <span className="block p-1.5 text-[11px] font-semibold text-slate-700 text-center bg-white">
                NDVI
              </span>
            </button>
          </div>

          <div className="h-px bg-slate-100 mb-3" />

          {/* Toggle Buttons: Nodes (black filled state), Sectors, Equipment, Measure */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Nodes', 'Sectors', 'Equipment', 'Measure'].map((item) => {
              const isActive = activeToggle === item;
              return (
                <button
                  key={item}
                  onClick={() => setActiveToggle(item)}
                  className={`py-2 px-3 rounded-xl font-bold transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Center Floating Guide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-full text-xs text-slate-700 font-semibold shadow-xl z-[1000] flex items-center space-x-3">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-slate-900" />
          <span>Active Farm Field</span>
        </div>
        <div className="h-3 w-px bg-slate-300" />
        <div className="flex items-center space-x-1.5 text-slate-500">
          <MousePointer className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isDrawing ? 'Click map to digitize polygon corners' : 'Click field parcel to view analytics'}</span>
        </div>
      </div>
    </div>
  );
}
