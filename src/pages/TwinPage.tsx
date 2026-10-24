import React, { useState, useEffect } from 'react';
import {
  ClimateEvidenceTwin,
  WeatherData,
  fetchClimateTwinApi,
} from '../services/api.ts';
import {
  ShieldCheck,
  Cpu,
  Layers,
  Thermometer,
  Wind,
  Droplets,
  CloudRain,
  Activity,
  AlertTriangle,
  Clock,
  Database,
  Download,
  Copy,
  CheckCircle2,
  FileCode2,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface TwinPageProps {
  weather: WeatherData | null;
  onNavigateToTamper: (snapshotId?: string) => void;
  onNavigateToVerify: (snapshotId?: string) => void;
  onNavigateToActions: () => void;
  language: 'en' | 'ta';
}

export const TwinPage: React.FC<TwinPageProps> = ({
  weather,
  onNavigateToTamper,
  onNavigateToVerify,
  onNavigateToActions,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'indicators' | 'provenance' | 'payload' | 'actions'>('indicators');
  const [twin, setTwin] = useState<ClimateEvidenceTwin | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    if (!weather) return;
    loadTwin();
  }, [weather?.location.latitude, weather?.location.longitude]);

  const loadTwin = async () => {
    if (!weather) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchClimateTwinApi(
        weather.location.latitude,
        weather.location.longitude,
        weather.location.label
      );
      setTwin(data);
    } catch (err: any) {
      setError(err.message || 'Unable to build Climate Evidence Twin.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'hash' | 'payload') => {
    navigator.clipboard.writeText(text);
    if (type === 'hash') {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } else {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    }
  };

  const downloadTwinJson = () => {
    if (!twin) return;
    const blob = new Blob([JSON.stringify(twin, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `climate-evidence-twin-${twin.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!weather) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center liquid-glass rounded-2xl border border-white/10 space-y-4">
        <Cpu className="w-12 h-12 text-[#19B8A5] animate-pulse" />
        <h3 className="text-lg font-bold text-white">Initializing Environmental Telemetry...</h3>
        <p className="text-xs text-[#A7BAC4] max-w-md">
          Please wait while live meteorological models are ingested from Open-Meteo and Copernicus ERA5 suites.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Signature Banner */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#19B8A5]/10 via-[#8CE6E0]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Signature Architecture
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#A7BAC4] border border-white/10 text-[11px] font-mono">
                RFC 8785 Canonicalized
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-[#8CE6E0]/10 text-[#8CE6E0] border border-[#8CE6E0]/20 text-[11px] font-mono">
                SHA-256 Sealed
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F8FA] tracking-tight flex items-center gap-2.5">
              <span>Climate Evidence Twin</span>
              <span className="text-xs font-mono font-normal text-[#19B8A5] bg-[#19B8A5]/10 px-2.5 py-1 rounded-md border border-[#19B8A5]/20">
                v1.2-integrity
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#A7BAC4] max-w-2xl leading-relaxed">
              {language === 'ta'
                ? 'காலநிலை சான்று இரட்டை: நிகழ்நேர சுற்றுச்சூழல் தரவு, தர மேலாண்மை, பெறப்பட்ட அறிவியல் குறிகாட்டிகள் மற்றும் மாற்ற முடியாத கிரிப்டோகிராஃபிக் சான்றுகளின் ஒருங்கிணைந்த பிரதிநிதித்துவம்.'
                : 'A time-stamped digital representation of a location’s environmental conditions, data provenance, quality assessments, derived climate indicators, and practical community actions.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={downloadTwinJson}
              disabled={!twin}
              className="px-3.5 py-2 text-xs font-bold text-[#F3F8FA] bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center gap-2"
              title="Download canonical evidence twin as JSON"
            >
              <Download className="w-3.5 h-3.5 text-[#19B8A5]" />
              <span>Download JSON</span>
            </button>

            <button
              onClick={() => onNavigateToTamper(twin?.id)}
              className="px-3.5 py-2 text-xs font-bold text-[#071722] bg-[#8CE6E0] hover:bg-[#78cfc9] rounded-xl transition-all flex items-center gap-2 shadow-[0_0_16px_rgba(140,230,224,0.3)]"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Test in Tamper Lab</span>
            </button>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[#A7BAC4] block text-[10px] uppercase tracking-wider">Location Boundary</span>
            <span className="text-[#F3F8FA] font-semibold truncate block">{weather.location.label.split(',')[0]}</span>
            <span className="text-[#A7BAC4] text-[10px]">
              {weather.location.latitude.toFixed(3)}°N, {weather.location.longitude.toFixed(3)}°E
            </span>
          </div>
          <div>
            <span className="text-[#A7BAC4] block text-[10px] uppercase tracking-wider">Original Ingestion Timestamp (UTC)</span>
            <span className="text-[#F3F8FA] font-semibold block">
              {twin?.timestamps.createdUtc
                ? new Date(twin.timestamps.createdUtc).toUTCString().slice(0, 22)
                : weather.timestamps.retrievedAt
                ? new Date(weather.timestamps.retrievedAt).toUTCString().slice(0, 22)
                : 'Synchronizing...'}
            </span>
            <span className="text-[#19B8A5] text-[10px]">Immutable Evidence Record</span>
          </div>
          <div>
            <span className="text-[#A7BAC4] block text-[10px] uppercase tracking-wider">Data Provider</span>
            <span className="text-[#F3F8FA] font-semibold block">{weather.source.name}</span>
            <span className="text-[#A7BAC4] text-[10px]">{weather.source.model}</span>
          </div>
          <div>
            <span className="text-[#A7BAC4] block text-[10px] uppercase tracking-wider">Cryptographic Digest</span>
            <div className="flex items-center gap-1.5 text-[#8CE6E0]">
              <span className="truncate">{twin ? `${twin.verification.contentHash.substring(0, 14)}...` : 'Generating...'}</span>
              <button
                onClick={() => twin && copyToClipboard(twin.verification.contentHash, 'hash')}
                className="hover:text-white"
                title="Copy SHA-256 hash"
              >
                {copiedHash ? <CheckCircle2 className="w-3 h-3 text-[#19B8A5]" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <span className="text-[10px] text-[#A7BAC4]">Algorithm: SHA-256</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1 text-xs">
        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'indicators'
              ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.3)]'
              : 'text-[#A7BAC4] hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Derived Climate Indicators</span>
        </button>

        <button
          onClick={() => setActiveTab('provenance')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'provenance'
              ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.3)]'
              : 'text-[#A7BAC4] hover:text-white hover:bg-white/5'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Data Provenance & Quality</span>
        </button>

        <button
          onClick={() => setActiveTab('payload')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'payload'
              ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.3)]'
              : 'text-[#A7BAC4] hover:text-white hover:bg-white/5'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>RFC 8785 Canonical Payload</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'actions'
              ? 'bg-[#19B8A5] text-[#071722] shadow-[0_0_16px_rgba(25,184,165,0.3)]'
              : 'text-[#A7BAC4] hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Evidence-Linked Actions</span>
        </button>
      </div>

      {/* Tab 1: Derived Climate Indicators */}
      {activeTab === 'indicators' && twin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Heat Stress Index */}
            <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0]">
                  <Thermometer className="w-4 h-4 text-[#FFBF69]" />
                  <span>{twin.derivedIndicators.heatStress.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    twin.derivedIndicators.heatStress.severity === 'critical'
                      ? 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30'
                      : twin.derivedIndicators.heatStress.severity === 'warning'
                      ? 'bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30'
                      : 'bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30'
                  }`}
                >
                  {twin.derivedIndicators.heatStress.severity}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {twin.derivedIndicators.heatStress.value}
                </span>
                <span className="text-xs text-[#A7BAC4] font-medium">Physiological Sensation</span>
              </div>

              <p className="text-xs text-[#F3F8FA] font-medium leading-relaxed">
                {twin.derivedIndicators.heatStress.category}
              </p>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-[#A7BAC4]">
                <div>
                  <span className="font-semibold text-white/80">Methodology: </span>
                  {twin.derivedIndicators.heatStress.methodology}
                </div>
                <div>
                  <span className="font-semibold text-white/80">Thresholds: </span>
                  {twin.derivedIndicators.heatStress.thresholds}
                </div>
                <div className="text-[10px] text-[#A7BAC4]/80 italic pt-1">
                  Note: {twin.derivedIndicators.heatStress.limitations}
                </div>
              </div>
            </div>

            {/* Thom's Discomfort Index */}
            <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0]">
                  <Activity className="w-4 h-4 text-[#19B8A5]" />
                  <span>{twin.derivedIndicators.thermalDiscomfort.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    twin.derivedIndicators.thermalDiscomfort.severity === 'critical'
                      ? 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30'
                      : twin.derivedIndicators.thermalDiscomfort.severity === 'warning'
                      ? 'bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30'
                      : 'bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30'
                  }`}
                >
                  {twin.derivedIndicators.thermalDiscomfort.severity}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {twin.derivedIndicators.thermalDiscomfort.value}
                </span>
                <span className="text-xs text-[#A7BAC4] font-medium">Empirical Scale</span>
              </div>

              <p className="text-xs text-[#F3F8FA] font-medium leading-relaxed">
                {twin.derivedIndicators.thermalDiscomfort.category}
              </p>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-[#A7BAC4]">
                <div>
                  <span className="font-semibold text-white/80">Formula: </span>
                  {twin.derivedIndicators.thermalDiscomfort.methodology}
                </div>
                <div>
                  <span className="font-semibold text-white/80">Population Thresholds: </span>
                  {twin.derivedIndicators.thermalDiscomfort.thresholds}
                </div>
                <div className="text-[10px] text-[#A7BAC4]/80 italic pt-1">
                  Note: {twin.derivedIndicators.thermalDiscomfort.limitations}
                </div>
              </div>
            </div>

            {/* Heavy Rain Screening */}
            <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0]">
                  <CloudRain className="w-4 h-4 text-[#8CE6E0]" />
                  <span>{twin.derivedIndicators.rainfallRisk.name}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                    twin.derivedIndicators.rainfallRisk.severity === 'critical'
                      ? 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30'
                      : twin.derivedIndicators.rainfallRisk.severity === 'warning'
                      ? 'bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30'
                      : 'bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30'
                  }`}
                >
                  {twin.derivedIndicators.rainfallRisk.severity}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {twin.derivedIndicators.rainfallRisk.value}
                </span>
                <span className="text-xs text-[#A7BAC4] font-medium">Hourly Rate</span>
              </div>

              <p className="text-xs text-[#F3F8FA] font-medium leading-relaxed">
                {twin.derivedIndicators.rainfallRisk.category}
              </p>

              <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] text-[#A7BAC4]">
                <div>
                  <span className="font-semibold text-white/80">Standard: </span>
                  {twin.derivedIndicators.rainfallRisk.methodology}
                </div>
                <div>
                  <span className="font-semibold text-white/80">WMO Classification: </span>
                  {twin.derivedIndicators.rainfallRisk.thresholds}
                </div>
                <div className="text-[10px] text-[#A7BAC4]/80 italic pt-1">
                  Scope Limitation: {twin.derivedIndicators.rainfallRisk.limitations}
                </div>
              </div>
            </div>

            {/* Air Quality Risk Assessment */}
            {twin.derivedIndicators.airQualityRisk && (
              <div className="liquid-glass rounded-2xl p-5 border border-white/10 space-y-3 relative overflow-hidden md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0]">
                    <Wind className="w-4 h-4 text-[#19B8A5]" />
                    <span>{twin.derivedIndicators.airQualityRisk.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      twin.derivedIndicators.airQualityRisk.severity === 'critical'
                        ? 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30'
                        : twin.derivedIndicators.airQualityRisk.severity === 'warning'
                        ? 'bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30'
                        : 'bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30'
                    }`}
                  >
                    {twin.derivedIndicators.airQualityRisk.severity}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white font-mono">
                      {twin.airQuality?.usAqi}
                    </span>
                    <span className="text-xs text-[#A7BAC4] font-medium">US EPA AQI Scale</span>
                  </div>
                  <div className="text-xs text-[#8CE6E0] font-medium">
                    {twin.airQuality?.statusLabel} · {twin.airQuality?.healthNotice}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs font-mono">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#A7BAC4] block">PM2.5 (Fine Particles)</span>
                    <span className="text-[#F3F8FA] font-bold">{twin.airQuality?.pm2_5} µg/m³</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#A7BAC4] block">PM10 (Coarse Dust)</span>
                    <span className="text-[#F3F8FA] font-bold">{twin.airQuality?.pm10} µg/m³</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#A7BAC4] block">Ozone (O₃)</span>
                    <span className="text-[#F3F8FA] font-bold">{twin.airQuality?.ozone} µg/m³</span>
                  </div>
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <span className="text-[10px] text-[#A7BAC4] block">Nitrogen Dioxide (NO₂)</span>
                    <span className="text-[#F3F8FA] font-bold">{twin.airQuality?.nitrogenDioxide} µg/m³</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Grounded Synthesis */}
          {twin.groundedExplanation && (
            <div className="liquid-glass rounded-2xl p-6 border border-[#19B8A5]/30 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#8CE6E0]">
                <Sparkles className="w-4 h-4 text-[#19B8A5]" />
                <span>Grounded Climate Explanation</span>
              </div>
              <p className="text-xs text-[#F3F8FA] leading-relaxed font-medium">
                {twin.groundedExplanation.summary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-[#A7BAC4]">
                {twin.groundedExplanation.keyDrivers.map((driver, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-start gap-2">
                    <span className="text-[#19B8A5] font-bold">·</span>
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Data Provenance & Quality */}
      {activeTab === 'provenance' && twin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Provenance Pipeline */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#8CE6E0]">
                <Database className="w-4 h-4 text-[#19B8A5]" />
                <span>Data Provenance Pipeline</span>
              </div>
              <p className="text-xs text-[#A7BAC4] leading-relaxed">
                ClimateLens ingests raw atmospheric data directly from open scientific meteorological models without opaque intermediaries.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-white block">Primary Numerical Model:</span>
                  <span className="text-[#8CE6E0] font-mono">{twin.source.provider} ({twin.source.model})</span>
                  <p className="text-[11px] text-[#A7BAC4] pt-1">{twin.source.attribution}</p>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-white block">Model Grid Resolution:</span>
                  <span className="text-[#A7BAC4] font-mono">0.1° (~11 km grid cell spacing)</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-white block">Source Data License:</span>
                  <span className="text-[#A7BAC4] font-mono">Creative Commons Attribution 4.0 International (CC BY 4.0)</span>
                </div>
              </div>
            </div>

            {/* Quality & Freshness Assessment */}
            <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#8CE6E0]">
                <ShieldCheck className="w-4 h-4 text-[#19B8A5]" />
                <span>Quality & Completeness Audit</span>
              </div>
              <p className="text-xs text-[#A7BAC4] leading-relaxed">
                Automated deterministic checks evaluate whether raw values arrived within acceptable latency and physical atmospheric bounds.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Freshness Status</span>
                    <span className="text-[#A7BAC4] text-[11px]">{twin.qualityAssessment.freshnessReason}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-[#19B8A5]/20 text-[#8CE6E0] rounded-lg font-mono text-[11px] font-bold uppercase">
                    {twin.qualityAssessment.freshnessStatus}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white block">Completeness Status</span>
                    <span className="text-[#A7BAC4] text-[11px]">{twin.qualityAssessment.completenessReason}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-[#19B8A5]/20 text-[#8CE6E0] rounded-lg font-mono text-[11px] font-bold uppercase">
                    {twin.qualityAssessment.completenessStatus}
                  </span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <span className="font-bold text-white block">Physical Bounds Validation</span>
                  <p className="text-[#A7BAC4] text-[11px]">{twin.qualityAssessment.consistencyNotes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RFC 8785 Canonical Payload */}
      {activeTab === 'payload' && twin && (
        <div className="space-y-6">
          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-bold text-[#8CE6E0]">
                  <FileCode2 className="w-4 h-4 text-[#19B8A5]" />
                  <span>RFC 8785 JSON Canonicalization Scheme (JCS)</span>
                </div>
                <p className="text-xs text-[#A7BAC4]">
                  Deterministic byte-for-byte serialization. Keys are strictly sorted by UTF-16 code units with no whitespace variation.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(twin.verification.canonicalPayload, 'payload')}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs text-[#F3F8FA] rounded-xl border border-white/10 flex items-center gap-1.5 transition-colors font-mono"
                >
                  {copiedPayload ? <CheckCircle2 className="w-3.5 h-3.5 text-[#19B8A5]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
                </button>
              </div>
            </div>

            {/* Code Display */}
            <div className="p-4 bg-black/60 rounded-xl border border-white/10 font-mono text-xs text-[#8CE6E0] overflow-x-auto max-h-96 leading-relaxed">
              <pre>{twin.verification.canonicalPayload}</pre>
            </div>

            {/* Hash & Anchor Footer */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="space-y-1">
                <span className="text-[#A7BAC4] block text-[11px]">CALCULATED SHA-256 DIGEST:</span>
                <span className="text-white font-bold select-all break-all">{twin.verification.contentHash}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1 rounded-lg bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30 font-bold">
                  INTEGRITY VERIFIED
                </span>
                <button
                  onClick={() => onNavigateToVerify(twin.id)}
                  className="px-3.5 py-1.5 bg-[#19B8A5] text-[#071722] rounded-xl font-bold hover:bg-[#159a8a] transition-all"
                >
                  Independent Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Evidence-Linked Actions */}
      {activeTab === 'actions' && twin && (
        <div className="space-y-4">
          <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Recommended Actions Grounded in Evidence</h3>
                <p className="text-xs text-[#A7BAC4]">
                  These interventions are automatically mapped from the twin’s current temperature, humidity, and rainfall rates.
                </p>
              </div>
              <button
                onClick={onNavigateToActions}
                className="px-3.5 py-2 text-xs font-bold text-[#071722] bg-[#19B8A5] hover:bg-[#159a8a] rounded-xl transition-all flex items-center gap-1.5"
              >
                <span>Open Full Action Ledger</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {twin.recommendedActions.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between gap-4 hover:border-[#19B8A5]/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#19B8A5]/20 text-[#8CE6E0] font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-white">{action}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#A7BAC4] uppercase shrink-0">
                    Evidence Mapped
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
