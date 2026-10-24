import React from 'react';
import {
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Compass,
  Gauge,
  Sun,
  Activity,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { WeatherData } from '../services/api.ts';
import { FreshnessIndicator } from './FreshnessIndicator.tsx';

interface WeatherOverviewProps {
  weather: WeatherData;
  language: 'en' | 'ta';
  onSealEvidence: () => void;
  isSealing: boolean;
}

export const WeatherOverview: React.FC<WeatherOverviewProps> = ({
  weather,
  language,
  onSealEvidence,
  isSealing,
}) => {
  const values = weather.values;
  const units = weather.units;

  // Render clean SVG hourly trend
  const renderHourlySparkline = () => {
    if (!weather.hourlyForecast || weather.hourlyForecast.length === 0) return null;
    const data = weather.hourlyForecast.slice(0, 24);
    const temps = data.map((d) => d.temperature);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;

    const width = 600;
    const height = 80;
    const padding = 12;

    const points = data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((d.temperature - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

    return (
      <div className="mt-4 pt-4 border-t border-[#DDE5DE]">
        <div className="flex items-center justify-between text-xs text-[#697871] mb-2">
          <span className="font-semibold text-[#172923]">
            {language === 'ta' ? 'அடுத்த 24 மணி நேர வெப்பநிலை நகர்வு' : '24-Hour Temperature Trajectory'}
          </span>
          <span className="font-mono text-[11px]">
            Min: {min.toFixed(1)}°C · Max: {max.toFixed(1)}°C
          </span>
        </div>
        <div className="w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20 overflow-visible">
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2D8173" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#2D8173" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#tempGradient)" />
            <path d={pathD} fill="none" stroke="#2D8173" strokeWidth="2" strokeLinecap="round" />
            {data.filter((_, i) => i % 4 === 0).map((d, i) => {
              const originalIndex = i * 4;
              const x = padding + (originalIndex / (data.length - 1)) * (width - padding * 2);
              const y = height - padding - ((d.temperature - min) / range) * (height - padding * 2);
              const hourLabel = new Date(d.time).toLocaleTimeString([], { hour: 'numeric' });
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="3" fill="#123D32" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text x={x} y={height} textAnchor="middle" fontSize="9" fill="#697871" fontFamily="sans-serif">
                    {hourLabel}
                  </text>
                  <text x={x} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="600" fill="#172923" fontFamily="monospace">
                    {d.temperature.toFixed(0)}°
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Temperature */}
        <div className="bg-white border border-[#DDE5DE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697871] text-xs">
            <span>{language === 'ta' ? 'வெப்பநிலை' : 'Ambient Temperature'}</span>
            <Thermometer className="w-4 h-4 text-[#2D8173]" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-[#172923] font-mono tabular-nums">
              {values.temperature.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#697871] ml-1.5">{units.temperature}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#697871]">
            {language === 'ta' ? 'உணரப்படுவது' : 'Feels like'} {values.apparentTemperature.toFixed(1)}{units.apparentTemperature}
          </div>
        </div>

        {/* Metric 2: Relative Humidity */}
        <div className="bg-white border border-[#DDE5DE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697871] text-xs">
            <span>{language === 'ta' ? 'ஈரப்பதம்' : 'Relative Humidity'}</span>
            <Droplets className="w-4 h-4 text-[#2D8173]" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-[#172923] font-mono tabular-nums">
              {values.relativeHumidity}
            </span>
            <span className="text-xs font-mono text-[#697871] ml-1.5">{units.relativeHumidity}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#697871]">
            {values.relativeHumidity > 75 ? 'Elevated atmospheric moisture' : 'Moderate ambient moisture'}
          </div>
        </div>

        {/* Metric 3: Precipitation */}
        <div className="bg-white border border-[#DDE5DE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697871] text-xs">
            <span>{language === 'ta' ? 'மழைப்பொழிவு' : 'Precipitation'}</span>
            <CloudRain className="w-4 h-4 text-[#2D8173]" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-[#172923] font-mono tabular-nums">
              {values.precipitation.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#697871] ml-1.5">{units.precipitation}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#697871]">
            {values.weatherDescription}
          </div>
        </div>

        {/* Metric 4: Wind Speed */}
        <div className="bg-white border border-[#DDE5DE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-[#697871] text-xs">
            <span>{language === 'ta' ? 'காற்றின் வேகம்' : 'Wind Speed (10m)'}</span>
            <Wind className="w-4 h-4 text-[#2D8173]" />
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-[#172923] font-mono tabular-nums">
              {values.windSpeed.toFixed(1)}
            </span>
            <span className="text-xs font-mono text-[#697871] ml-1.5">{units.windSpeed}</span>
          </div>
          <div className="mt-1 text-[11px] text-[#697871]">
            Surface pressure: {values.surfacePressure ? values.surfacePressure.toFixed(0) : '--'} hPa
          </div>
        </div>
      </div>

      {/* Main Conditions Card with Hourly Sparkline */}
      <div className="bg-white border border-[#DDE5DE] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#2D8173] uppercase tracking-wider">
              {language === 'ta' ? 'தற்போதைய வளிமண்டல நிலை' : 'Current Atmospheric Observation'}
            </div>
            <h2 className="text-2xl font-bold text-[#172923] mt-1">{values.weatherDescription}</h2>
            <div className="text-xs text-[#697871] mt-1 flex flex-wrap items-center gap-2">
              <span>{weather.location.label}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">Lat {weather.location.latitude.toFixed(2)}°, Lon {weather.location.longitude.toFixed(2)}°</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSealEvidence}
              disabled={isSealing}
              className="px-4 py-2 bg-[#123D32] hover:bg-[#0B2822] text-white text-xs font-semibold rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isSealing ? 'Sealing Cryptographic Evidence...' : 'Seal as Evidence Snapshot'}</span>
            </button>
          </div>
        </div>

        {/* 24h Hourly chart */}
        {renderHourlySparkline()}
      </div>

      {/* Secondary split: Air Quality Index + 7-Day Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Air Quality Card */}
        <div className="bg-white border border-[#DDE5DE] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#123D32]" />
              <h3 className="text-sm font-bold text-[#172923]">
                {language === 'ta' ? 'காற்றின் தரம் (Air Quality)' : 'Ambient Air Quality'}
              </h3>
            </div>
            {weather.airQuality && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#E4F4E9] text-[#24724E]">
                {weather.airQuality.statusLabel}
              </span>
            )}
          </div>

          {weather.airQuality ? (
            <div className="space-y-3 pt-1">
              <div className="flex items-baseline justify-between border-b border-[#F0F4F1] pb-2">
                <span className="text-xs text-[#697871]">US AQI Index</span>
                <span className="text-xl font-bold font-mono text-[#172923]">{weather.airQuality.usAqi}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[#F9FBFA] rounded border border-[#E8EEEA]">
                  <span className="text-[#697871] block text-[10px]">PM2.5 Fine Dust</span>
                  <span className="font-mono font-semibold text-[#172923]">{weather.airQuality.pm2_5.toFixed(1)} µg/m³</span>
                </div>
                <div className="p-2 bg-[#F9FBFA] rounded border border-[#E8EEEA]">
                  <span className="text-[#697871] block text-[10px]">PM10 Coarse Dust</span>
                  <span className="font-mono font-semibold text-[#172923]">{weather.airQuality.pm10.toFixed(1)} µg/m³</span>
                </div>
                <div className="p-2 bg-[#F9FBFA] rounded border border-[#E8EEEA]">
                  <span className="text-[#697871] block text-[10px]">Ozone (O₃)</span>
                  <span className="font-mono font-semibold text-[#172923]">{weather.airQuality.ozone.toFixed(1)} µg/m³</span>
                </div>
                <div className="p-2 bg-[#F9FBFA] rounded border border-[#E8EEEA]">
                  <span className="text-[#697871] block text-[10px]">Nitrogen Dioxide (NO₂)</span>
                  <span className="font-mono font-semibold text-[#172923]">{weather.airQuality.nitrogenDioxide.toFixed(1)} µg/m³</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-xs text-[#697871] text-center">
              Air quality sensors not reporting for this coordinate grid.
            </div>
          )}

          <div className="text-[10px] text-[#697871] pt-1">
            Standard: CPCB &amp; US EPA AQI reference scale.
          </div>
        </div>

        {/* 7-Day Outlook */}
        <div className="lg:col-span-2 bg-white border border-[#DDE5DE] rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172923]">
              {language === 'ta' ? '7 நாள் மாதிரி முன்கணிப்பு' : '7-Day Synoptic Forecast Matrix'}
            </h3>
            <span className="text-[11px] text-[#697871] font-mono">ECMWF / DWD Multimodel</span>
          </div>

          <div className="divide-y divide-[#F0F4F1] overflow-x-auto">
            {weather.dailyForecast.slice(0, 7).map((day, idx) => {
              const dayDate = new Date(day.date);
              const dayName = idx === 0 ? (language === 'ta' ? 'இன்று' : 'Today') : dayDate.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });
              const dateStr = dayDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={day.date} className="py-2.5 flex items-center justify-between text-xs gap-4">
                  <div className="w-24 shrink-0">
                    <span className="font-semibold text-[#172923] block">{dayName}</span>
                    <span className="text-[10px] text-[#697871]">{dateStr}</span>
                  </div>

                  <div className="flex-1 flex items-center justify-between gap-4 max-w-sm">
                    <div className="text-[11px] text-[#697871] flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-[#A96612]" />
                      <span>UV Max {day.uvIndexMax.toFixed(0)}</span>
                    </div>

                    <div className="text-[11px] text-[#697871] flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5 text-[#2D8173]" />
                      <span>{day.precipitationSum.toFixed(1)} mm</span>
                    </div>

                    <div className="font-mono text-right shrink-0">
                      <span className="font-bold text-[#172923]">{day.tempMax.toFixed(0)}°</span>
                      <span className="text-[#697871] ml-1.5 text-[11px]">/ {day.tempMin.toFixed(0)}°</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Source Provenance Card */}
      <div className="bg-[#F5F7F3] border border-[#DDE5DE] rounded-xl p-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#123D32]">Source &amp; Provenance Metadata</span>
          <a
            href={weather.source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#2D8173] hover:underline flex items-center gap-1 text-[11px]"
          >
            <span>{weather.source.name}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="text-[#697871] text-[11px] leading-relaxed">
          {weather.source.attribution}. Weather models: {weather.source.model}. Processed via ClimateLens Evidence Normalizer with deterministic canonicalization.
        </p>
      </div>
    </div>
  );
};
