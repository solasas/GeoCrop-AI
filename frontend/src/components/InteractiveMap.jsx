import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Layers, MapPin, MousePointer, Shield, Maximize2 } from 'lucide-react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

export default function InteractiveMap({
  fields = [],
  selectedFieldId,
  onSelectField,
  isDrawing,
  onPolygonDrawn
}) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const drawRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [svgCoordinates, setSvgCoordinates] = useState([]);
  const [hoveredField, setHoveredField] = useState(null);

  // Initialize Mapbox GL JS if token is available
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [-102.45, 38.55], // Sample agricultural region (Kansas / Midwest)
      zoom: 12,
    });

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      },
      defaultMode: 'simple_select'
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.addControl(draw, 'top-right');

    drawRef.current = draw;
    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // Add fields GeoJSON source
      map.addSource('fields-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: fields.map(f => f.to_geojson_feature ? f.to_geojson_feature() : {
            type: 'Feature',
            id: f.id,
            properties: { id: f.id, name: f.name, crop_type: f.crop_type, area_hectares: f.area_hectares },
            geometry: f.geometry
          })
        }
      });

      // Add field polygon fill layer
      map.addLayer({
        id: 'fields-fill',
        type: 'fill',
        source: 'fields-source',
        paint: {
          'fill-color': [
            'case',
            ['==', ['get', 'id'], selectedFieldId || -1], '#10b981',
            '#059669'
          ],
          'fill-opacity': 0.4
        }
      });

      // Add field polygon outline layer
      map.addLayer({
        id: 'fields-line',
        type: 'line',
        source: 'fields-source',
        paint: {
          'line-color': '#34d399',
          'line-width': 2
        }
      });
    });

    // Draw event listeners
    const handleDrawCreateOrUpdate = (e) => {
      const data = draw.getAll();
      if (data.features.length > 0) {
        const lastFeature = data.features[data.features.length - 1];
        onPolygonDrawn(lastFeature.geometry);
      }
    };

    map.on('draw.create', handleDrawCreateOrUpdate);
    map.on('draw.update', handleDrawCreateOrUpdate);

    return () => {
      map.remove();
    };
  }, [MAPBOX_TOKEN]);

  // Update map features when fields state changes
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const source = mapRef.current.getSource('fields-source');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: fields.map(f => ({
          type: 'Feature',
          id: f.id,
          properties: { id: f.id, name: f.name, crop_type: f.crop_type, area_hectares: f.area_hectares },
          geometry: f.geometry
        }))
      });
    }
  }, [fields, selectedFieldId, mapLoaded]);

  // Toggle Mapbox draw mode when isDrawing prop changes
  useEffect(() => {
    if (drawRef.current) {
      if (isDrawing) {
        drawRef.current.changeMode('draw_polygon');
      } else {
        drawRef.current.changeMode('simple_select');
        drawRef.current.deleteAll();
      }
    }
  }, [isDrawing]);

  // SVG Fallback Canvas Handler for environments without Mapbox Access Token
  const handleSvgCanvasClick = (e) => {
    if (!isDrawing) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newCoords = [...svgCoordinates, [x, y]];
    setSvgCoordinates(newCoords);

    // When at least 3 points are clicked, construct valid GeoJSON Polygon
    if (newCoords.length >= 3) {
      // Map screen % coords to sample geo bounding box (-102.50 to -102.40 lon, 38.50 to 38.60 lat)
      const geoCoords = newCoords.map(([px, py]) => [
        -102.50 + (px / 100.0) * 0.10,
        38.60 - (py / 100.0) * 0.10
      ]);
      // Close polygon ring
      geoCoords.push(geoCoords[0]);

      onPolygonDrawn({
        type: 'Polygon',
        coordinates: [geoCoords]
      });
    }
  };

  const handleResetSvgDrawing = () => {
    setSvgCoordinates([]);
  };

  return (
    <div className="relative flex-1 h-full w-full bg-slate-950 overflow-hidden select-none">
      {MAPBOX_TOKEN ? (
        <div ref={mapContainer} className="w-full h-full" />
      ) : (
        /* Fallback High-Fidelity Spatial Canvas */
        <div
          onClick={handleSvgCanvasClick}
          className={`relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 overflow-hidden ${
            isDrawing ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* Simulated Satellite Grid overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Render saved field polygons */}
            {fields.map((field) => {
              const isSelected = selectedFieldId === field.id;
              // Map GeoJSON polygon coordinates to canvas % for display
              const coords = field.geometry?.coordinates?.[0] || [];
              const points = coords.map(([lon, lat]) => {
                const x = ((lon - (-102.50)) / 0.10) * 100;
                const y = ((38.60 - lat) / 0.10) * 100;
                return `${x}%,${y}%`;
              }).join(' ');

              return (
                <g key={field.id} onClick={() => onSelectField(field.id)} className="cursor-pointer pointer-events-auto">
                  <polygon
                    points={points}
                    className={`transition-all duration-200 ${
                      isSelected
                        ? 'fill-emerald-500/50 stroke-emerald-400 stroke-[3]'
                        : 'fill-emerald-500/25 stroke-emerald-500/70 stroke-[2] hover:fill-emerald-500/40'
                    }`}
                  />
                  {/* Field Centroid Label */}
                  {coords.length > 0 && (
                    <text
                      x={`${((coords[0][0] - (-102.50)) / 0.10) * 100}%`}
                      y={`${((38.60 - coords[0][1]) / 0.10) * 100}%`}
                      fill="#e2e8f0"
                      fontSize="11"
                      fontWeight="600"
                      className="drop-shadow-md select-none"
                    >
                      {field.name} ({field.crop_type})
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render active drawing line */}
            {svgCoordinates.length > 0 && (
              <g>
                <polyline
                  points={svgCoordinates.map(([x, y]) => `${x}%,${y}%`).join(' ')}
                  className="fill-none stroke-emerald-400 stroke-[2] stroke-dasharray-[4]"
                />
                {svgCoordinates.map(([x, y], idx) => (
                  <circle
                    key={idx}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="5"
                    className="fill-emerald-400 stroke-white stroke-2 animate-pulse"
                  />
                ))}
              </g>
            )}
          </svg>

          {/* Top-Right Map Controls / Mode Status */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-300 font-semibold">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Spatial Map View</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {MAPBOX_TOKEN ? 'Mapbox Satellite Layer Active' : 'High-Resolution Spatial Canvas'}
              </p>
              {isDrawing && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-emerald-400">
                  <span className="font-mono">{svgCoordinates.length} vertices placed</span>
                  <button
                    onClick={handleResetSvgDrawing}
                    className="text-[10px] underline hover:text-emerald-300"
                  >
                    Clear Vertices
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Center Legend & Instructions */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/85 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-full text-xs text-slate-300 flex items-center space-x-4 shadow-xl z-20">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/50 border border-emerald-400" />
              <span>Ingested Field Boundary</span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center space-x-1.5 text-slate-400">
              <MousePointer className="w-3.5 h-3.5" />
              <span>{isDrawing ? 'Click canvas to set polygon corners' : 'Select field parcel to inspect'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
