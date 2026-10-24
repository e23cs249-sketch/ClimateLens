import React, { useState, useEffect } from 'react';
import {
  EvidenceSnapshot,
  VerificationResult,
  verifyCustomPayloadApi,
} from '../services/api.ts';
import { canonicalize } from '../utils/canonicalize.ts';
import {
  Activity,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Copy,
  CheckCircle2,
  FileCode2,
  ArrowRight,
  Info,
  Lock,
  Unlock,
} from 'lucide-react';

interface TamperLabPageProps {
  snapshots: EvidenceSnapshot[];
  initialSnapshotId?: string;
  language: 'en' | 'ta';
}

export const TamperLabPage: React.FC<TamperLabPageProps> = ({
  snapshots,
  initialSnapshotId,
  language,
}) => {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>(
    initialSnapshotId || (snapshots.length > 0 ? snapshots[0].id : '')
  );

  const selectedSnapshot = snapshots.find((s) => s.id === selectedSnapshotId) || snapshots[0];

  // Editable parameters in the tampering sandbox
  const [editTemperature, setEditTemperature] = useState<number>(32.5);
  const [editPrecipitation, setEditPrecipitation] = useState<number>(0.0);
  const [editCity, setEditCity] = useState<string>('Chennai, Tamil Nadu, India');
  const [editTimestamp, setEditTimestamp] = useState<string>('');

  const [simulatedPayload, setSimulatedPayload] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [hasTampered, setHasTampered] = useState<boolean>(false);

  // Initialize sandbox from selected snapshot
  useEffect(() => {
    if (!selectedSnapshot) return;

    try {
      const parsed = JSON.parse(selectedSnapshot.canonicalPayload);
      const temp = parsed?.measurements?.temperature_celsius ?? parsed?.telemetry?.temperature_celsius ?? 32.5;
      const precip = parsed?.measurements?.precipitation_mm ?? parsed?.telemetry?.precipitation_mm ?? 0.0;
      const city = parsed?.location?.label ?? selectedSnapshot.locationReference;
      const time = parsed?.timestamps?.sourceObservationTime ?? parsed?.timestamps?.sourceTime ?? new Date().toISOString();

      setEditTemperature(temp);
      setEditPrecipitation(precip);
      setEditCity(city);
      setEditTimestamp(time);
      setSimulatedPayload(selectedSnapshot.canonicalPayload);
      setHasTampered(false);
      setVerificationResult(null);
    } catch {
      setSimulatedPayload(selectedSnapshot.canonicalPayload);
    }
  }, [selectedSnapshot?.id]);

  // Recalculate sandbox canonical payload when user edits fields
  const applyModification = (newTemp: number, newPrecip: number, newCity: string) => {
    if (!selectedSnapshot) return;
    try {
      const parsed = JSON.parse(selectedSnapshot.canonicalPayload);

      // Deep update
      if (parsed.measurements) {
        parsed.measurements.temperature_celsius = newTemp;
        parsed.measurements.precipitation_mm = newPrecip;
      }
      if (parsed.telemetry) {
        parsed.telemetry.temperature_celsius = newTemp;
        parsed.telemetry.precipitation_mm = newPrecip;
      }
      if (parsed.location) {
        parsed.location.label = newCity;
      }

      // Serialize back using shared RFC 8785 recursive canonicalization
      const newCanonical = canonicalize(parsed);

      setSimulatedPayload(newCanonical);
      setHasTampered(true);
      executeVerificationTest(newCanonical);
    } catch (err) {
      console.error('Error modifying sandbox payload:', err);
    }
  };

  const executeVerificationTest = async (payloadToTest: string) => {
    if (!selectedSnapshot) return;
    setIsVerifying(true);
    try {
      const res = await verifyCustomPayloadApi(selectedSnapshot.id, payloadToTest);
      setVerificationResult(res);
    } catch (err) {
      console.error('Tamper verification test error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResetSandbox = () => {
    if (!selectedSnapshot) return;
    try {
      const parsed = JSON.parse(selectedSnapshot.canonicalPayload);
      const temp = parsed?.measurements?.temperature_celsius ?? parsed?.telemetry?.temperature_celsius ?? 32.5;
      const precip = parsed?.measurements?.precipitation_mm ?? parsed?.telemetry?.precipitation_mm ?? 0.0;
      const city = parsed?.location?.label ?? selectedSnapshot.locationReference;

      setEditTemperature(temp);
      setEditPrecipitation(precip);
      setEditCity(city);
      setSimulatedPayload(selectedSnapshot.canonicalPayload);
      setHasTampered(false);
      executeVerificationTest(selectedSnapshot.canonicalPayload);
    } catch {
      setSimulatedPayload(selectedSnapshot.canonicalPayload);
    }
  };

  if (!selectedSnapshot) {
    return (
      <div className="p-8 text-center liquid-glass rounded-2xl border border-white/10 space-y-3">
        <Activity className="w-10 h-10 text-[#19B8A5] mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-white">No Evidence Snapshots Available</h3>
        <p className="text-xs text-[#A7BAC4]">Please capture an evidence snapshot in "My Area" or "Overview" first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#FFBF69]/20 text-[#FFBF69] border border-[#FFBF69]/30 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              Judge Demonstration Feature
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[#A7BAC4] border border-white/10 text-[11px] font-mono">
              Avalanche Effect Sandbox
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F8FA] tracking-tight">
            Interactive Tampering Laboratory
          </h1>

          <p className="text-xs sm:text-sm text-[#A7BAC4] max-w-2xl leading-relaxed">
            {language === 'ta'
              ? 'சான்று சேதப்படுத்தும் ஆய்வகம்: சேமிக்கப்பட்ட உண்மையான சான்றை நகலெடுத்து ஒரு மதிப்பை மாற்றவும். SHA-256 கிரிப்டோகிராஃபிக் முறையில் மாற்றம் எவ்வாறு உடனடியாக கண்டறியப்படுகிறது என்பதை கண்கூடாக பாருங்கள்.'
              : 'Select a genuine evidence snapshot and modify a value (e.g. temperature or rainfall). Watch how a 0.1°C change immediately alters the SHA-256 digest and triggers an unambiguous cryptographic MISMATCH.'}
          </p>
        </div>
      </div>

      {/* Snapshot Selector */}
      <div className="flex items-center justify-between gap-4 p-4 liquid-glass rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#19B8A5]" />
          <span className="font-bold text-white">Baseline Reference Snapshot:</span>
          <select
            value={selectedSnapshotId}
            onChange={(e) => setSelectedSnapshotId(e.target.value)}
            className="bg-black/50 border border-white/20 rounded-lg px-3 py-1.5 text-[#F3F8FA] font-mono focus:outline-none focus:border-[#19B8A5]"
          >
            {snapshots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.locationReference.split(',')[0]} ({new Date(s.createdAt).toLocaleTimeString()}) — {s.contentHash.substring(0, 8)}...
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleResetSandbox}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7BAC4] hover:text-white border border-white/10 flex items-center gap-1.5 font-mono text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Clean Baseline</span>
        </button>
      </div>

      {/* Interactive Side-by-Side Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Immutable Original Baseline */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#19B8A5]" />
              <span className="font-bold text-sm text-white">Genuine Baseline Snapshot</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30 text-[10px] font-mono font-bold uppercase">
              IMMUTABLE STORE
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#A7BAC4] text-[10px] uppercase font-mono block">Registered Content Digest</span>
              <span className="font-mono text-[#8CE6E0] text-[11px] break-all select-all font-bold">
                {selectedSnapshot.contentHash}
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#A7BAC4] text-[10px] uppercase font-mono block">Location Reference</span>
              <span className="text-white font-medium">{selectedSnapshot.locationReference}</span>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#A7BAC4] text-[10px] uppercase font-mono block">Creation Ingestion Time (UTC)</span>
              <span className="text-white font-mono">{selectedSnapshot.createdAt}</span>
            </div>
          </div>

          {/* Raw Canonical Payload */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#A7BAC4] uppercase">Registered Canonical Payload (RFC 8785)</span>
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-[#A7BAC4] max-h-48 overflow-y-auto leading-relaxed">
              <pre>{selectedSnapshot.canonicalPayload}</pre>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Sandbox Copy */}
        <div className="liquid-glass rounded-2xl p-6 border border-[#FFBF69]/30 space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Unlock className="w-4 h-4 text-[#FFBF69]" />
              <span className="font-bold text-sm text-[#FFBF69]">Interactive Modification Sandbox</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                hasTampered
                  ? 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30 animate-pulse'
                  : 'bg-white/10 text-[#A7BAC4]'
              }`}
            >
              {hasTampered ? 'MODIFIED COPY' : 'UNMODIFIED COPY'}
            </span>
          </div>

          {/* Sliders / Inputs */}
          <div className="space-y-4 text-xs">
            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <label className="text-[#A7BAC4]">Modify Temperature (°C):</label>
                <span className="text-white font-bold text-sm">{editTemperature.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="55"
                step="0.1"
                value={editTemperature}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEditTemperature(val);
                  applyModification(val, editPrecipitation, editCity);
                }}
                className="w-full accent-[#FFBF69] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#A7BAC4]">
                <span>10°C (Cold)</span>
                <span>32.5°C (Current)</span>
                <span>55°C (Extreme Heat)</span>
              </div>
            </div>

            {/* Precipitation Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono">
                <label className="text-[#A7BAC4]">Modify Precipitation (mm):</label>
                <span className="text-white font-bold text-sm">{editPrecipitation.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={editPrecipitation}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEditPrecipitation(val);
                  applyModification(editTemperature, val, editCity);
                }}
                className="w-full accent-[#8CE6E0] cursor-pointer"
              />
            </div>
          </div>

          {/* Recalculated Hash Output */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono text-[#A7BAC4] uppercase block">
              Recalculated SHA-256 Digest in Sandbox:
            </span>
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] break-all select-all font-bold text-[#FFBF69]">
              {verificationResult ? verificationResult.recalculatedHash : 'Calculating...'}
            </div>
          </div>

          {/* Modified Canonical JSON */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-[#A7BAC4] uppercase">Modified Payload Stream</span>
            <div className="p-3 bg-black/60 rounded-xl border border-white/10 font-mono text-[11px] text-[#FFBF69] max-h-40 overflow-y-auto leading-relaxed">
              <pre>{simulatedPayload}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Verdict Display */}
      {verificationResult && (
        <div
          className={`liquid-glass rounded-2xl p-6 border transition-all ${
            verificationResult.isMatch
              ? 'border-[#19B8A5]/40 shadow-[0_0_24px_rgba(25,184,165,0.2)]'
              : 'border-[#FF6268]/40 shadow-[0_0_24px_rgba(255,98,104,0.2)]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {verificationResult.isMatch ? (
                <div className="w-12 h-12 rounded-2xl bg-[#19B8A5]/20 border border-[#19B8A5]/30 flex items-center justify-center text-[#19B8A5] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-[#FF6268]/20 border border-[#FF6268]/30 flex items-center justify-center text-[#FF6268] shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-lg ${
                      verificationResult.isMatch
                        ? 'bg-[#19B8A5]/20 text-[#8CE6E0] border border-[#19B8A5]/30'
                        : 'bg-[#FF6268]/20 text-[#FF6268] border border-[#FF6268]/30'
                    }`}
                  >
                    VERDICT: {verificationResult.status}
                  </span>
                  <span className="text-xs text-[#A7BAC4] font-mono">
                    Time: {new Date(verificationResult.verificationTimestamp).toLocaleTimeString()}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">
                  {verificationResult.isMatch
                    ? 'Byte-for-Byte Cryptographic Integrity Verified'
                    : 'Cryptographic Modification / Tampering Detected'}
                </h4>
              </div>
            </div>

            <button
              onClick={handleResetSandbox}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              Restore Original Values
            </button>
          </div>

          <p className="mt-4 text-xs text-[#A7BAC4] leading-relaxed pt-3 border-t border-white/5">
            {verificationResult.explanation}
          </p>

          {!verificationResult.isMatch && (
            <div className="mt-3 p-3 bg-[#FF6268]/10 rounded-xl border border-[#FF6268]/20 text-xs text-[#F3F8FA] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#FF6268] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-[#FF6268]">Why the Avalanche Effect triggers a complete hash change:</span>
                <p className="text-[#A7BAC4] leading-relaxed">
                  In SHA-256 cryptographic hashing, changing even a single bit of input flips roughly 50% of the output bits at random. Even a 0.1°C temperature shift produces a completely unrecognizable 64-character hexadecimal digest, rendering undetected data alteration mathematically impossible.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
