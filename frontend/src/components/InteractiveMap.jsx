import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Layers, MousePointer, Layers3, RefreshCw } from 'lucide-react';

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

  const [activeTileProvider, setActiveTileProvider] = useState('esri'); // 'esri' | 'osm'
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

      map.addLayer({
        id: 'fields-fill',
        type: 'fill',
        source: 'fields-source',
        paint: {
          'fill-color': ['case', ['==', ['get', 'id'], selectedFieldId || -1], '#10b981', '#059669'],
          'fill-opacity': 0.4
        }
      });

      map.addLayer({
        id: 'fields-line',
        type: 'line',
        source: 'fields-source',
        paint: { 'line-color': '#34d399', 'line-width': 2 }
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

    // Default center: Agricultural farmland region in Kansas/Midwest
    const map = L.map(mapContainerRef.current, {
      center: [38.55, -102.45],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    // High-Resolution Esri World Imagery Satellite Tile Layer (Zero Token Required)
    const esriTileLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS'
      }
    );

    const osmTileLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }
    );

    if (activeTileProvider === 'esri') {
      esriTileLayer.addTo(map);
    } else {
      osmTileLayer.addTo(map);
    }

    // Layers for field boundaries & active drawing line
    const fieldsGroup = L.featureGroup().addTo(map);
    const drawGroup = L.featureGroup().addTo(map);

    leafletMapRef.current = map;
    leafletFieldsLayerRef.current = fieldsGroup;
    leafletDrawLayerRef.current = drawGroup;

    setMapLoaded(true);

    return () => {
      map.remove();
    };
  }, [MAPBOX_TOKEN, activeTileProvider]);

  // Handle Leaflet interactive map clicks for polygon drawing
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || MAPBOX_TOKEN) return;

    const handleMapClick = (e) => {
      if (!isDrawing) return;

      const { lat, lng } = e.latlng;
      setDrawingVertices((prev) => {
        const next = [...prev, [lng, lat]];

        // Draw vertices and line
        const drawGroup = leafletDrawLayerRef.current;
        if (drawGroup) {
          drawGroup.clearLayers();

          // Render marker points
          next.forEach(([l, a]) => {
            L.circleMarker([a, l], {
              radius: 6,
              color: '#34d399',
              fillColor: '#10b981',
              fillOpacity: 0.9
            }).addTo(drawGroup);
          });

          // Render connecting polyline / polygon
          if (next.length >= 2) {
            const latLngs = next.map(([l, a]) => [a, l]);
            L.polygon(latLngs, {
              color: '#34d399',
              fillColor: '#10b981',
              fillOpacity: 0.35,
              dashArray: '5, 5'
            }).addTo(drawGroup);
          }
        }

        // Trigger polygon callback when 3+ vertices placed
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

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawing, MAPBOX_TOKEN]);

  // Render ingested field boundaries on Leaflet map
  useEffect(() => {
    if (MAPBOX_TOKEN || !leafletFieldsLayerRef.current) return;

    const fieldsGroup = leafletFieldsLayerRef.current;
    fieldsGroup.clearLayers();

    fields.forEach((field) => {
      const isSelected = selectedFieldId === field.id;
      const coords = field.geometry?.coordinates?.[0] || [];
      if (!coords.length) return;

      // Swap [lon, lat] to Leaflet [lat, lon]
      const latLngs = coords.map(([lon, lat]) => [lat, lon]);

      const polygonLayer = L.polygon(latLngs, {
        color: isSelected ? '#10b981' : '#059669',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#10b981' : '#047857',
        fillOpacity: isSelected ? 0.5 : 0.3
      });

      polygonLayer.bindTooltip(`<b>${field.name}</b><br/>${field.crop_type} (${field.area_hectares} ha)`, {
        permanent: false,
        direction: 'top'
      });

      polygonLayer.on('click', () => {
        onSelectField(field.id);
      });

      polygonLayer.addTo(fieldsGroup);
    });
  }, [fields, selectedFieldId, MAPBOX_TOKEN]);

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
    <div className="relative flex-1 h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Layer Switcher & Status (Top-Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-2xl text-xs space-y-2">
          <div className="flex items-center justify-between space-x-2 text-slate-200 font-semibold">
            <div className="flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Map Engine</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
              {MAPBOX_TOKEN ? 'Mapbox GL' : 'Esri Satellite (Free)'}
            </span>
          </div>

          {!MAPBOX_TOKEN && (
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTileProvider('esri')}
                className={`flex-1 py-1 px-2 rounded font-medium text-[11px] transition-all ${
                  activeTileProvider === 'esri'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Satellite Imagery
              </button>
              <button
                onClick={() => setActiveTileProvider('osm')}
                className={`flex-1 py-1 px-2 rounded font-medium text-[11px] transition-all ${
                  activeTileProvider === 'osm'
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                OpenStreetMap
              </button>
            </div>
          )}

          {isDrawing && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-emerald-400 text-[11px]">
              <span className="font-mono">{drawingVertices.length} corners placed</span>
              <button
                onClick={() => {
                  setDrawingVertices([]);
                  if (leafletDrawLayerRef.current) leafletDrawLayerRef.current.clearLayers();
                }}
                className="underline hover:text-emerald-300"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Center Map Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center space-x-4 shadow-2xl z-[1000]">
        <div className="flex items-center space-x-1.5">
          <div className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-400" />
          <span>Ingested Field Boundary</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center space-x-1.5 text-slate-400">
          <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
          <span>{isDrawing ? 'Click map to place polygon corners' : 'Click field to inspect ML yield & satellite analytics'}</span>
        </div>
      </div>
    </div>
  );
}
