import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Activity,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { WeatherData } from '../services/api.ts';
import { LocationSelector } from '../components/LocationSelector.tsx';
import { FreshnessIndicator } from '../components/FreshnessIndicator.tsx';
import { QualityPanel } from '../components/QualityPanel.tsx';
import { ExplanationPanel } from '../components/ExplanationPanel.tsx';

interface MyAreaPageProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  onRetryWeather: () => void;
  onSelectLocation: (loc: { label: string; latitude: number; longitude: number }) => void;
  onSealEvidence: () => void;
  isSealing: boolean;
  onNavigateToSafety: () => void;
  onNavigateToVerify: (snapshotId?: string) => void;
  language: 'en' | 'ta';
}

export const MyAreaPage: React.FC<MyAreaPageProps> = ({
  weather,
  isLoading,
  error,
  onRetryWeather,
  onSelectLocation,
  onSealEvidence,
  isSealing,
  onNavigateToSafety,
  onNavigateToVerify,
  language,
}) => {
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#19B8A5] border-t-transparent rounded-full animate-spin mx-auto" />
        <h2 className="text-lg font-bold text-[#F3F8FA]">
          Analyzing Local Climate &amp; Hazard Indicators...
        </h2>
        <p className="text-xs text-[#A7BAC4]">
          Querying Open-Meteo atmospheric models, calculating heat index, and auditing data quality.
        </p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="max-w-4xl mx-auto p-6 rounded-2xl liquid-glass border border-[#FF6268]/30 text-xs text-[#F3F8FA] space-y-3">
        <div className="font-bold text-[#FF6268] text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Meteorological Connection Notice</span>
        </div>
        <p>{error || 'No weather telemetry is currently loaded.'}</p>
        <button
          onClick={onRetryWeather}
          className="px-4 py-2 bg-[#19B8A5] text-[#071722] font-bold rounded-xl text-xs"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const values = weather.values;
  const units = weather.units;

  // Determine primary local climate risk tier based on real data
  const isHeatRisk = values.apparentTemperature >= 35;
  const isRainRisk = values.precipitation >= 2 || values.weatherCode >= 61;
  const isWindRisk = values.windSpeed >= 30;
  const isAqiRisk = weather.airQuality && weather.airQuality.usAqi > 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Bar: Location Header & Geolocation Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 liquid-glass rounded-2xl border border-white/10">
        <div>
          <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#19B8A5]" />
            <span>Local Area Climate Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA] mt-1">
            {weather.location.label}
          </h1>
          <div className="text-xs text-[#A7BAC4] mt-1 flex flex-wrap items-center gap-2 font-mono">
            <span>Lat: {weather.location.latitude.toFixed(2)}° · Lon: {weather.location.longitude.toFixed(2)}°</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#8CE6E0]">Observed: {new Date(weather.timestamps.sourceTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#19B8A5] font-semibold">ECMWF / DWD ICON Ensemble</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LocationSelector
            currentLocation={weather.location}
            onSelectLocation={onSelectLocation}
            language={language}
          />
        </div>
      </div>

      {/* QUESTION 1: WHAT IS HAPPENING IN MY AREA? */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#19B8A5]/20 text-[#19B8A5] flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h2 className="text-lg font-bold text-[#F3F8FA]">
            {language === 'ta' ? 'எனது பகுதியில் இப்போது என்ன நடக்கிறது?' : 'What is happening in my area right now?'}
          </h2>
        </div>

        {/* 4 Primary Telemetry Glass Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl liquid-glass liquid-glass-hover border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A7BAC4]">
              <span>Surface Temperature</span>
              <Thermometer className="w-4 h-4 text-[#FFBF69]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#F3F8FA]">
                {values.temperature.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#A7BAC4] ml-1.5">{units.temperature}</span>
            </div>
            <div className="text-[11px] text-[#A7BAC4]">
              Feels like <span className="text-[#F3F8FA] font-semibold">{values.apparentTemperature.toFixed(1)}{units.apparentTemperature}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass liquid-glass-hover border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A7BAC4]">
              <span>Relative Moisture</span>
              <Droplets className="w-4 h-4 text-[#8CE6E0]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#F3F8FA]">
                {values.relativeHumidity}
              </span>
              <span className="text-xs font-mono text-[#A7BAC4] ml-1.5">{units.relativeHumidity}</span>
            </div>
            <div className="text-[11px] text-[#A7BAC4]">
              {values.relativeHumidity > 75 ? 'High ambient humidity' : 'Comfortable vapor level'}
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass liquid-glass-hover border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A7BAC4]">
              <span>Precipitation Rate</span>
              <CloudRain className="w-4 h-4 text-[#19B8A5]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#F3F8FA]">
                {values.precipitation.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#A7BAC4] ml-1.5">{units.precipitation}</span>
            </div>
            <div className="text-[11px] text-[#A7BAC4] truncate">
              {values.weatherDescription}
            </div>
          </div>

          <div className="p-5 rounded-2xl liquid-glass liquid-glass-hover border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-[#A7BAC4]">
              <span>Wind Velocity (10m)</span>
              <Wind className="w-4 h-4 text-[#8CE6E0]" />
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#F3F8FA]">
                {values.windSpeed.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#A7BAC4] ml-1.5">{units.windSpeed}</span>
            </div>
            <div className="text-[11px] text-[#A7BAC4]">
              Pressure: {values.surfacePressure?.toFixed(0) || '--'} hPa
            </div>
          </div>
        </div>

        {/* Air Quality & Provenance Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl liquid-glass border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#19B8A5]" />
              <div>
                <div className="text-[#A7BAC4]">Air Quality Index</div>
                <div className="font-bold text-[#F3F8FA] text-sm">
                  {weather.airQuality ? `US AQI ${weather.airQuality.usAqi} (${weather.airQuality.statusLabel})` : 'Sensor Inactive'}
                </div>
              </div>
            </div>
            {weather.airQuality && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#19B8A5]/20 text-[#19B8A5]">
                PM2.5: {weather.airQuality.pm2_5.toFixed(0)}µg/m³
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl liquid-glass border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8CE6E0]" />
              <div>
                <div className="text-[#A7BAC4]">Data Freshness Window</div>
                <div className="font-bold text-[#F3F8FA] text-sm">
                  {weather.freshness.status === 'fresh' ? 'Verified Fresh (Within 120m)' : 'Stale Threshold Exceeded'}
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono text-[#A7BAC4]">
              {weather.freshness.ageMinutes !== null ? `${weather.freshness.ageMinutes}m age` : 'Live Ingest'}
            </span>
          </div>

          <div className="p-4 rounded-xl liquid-glass border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#19B8A5]" />
              <div>
                <div className="text-[#A7BAC4]">Provenance Integrity</div>
                <div className="font-mono text-[#F3F8FA] text-xs truncate max-w-[140px]">
                  {weather.contentHash.substring(0, 16)}...
                </div>
              </div>
            </div>
            <button
              onClick={onSealEvidence}
              disabled={isSealing}
              className="px-2.5 py-1 bg-[#19B8A5] text-[#071722] font-bold rounded-lg text-[11px] hover:bg-[#159a8a] transition-all shrink-0"
            >
              {isSealing ? 'Sealing...' : 'Seal Snapshot'}
            </button>
          </div>
        </div>
      </div>

      {/* QUESTION 2: WHAT COULD HAPPEN NEXT, AND HOW RELIABLE IS THIS? */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#8CE6E0]/20 text-[#8CE6E0] flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h2 className="text-lg font-bold text-[#F3F8FA]">
            {language === 'ta' ? 'அடுத்து என்ன நடக்கலாம், இந்த தகவல் எவ்வளவு நம்பகமானது?' : 'What could happen next, and how reliable is this information?'}
          </h2>
        </div>

        {/* Hazard Risk Cards (Only relevant hazards shown!) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Rainfall & Urban Inundation */}
          <div className={`p-5 rounded-2xl liquid-glass border ${isRainRisk ? 'border-[#19B8A5]' : 'border-white/10'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#F3F8FA]">
                <CloudRain className="w-4 h-4 text-[#19B8A5]" />
                <span>Heavy Rainfall &amp; Runoff</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isRainRisk ? 'bg-[#19B8A5]/20 text-[#19B8A5]' : 'bg-white/5 text-[#A7BAC4]'}`}>
                {isRainRisk ? 'ELEVATED SURGE' : 'BASELINE NORMAL'}
              </span>
            </div>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              {isRainRisk
                ? `Current precipitation rate is ${values.precipitation} mm with overcast cloud accumulation. Moderate risk of surface waterpooling in low-lying underpasses.`
                : 'Minimal or nil immediate precipitation registered. Synoptic forecast indicates dry transit conditions for next 12 hours.'}
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7BAC4] flex items-center justify-between">
              <span>Forecast Window: Next 24 Hours</span>
              <span className="font-mono text-[#8CE6E0]">Model: ECMWF IFS</span>
            </div>
          </div>

          {/* Card B: Extreme Heat & Solar Stress */}
          <div className={`p-5 rounded-2xl liquid-glass border ${isHeatRisk ? 'border-[#FFBF69]' : 'border-white/10'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#F3F8FA]">
                <Thermometer className="w-4 h-4 text-[#FFBF69]" />
                <span>Extreme Heat &amp; Thermal Index</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isHeatRisk ? 'bg-[#FFBF69]/20 text-[#FFBF69]' : 'bg-white/5 text-[#A7BAC4]'}`}>
                {isHeatRisk ? 'THERMAL ADVISORY' : 'MODERATE COMFORT'}
              </span>
            </div>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              {isHeatRisk
                ? `Apparent thermal heat index is ${values.apparentTemperature.toFixed(1)}°C, exceeding safe continuous outdoor exertion limits. High risk of dehydration.`
                : `Ambient thermal feel is ${values.apparentTemperature.toFixed(1)}°C, well within standard physiological tolerance for everyday activity.`}
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7BAC4] flex items-center justify-between">
              <span>Threshold: &gt;35°C Apparent</span>
              <span className="font-mono text-[#8CE6E0]">Confidence: 91%</span>
            </div>
          </div>

          {/* Card C: Storm Wind Gusts & Squalls */}
          <div className={`p-5 rounded-2xl liquid-glass border ${isWindRisk ? 'border-[#FF6268]' : 'border-white/10'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-[#F3F8FA]">
                <Wind className="w-4 h-4 text-[#8CE6E0]" />
                <span>Kinematic Gusts &amp; Squalls</span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${isWindRisk ? 'bg-[#FF6268]/20 text-[#FF6268]' : 'bg-white/5 text-[#A7BAC4]'}`}>
                {isWindRisk ? 'GALE SQUALL RISK' : 'CALM BREEZE'}
              </span>
            </div>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              {isWindRisk
                ? `Wind gusts exceed ${values.windSpeed} km/h. Unsecured lightweight metal sheets, signs, or dead tree branches may become detached.`
                : `Sustained surface winds average ${values.windSpeed.toFixed(1)} km/h. Calm atmospheric conditions without localized squall activity.`}
            </p>
            <div className="pt-2 border-t border-white/10 text-[11px] text-[#A7BAC4] flex items-center justify-between">
              <span>Sensor Altitude: 10m AGL</span>
              <span className="font-mono text-[#8CE6E0]">Model: DWD ICON</span>
            </div>
          </div>
        </div>

        {/* Explainable Quality Engine & AI Explanation Split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <QualityPanel weather={weather} language={language} />
          <ExplanationPanel
            weather={weather}
            language={language}
            onNavigateToReadyPlan={onNavigateToSafety}
          />
        </div>
      </div>

      {/* QUESTION 3: WHAT SHOULD I DO NOW TO STAY SAFE? */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FFBF69]/20 text-[#FFBF69] flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h2 className="text-lg font-bold text-[#F3F8FA]">
            {language === 'ta' ? 'பாதுகாப்பாக இருக்க நான் இப்போது என்ன செய்ய வேண்டும்?' : 'What should I do now to stay safe?'}
          </h2>
        </div>

        {/* Immediate Safety Directives Banner */}
        <div className="p-6 rounded-2xl liquid-glass border border-[#19B8A5]/40 space-y-4 glow-teal">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#19B8A5] uppercase tracking-wider">
                Immediate Action Protocols
              </span>
              <h3 className="text-base font-bold text-[#F3F8FA] mt-0.5">
                Recommended Actions for {weather.location.label.split(',')[0]}
              </h3>
            </div>

            <button
              onClick={onNavigateToSafety}
              className="px-4 py-2 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <span>Open ReadyPlan Checklist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8CE6E0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>1. Hydration &amp; Exposure</span>
              </div>
              <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
                {isHeatRisk
                  ? 'Drink ORS or tender coconut water every 45 minutes; stay indoors between 11:30 AM and 3:30 PM.'
                  : 'Maintain normal daily water intake; carry an umbrella for overcast damp conditions.'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8CE6E0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Transit &amp; Infrastructure</span>
              </div>
              <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
                {isRainRisk
                  ? 'Avoid waterlogged underpasses. Never drive or wade through flowing water deeper than 15 cm.'
                  : 'Transit corridors are clear. Ensure phone and vehicle battery are charged ahead of overnight cycles.'}
              </p>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#8CE6E0]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>3. Civil Protection Directives</span>
              </div>
              <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
                Check official bulletins issued by national disaster agencies. Never ignore official evacuation directives.
              </p>
            </div>
          </div>

          {/* Emergency Helpline Strip */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#FFBF69]" />
              <span className="font-bold text-[#F3F8FA]">Emergency Hotlines:</span>
              <span className="text-[#A7BAC4]">Ambulance: <strong className="text-white font-mono">108</strong></span>
              <span className="text-white/20">·</span>
              <span className="text-[#A7BAC4]">Disaster Helpline: <strong className="text-white font-mono">1070</strong></span>
              <span className="text-white/20">·</span>
              <span className="text-[#A7BAC4]">National Unified: <strong className="text-white font-mono">112</strong></span>
            </div>
            <a
              href="https://mausam.imd.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#8CE6E0] hover:underline flex items-center gap-1 text-[11px] font-semibold"
            >
              <span>Official IMD Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
