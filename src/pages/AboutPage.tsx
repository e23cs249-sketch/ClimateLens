import React, { useState, useEffect } from 'react';
import {
  Info,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Database,
  Cpu,
  Layers,
  FileCode2,
  Copy,
  Terminal,
} from 'lucide-react';
import { fetchBlockchainStatusApi, BlockchainStatus } from '../services/api.ts';

interface AboutPageProps {
  language: 'en' | 'ta';
}

export const AboutPage: React.FC<AboutPageProps> = ({ language }) => {
  const [blockchainStatus, setBlockchainStatus] = useState<BlockchainStatus | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);

  useEffect(() => {
    fetchBlockchainStatusApi()
      .then(setBlockchainStatus)
      .catch((err) => console.warn('Could not load blockchain status:', err));
  }, []);

  const copyContractSource = () => {
    if (!blockchainStatus) return;
    navigator.clipboard.writeText(blockchainStatus.smartContractSource);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-2">
        <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <Info className="w-4 h-4 text-[#8CE6E0]" />
          <span>IEEE ClimateChain Global Hackathon 2026 · Track 4</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F8FA]">
          About ClimateLens — Mission, Architecture &amp; Provenance
        </h1>
        <p className="text-xs sm:text-sm text-[#A7BAC4] max-w-3xl leading-relaxed">
          ClimateLens transforms raw meteorological telemetry into understandable, traceable, and cryptographically verifiable evidence, bridging the critical gap between environmental data and practical civil action.
        </p>
      </div>

      {/* Track 4 Alignment & Core Innovation */}
      <div className="p-6 sm:p-8 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#F3F8FA]">
          Track 4 Alignment: Climate Data &amp; Environmental Monitoring
        </h2>
        <p className="text-xs sm:text-sm text-[#A7BAC4] leading-relaxed">
          Conventional weather apps display floating numbers without context: users cannot easily inspect where the data came from, whether it is stale or incomplete, how it shifted over time, or if the saved record was altered.
        </p>
        <p className="text-xs sm:text-sm text-[#A7BAC4] leading-relaxed">
          ClimateLens implements the <strong>Evidence-to-Action Integrity Loop</strong>:
        </p>

        <div className="p-5 bg-black/40 rounded-xl border border-white/10 text-xs font-mono text-[#8CE6E0] space-y-3">
          <div className="font-bold uppercase tracking-wider text-[11px] text-[#19B8A5]">
            The 8-Stage Evidence Integrity Chain:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div>1. Real Environmental Data (Open-Meteo, ECMWF, DWD)</div>
            <div>2. Source Provenance &amp; Attribution Metadata</div>
            <div>3. Rules-Based Freshness &amp; Completeness Checks</div>
            <div>4. Climate Evidence Twin with Derived Indicators</div>
            <div>5. Grounded AI Explainer (Bilingual EN/தமிழ்)</div>
            <div>6. Interactive Tampering Laboratory &amp; Avalanche Test</div>
            <div>7. Climate Action Ledger &amp; Cryptographic Receipts</div>
            <div>8. Deterministic RFC 8785 Canonicalization &amp; SHA-256 Digest</div>
          </div>
        </div>
      </div>

      {/* Integrated Data Providers & Attribution */}
      <div className="p-6 sm:p-8 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#F3F8FA]">Data Providers &amp; Scientific Attribution</h2>
        <div className="space-y-3 text-xs">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F3F8FA]">Open-Meteo Weather Model Suite</span>
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#19B8A5] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>open-meteo.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[#A7BAC4] leading-relaxed">
              Provides real-time hourly and daily forecast grids combining ECMWF IFS (9 km), DWD ICON (7 km), and NOAA GFS (13 km). Open-Meteo data is licensed under <strong>CC BY 4.0 International</strong>.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F3F8FA]">Copernicus Atmosphere &amp; Climate Service (ERA5 / CAMS)</span>
              <a
                href="https://climate.copernicus.eu"
                target="_blank"
                rel="noreferrer"
                className="text-[#19B8A5] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>climate.copernicus.eu</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[#A7BAC4] leading-relaxed">
              Provides air quality pollutant modeling (PM2.5, PM10, Ozone, NO2) and historical baseline climate reanalysis. Contains modified Copernicus Climate Change Service information (2026).
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#F3F8FA]">India Meteorological Department (IMD) Reference Portal</span>
              <a
                href="https://mausam.imd.gov.in"
                target="_blank"
                rel="noreferrer"
                className="text-[#19B8A5] hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>mausam.imd.gov.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[#A7BAC4] leading-relaxed">
              National portal reference for official weather bulletins, cyclone advisories, and severe weather warnings across the Indian subcontinent.
            </p>
          </div>
        </div>
      </div>

      {/* Transparent Blockchain & Persistence Architecture */}
      <div className="p-6 sm:p-8 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-[#F3F8FA]">
          Honest Architecture: Blockchain Anchoring &amp; Persistence
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-[#A7BAC4]">
          <p>
            In alignment with the IEEE ClimateChain hackathon principles, ClimateLens is strictly transparent about what is local, what is simulated, and what is on-chain:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="font-bold text-[#8CE6E0] block font-mono">1. Local Integrity (Active)</span>
              <p className="text-[11px]">
                Deterministic RFC 8785 canonicalization and SHA-256 recalculation executed in real-time. Detects any modified field byte-for-byte.
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="font-bold text-[#FFBF69] block font-mono">2. Simulated Testnet (Active)</span>
              <p className="text-[11px]">
                When real EVM RPC credentials are not configured in .env, testnet transaction hashes are clearly labelled as demonstration simulations rather than falsely claiming on-chain confirmations.
              </p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="font-bold text-[#19B8A5] block font-mono">3. Real EVM Anchoring</span>
              <p className="text-[11px]">
                Deploy <code className="text-white">ClimateEvidenceAnchor.sol</code> to Polygon Amoy or Sepolia and provide RPC credentials to broadcast real on-chain anchor transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Smart Contract Source Code Viewer */}
        {blockchainStatus && (
          <div className="pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                <FileCode2 className="w-4 h-4 text-[#19B8A5]" />
                ClimateEvidenceAnchor.sol (Solidity v0.8.20)
              </span>
              <button
                onClick={copyContractSource}
                className="px-2.5 py-1 text-[11px] font-mono bg-white/5 hover:bg-white/10 rounded-lg text-[#8CE6E0] border border-white/10 flex items-center gap-1"
              >
                {copiedContract ? <CheckCircle2 className="w-3 h-3 text-[#19B8A5]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedContract ? 'Copied' : 'Copy Contract'}</span>
              </button>
            </div>

            <div className="p-4 bg-black/70 rounded-xl border border-white/10 font-mono text-[11px] text-[#8CE6E0] max-h-56 overflow-y-auto leading-relaxed">
              <pre>{blockchainStatus.smartContractSource}</pre>
            </div>

            {/* Setup Instructions */}
            <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2 text-xs">
              <span className="font-bold text-white font-mono block">Testnet Deployment Instructions:</span>
              <ul className="space-y-1 text-[#A7BAC4] text-[11px] font-mono">
                {blockchainStatus.setupInstructions.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Civil Protection Disclaimer */}
      <div className="p-6 liquid-glass rounded-2xl border border-white/10 space-y-2 text-xs text-[#A7BAC4]">
        <span className="font-bold text-white block">Official Emergency Services Notice:</span>
        <p className="leading-relaxed">
          ClimateLens is an independent climate intelligence and evidence verification platform built for research, community preparedness, and transparency. It does not replace binding warnings, evacuation orders, or civil defense protocols issued by national emergency authorities (e.g. National Disaster Management Authority, India Meteorological Department, Greater Chennai Corporation). In life-threatening weather events, always prioritize official government advisories.
        </p>
      </div>
    </div>
  );
};
