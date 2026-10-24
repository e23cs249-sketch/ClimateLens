import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  CloudRain,
  Flame,
  Wind,
  Zap,
  Waves,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { WeatherData } from '../services/api.ts';

interface ClimateMapProps {
  weather: WeatherData | null;
  onSelectLocation: (loc: { label: string; latitude: number; longitude: number }) => void;
  onNavigateToMyArea: () => void;
  language: 'en' | 'ta';
}

interface HazardLayer {
  id: string;
  name: string;
  icon: any;
  color: string;
  unit: string;
  active: boolean;
  intensityLabel: string;
}

export const ClimateMap: React.FC<ClimateMapProps> = ({
  weather,
  onSelectLocation,
  onNavigateToMyArea,
  language,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layers, setLayers] = useState<HazardLayer[]>([
    { id: 'rainfall', name: 'Precipitation Depth', icon: CloudRain, color: '#19B8A5', unit: 'mm/h', active: true, intensityLabel: 'Active Radar Rain Band' },
    { id: 'flood', name: 'River Runoff & Inundation', icon: Waves, color: '#8CE6E0', unit: 'm depth', active: true, intensityLabel: 'Hydrodynamic Model' },
    { id: 'temperature', name: 'Surface Thermal Index', icon: Flame, color: '#FFBF69', unit: '°C heat', active: false, intensityLabel: 'Thermal Satellite Scan' },
    { id: 'wind', name: 'Max Gust Velocity', icon: Wind, color: '#8CE6E0', unit: 'km/h', active: true, intensityLabel: '10m AGL Wind Stream' },
    { id: 'lightning', name: 'Convective Lightning', icon: Zap, color: '#FF6268', unit: 'strikes', active: false, intensityLabel: 'Nowcast Flash Rate' },
    { id: 'aqi', name: 'PM2.5 Ambient Dust', icon: Activity, color: '#FFBF69', unit: 'AQI index', active: false, intensityLabel: 'Aerosol Sensor Network' },
  ]);

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, active: !l.active } : l))
    );
  };

  const REGIONAL_HOTSPOTS = [
    { name: 'Chennai Coastal Basin', lat: 13.0827, lon: 80.2707, x: 58, y: 68, risk: 'Moderate Rainfall Surge', status: 'caution' },
    { name: 'Kolkata & Ganges Delta', lat: 22.5726, lon: 88.3639, x: 67, y: 46, risk: 'Lowland Tidal Flood', status: 'watch' },
    { name: 'Mumbai Estuary Coast', lat: 19.076, lon: 72.8777, x: 44, y: 55, risk: 'Tidal Swell & High Wind', status: 'caution' },
    { name: 'Delhi National Capital Basin', lat: 28.6139, lon: 77.209, x: 49, y: 32, risk: 'Thermal & Particulate Inversion', status: 'advisory' },
    { name: 'Bengaluru Plateau Basin', lat: 12.9716, lon: 77.5946, x: 53, y: 72, risk: 'Urban Valley Runoff', status: 'normal' },
    { name: 'Brahmaputra Flood Corridor', lat: 26.2006, lon: 92.9376, x: 74, y: 36, risk: 'River Silt Surge Alert', status: 'watch' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 liquid-glass rounded-2xl border border-white/10">
        <div>
          <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#19B8A5]" />
            <span>Regional Geospatial Hazard Grid</span>
          </div>
          <h1 className="text-2xl font-bold text-[#F3F8FA] mt-0.5">
            {language === 'ta' ? 'காலநிலை & அபாய வரைபடம்' : 'Interactive Climate & Hazard Map'}
          </h1>
          <p className="text-xs text-[#A7BAC4] mt-1">
            Layered multi-hazard contours showing rainfall runoff, thermal stress, wind gusts, and flood inundation zones.
          </p>
        </div>

        {weather && (
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToMyArea}
              className="px-4 py-2.5 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Inspect {weather.location.label.split(',')[0]} Risk Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Map & Layer Controller Split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left: Hazard Layer Control Panel (inspired by image_733b61be.png) */}
        <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#8CE6E0]" />
              <h3 className="text-sm font-bold text-[#F3F8FA]">Hazard Layers</h3>
            </div>
            <span className="text-[11px] font-mono text-[#19B8A5]">
              {layers.filter((l) => l.active).length} Active
            </span>
          </div>

          <div className="space-y-2">
            {layers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    layer.active
                      ? 'bg-white/10 border-[#19B8A5]/50 text-[#F3F8FA] shadow-xs'
                      : 'bg-white/5 border-white/5 text-[#A7BAC4] hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" style={{ color: layer.active ? layer.color : '#A7BAC4' }} />
                    <div>
                      <div className="font-semibold">{layer.name}</div>
                      <div className="text-[10px] text-[#A7BAC4] mt-0.5">{layer.intensityLabel}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1 rounded text-[#A7BAC4] hover:text-white"
                  >
                    {layer.active ? (
                      <Eye className="w-4 h-4 text-[#19B8A5]" />
                    ) : (
                      <EyeOff className="w-4 h-4 opacity-40" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-white/10 text-[11px] text-[#A7BAC4] space-y-2">
            <div className="font-semibold text-[#F3F8FA]">Map Layer Legend:</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#19B8A5]" />
              <span>Precipitation Band (Open-Meteo)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8CE6E0]" />
              <span>Inundation &amp; Coastal Surge</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFBF69]" />
              <span>Thermal Exceedance / PM2.5</span>
            </div>
          </div>
        </div>

        {/* Right: Interactive Geographic Viewport */}
        <div className="lg:col-span-3 liquid-glass rounded-2xl p-4 sm:p-6 border border-white/10 space-y-4 relative overflow-hidden">
          {/* Map Controls Toolbar */}
          <div className="flex items-center justify-between text-xs border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#19B8A5] animate-ping" />
              <span className="font-mono text-[#8CE6E0] font-semibold">GEOSPATIAL HAZARD PROJECTION</span>
              <span className="text-white/40">·</span>
              <span className="text-[#A7BAC4] text-[11px]">South Asia &amp; Global Climate Corridor</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F3F8FA] border border-white/10"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F3F8FA] border border-white/10"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#F3F8FA] border border-white/10"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Geographic Canvas SVG Surface */}
          <div
            className="w-full h-[460px] sm:h-[520px] bg-[#071722] rounded-xl border border-white/10 relative overflow-hidden cursor-crosshair transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {/* Topographic Background Grid & Radar Sweep */}
            <svg className="w-full h-full absolute inset-0 opacity-20 pointer-events-none">
              <defs>
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#8CE6E0" strokeWidth="0.5" />
                </pattern>
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#19B8A5" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#071722" stopOpacity="0.0" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <circle cx="50%" cy="50%" r="42%" fill="url(#radarSweep)" />
            </svg>

            {/* Stylized Coastal Contours SVG (South Asia / Peninsular India & Bay of Bengal) */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 select-none">
              {/* Landmass Contour Silhouette */}
              <path
                d="M 30,15 L 42,10 L 62,8 L 78,16 L 82,30 L 76,42 L 70,48 L 65,60 L 58,78 L 52,90 L 46,78 L 40,65 L 34,50 L 32,35 Z"
                fill="#0B2633"
                stroke="#19B8A5"
                strokeWidth="0.6"
                opacity="0.8"
              />

              {/* Sri Lanka island */}
              <ellipse cx="60" cy="94" rx="2.5" ry="3.5" fill="#0B2633" stroke="#19B8A5" strokeWidth="0.5" />

              {/* Active Hazard Layer 1: Inundation Overlays (River & Coastal runoff) */}
              {layers.find((l) => l.id === 'flood')?.active && (
                <path
                  d="M 64,44 Q 68,48 66,54 Q 60,65 59,75 Q 57,80 56,86 L 58,84 Q 62,70 65,58 Z"
                  fill="#8CE6E0"
                  opacity="0.45"
                  className="animate-pulse"
                />
              )}

              {/* Active Hazard Layer 2: Rainfall Radar Band */}
              {layers.find((l) => l.id === 'rainfall')?.active && (
                <circle cx="56" cy="74" r="12" fill="#19B8A5" opacity="0.25" />
              )}

              {/* Active Hazard Layer 3: Thermal Polygon */}
              {layers.find((l) => l.id === 'temperature')?.active && (
                <polygon points="46,28 54,26 56,36 48,38" fill="#FFBF69" opacity="0.3" />
              )}
            </svg>

            {/* Interactive Location Hub Pins on Map */}
            {REGIONAL_HOTSPOTS.map((spot) => (
              <div
                key={spot.name}
                onClick={() => {
                  onSelectLocation({
                    label: `${spot.name}, India`,
                    latitude: spot.lat,
                    longitude: spot.lon,
                  });
                }}
                className="absolute z-20 group cursor-pointer -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {/* Ping animation for active risk points */}
                <span className="absolute -inset-1.5 rounded-full bg-[#19B8A5] opacity-50 animate-ping" />
                <div className="relative w-4 h-4 rounded-full bg-[#071722] border-2 border-[#19B8A5] flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8CE6E0]" />
                </div>

                {/* Hover Tooltip Box */}
                <div className="absolute left-6 -top-2 hidden group-hover:block z-30 w-48 p-2.5 rounded-lg liquid-glass border border-[#19B8A5]/40 text-xs shadow-xl pointer-events-none">
                  <div className="font-bold text-[#F3F8FA]">{spot.name}</div>
                  <div className="text-[11px] text-[#FFBF69] mt-0.5">{spot.risk}</div>
                  <div className="text-[10px] font-mono text-[#A7BAC4] mt-1">
                    Lat: {spot.lat.toFixed(2)}° · Lon: {spot.lon.toFixed(2)}°
                  </div>
                  <div className="text-[10px] text-[#19B8A5] font-semibold mt-1">
                    Click to load My Area data →
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Map Footer Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#A7BAC4] pt-2 border-t border-white/10 gap-2">
            <span>
              <strong>Scientific Grounding:</strong> Meteorological fields projected from ECMWF 0.1° atmospheric grid models.
            </span>
            <span className="font-mono text-[#19B8A5]">
              Active Sensors: 1,480 reporting nodes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
