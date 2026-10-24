import React, { useState } from 'react';
import {
  ShieldCheck,
  Database,
  Radio,
  Clock,
  ArrowRight,
  ExternalLink,
  Cpu,
  Layers,
  MapPin,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Flame,
  CloudRain,
  Eye,
  Globe2,
} from 'lucide-react';
import { WeatherData, EvidenceSnapshot } from '../services/api.ts';
import { Globe3D } from '../components/Globe3D.tsx';
import { LocationSelector } from '../components/LocationSelector.tsx';

interface OverviewPageProps {
  weather: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  onSelectLocation: (loc: { label: string; latitude: number; longitude: number }) => void;
  onSealEvidence: () => void;
  isSealing: boolean;
  evidenceSnapshots: EvidenceSnapshot[];
  onNavigate: (tab: string, snapshotId?: string) => void;
  language: 'en' | 'ta';
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  weather,
  isLoading,
  error,
  onSelectLocation,
  onSealEvidence,
  isSealing,
  evidenceSnapshots,
  onNavigate,
  language,
}) => {
  const [viewMode, setViewMode] = useState<'3d_globe' | 'artwork'>('3d_globe');

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-12">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative rounded-3xl p-6 sm:p-10 md:p-12 liquid-glass border border-white/10 overflow-hidden shadow-2xl">
        {/* Ambient background glow orb */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#19B8A5]/15 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Vision, Headline & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#19B8A5]/10 border border-[#19B8A5]/30 text-xs font-mono font-semibold text-[#8CE6E0]">
              <span className="w-2 h-2 rounded-full bg-[#19B8A5] animate-pulse" />
              <span>CLIMATE INTELLIGENCE • COMMUNITY RESILIENCE</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#F3F8FA] leading-[1.15]">
              See the Risk. <br className="hidden sm:inline" />
              Understand the Climate. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#19B8A5] via-[#8CE6E0] to-white">
                Act Before It Escalates.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#A7BAC4] max-w-xl leading-relaxed">
              Climate Lens helps you understand weather conditions and potential climate-related risks in your area, verify available information, and discover practical steps to prepare.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('myarea')}
                className="px-6 py-3.5 bg-[#19B8A5] hover:bg-[#159a8a] text-[#071722] font-bold text-sm rounded-xl transition-all shadow-[0_0_24px_rgba(25,184,165,0.4)] flex items-center gap-2.5 hover:scale-[1.02]"
              >
                <span>Check My Area</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('map')}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-[#F3F8FA] font-semibold text-sm rounded-xl border border-white/10 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-[#8CE6E0]" />
                <span>Explore Climate Map</span>
              </button>
            </div>

            {/* Quick Location Preview Box */}
            {weather && (
              <div className="pt-4 flex flex-wrap items-center gap-4 text-xs text-[#A7BAC4] border-t border-white/10 font-mono">
                <div className="flex items-center gap-1.5 text-[#F3F8FA]">
                  <MapPin className="w-3.5 h-3.5 text-[#19B8A5]" />
                  <span className="font-semibold">{weather.location.label.split(',')[0]}</span>
                </div>
                <span>·</span>
                <span>{weather.values.temperature.toFixed(1)}°C ({weather.values.weatherDescription})</span>
                <span>·</span>
                <span className="text-[#8CE6E0]">
                  {weather.freshness.status === 'fresh' ? 'Verified Fresh Ingestion' : 'Recent Cycle'}
                </span>
              </div>
            )}
          </div>

          {/* Right Column: 3D Globe / Visual Artwork Toggle (5 cols) */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* View Switcher toggle */}
            <div className="absolute top-0 right-0 z-20 flex items-center p-1 rounded-lg bg-black/40 border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('3d_globe')}
                className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                  viewMode === '3d_globe'
                    ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs'
                    : 'text-[#A7BAC4] hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>3D Earth</span>
              </button>
              <button
                onClick={() => setViewMode('artwork')}
                className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
                  viewMode === 'artwork'
                    ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs'
                    : 'text-[#A7BAC4] hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Lens Metaphor</span>
              </button>
            </div>

            {viewMode === '3d_globe' ? (
              <div className="w-full">
                <Globe3D
                  selectedLocation={
                    weather ? weather.location : { label: 'Chennai', latitude: 13.0827, longitude: 80.2707 }
                  }
                  onSelectCity={(city) => {
                    onSelectLocation(city);
                  }}
                />
              </div>
            ) : (
              <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 group shadow-2xl mt-8">
                <img
                  src="/assets/aistudio/image_910cd210.png"
                  alt="Climate Lens Holographic Earth & Scientific Magnifier"
                  className="w-full h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#071722] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl liquid-glass border border-white/10 text-xs text-[#F3F8FA]">
                  <span className="font-bold text-[#8CE6E0] block">The Climate Lens Concept</span>
                  <p className="text-[11px] text-[#A7BAC4] mt-0.5">
                    Magnifying raw planetary observation into verified, actionable localized evidence.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE THREE SIMPLE STEPS (UNDERSTAND, ASSESS, PREPARE) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-semibold text-[#19B8A5] uppercase tracking-wider">
            How Climate Lens Works
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA]">
            From Environmental Data to Citizen Action
          </h2>
          <p className="text-xs text-[#A7BAC4] leading-relaxed">
            A transparent 3-step loop ensuring information is understood, validated for accuracy, and turned into practical safety steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1: Understand */}
          <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-3 relative group hover:border-[#19B8A5]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#19B8A5]/20 text-[#19B8A5] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#F3F8FA]">1. Understand</h3>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              Explore current conditions and available forecasts for your exact area with transparent physical units and WMO weather descriptors.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8CE6E0]">
              Provider: Open-Meteo CC BY 4.0
            </div>
          </div>

          {/* Step 2: Assess */}
          <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-3 relative group hover:border-[#19B8A5]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#8CE6E0]/20 text-[#8CE6E0] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#F3F8FA]">2. Assess</h3>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              Review potential hazards, their sources, observation timestamps, and uncertainty ranges with explainable 6-point quality checks.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#8CE6E0]">
              Audited: Freshness &amp; Completeness
            </div>
          </div>

          {/* Step 3: Prepare */}
          <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-3 relative group hover:border-[#19B8A5]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FFBF69]/20 text-[#FFBF69] flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#F3F8FA]">3. Prepare</h3>
            <p className="text-xs text-[#A7BAC4] leading-relaxed">
              Get clear, practical safety guidance and emergency checklists relevant to the identified heat, flood, or rain risks in your area.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#FFBF69]">
              ReadyPlan: Immediate Action Kits
            </div>
          </div>
        </div>
      </section>

      {/* 3. VERIFIABLE PROVENANCE & BLOCKCHAIN STATUS BAR */}
      <section className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#19B8A5]" />
              <span>ClimateChain Hackathon Trust Differentiator</span>
            </div>
            <h3 className="text-base font-bold text-[#F3F8FA] mt-0.5">
              Data Integrity &amp; Cryptographic Evidence Verification
            </h3>
          </div>

          <button
            onClick={() => onNavigate('verify')}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-[#8CE6E0] border border-white/10 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Launch ClimateProof Auditor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#A7BAC4] block text-[11px]">Deterministic Canonicalization</span>
            <span className="font-mono text-[#F3F8FA] font-bold">RFC 8785 Compliant</span>
            <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
              Ensures identical atmospheric readings always yield byte-for-byte identical UTF-8 digests.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#A7BAC4] block text-[11px]">Content Hash Algorithm</span>
            <span className="font-mono text-[#F3F8FA] font-bold">SHA-256 Hex Digest</span>
            <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
              Protects records against silent tampering; modifying 1 byte causes total mismatch.
            </p>
          </div>

          <div className="p-3.5 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#A7BAC4] block text-[11px]">Blockchain Testnet State</span>
            <span className="font-mono text-[#19B8A5] font-bold">Polygon Amoy (80002)</span>
            <p className="text-[#A7BAC4] text-[11px] leading-relaxed">
              Anchors cryptographic timestamps to public ledger without storing private location histories.
            </p>
          </div>
        </div>
      </section>

      {/* 4. WHY CLIMATE LENS IS DIFFERENT */}
      <section className="p-6 rounded-2xl liquid-glass border border-white/10 text-xs text-[#A7BAC4] space-y-3">
        <h3 className="text-sm font-bold text-[#F3F8FA]">
          The Climate Lens Mission: Complements Official Services With Radical Transparency
        </h3>
        <p className="leading-relaxed">
          Climate Lens does not pretend to replace the India Meteorological Department (IMD) or national civil defense agencies. Instead, it provides an open transparency layer where everyday citizens and researchers can verify where environmental data originated, whether it is fresh, how conditions have shifted, and what practical steps to take.
        </p>
      </section>
    </div>
  );
};
