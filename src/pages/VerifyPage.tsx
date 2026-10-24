import React from 'react';
import { ShieldCheck, Info, CheckCircle2, Lock } from 'lucide-react';
import { EvidenceSnapshot } from '../services/api.ts';
import { VerificationPanel } from '../components/VerificationPanel.tsx';

interface VerifyPageProps {
  snapshots: EvidenceSnapshot[];
  selectedSnapshotId?: string;
  onSelectSnapshot: (id: string) => void;
  language: 'en' | 'ta';
}

export const VerifyPage: React.FC<VerifyPageProps> = ({
  snapshots,
  selectedSnapshotId,
  onSelectSnapshot,
  language,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 liquid-glass rounded-2xl border border-white/10 shadow-xl space-y-2">
        <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#8CE6E0]" />
          <span>{language === 'ta' ? 'சான்றுகள் நேர்மை சரிபார்த்தல்' : 'ClimateProof Verification Engine'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA]">
          {language === 'ta' ? 'கிரிப்டோகிராஃபிக் ஹாஷ் & டெஸ்ட்நெட் சரிபார்ப்பு' : 'Cryptographic Hash & Integrity Audit'}
        </h1>
        <p className="text-xs text-[#A7BAC4] max-w-3xl leading-relaxed">
          {language === 'ta'
            ? 'அசல் கேனானிகல் பேலோடிலிருந்து SHA-256 ஹாஷை மீண்டும் கணக்கிட்டு, பதிவு செய்யப்பட்ட தரவு மாற்றப்படவில்லை என்பதை உறுதி செய்கிறது.'
            : 'Independent byte-for-byte SHA-256 verification against registered ledgers and Polygon Amoy testnet anchors.'}
        </p>
      </div>

      {/* Main Verification Panel */}
      <VerificationPanel
        snapshots={snapshots}
        selectedSnapshotId={selectedSnapshotId}
        onSelectSnapshot={onSelectSnapshot}
        language={language}
      />

      {/* Educational Verification Guide Card */}
      <div className="liquid-glass rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-[#F3F8FA]">
          How ClimateProof Verification Works (Step-by-Step)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#8CE6E0] block font-mono">1. Ingest &amp; Normalize</span>
            <p className="text-[#A7BAC4] leading-relaxed">
              Raw weather JSON is normalized into standard SI units and structured atmospheric records.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#8CE6E0] block font-mono">2. RFC 8785 Canonicalize</span>
            <p className="text-[#A7BAC4] leading-relaxed">
              Object keys are sorted lexicographically by Unicode points; formatting whitespace is removed.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#8CE6E0] block font-mono">3. SHA-256 Digest</span>
            <p className="text-[#A7BAC4] leading-relaxed">
              256-bit cryptographic digest is computed, producing an immutable content fingerprint.
            </p>
          </div>

          <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-1.5">
            <span className="font-bold text-[#8CE6E0] block font-mono">4. Recalculate &amp; Compare</span>
            <p className="text-[#A7BAC4] leading-relaxed">
              Auditor recomputes hash from stored payload: matching digests prove zero byte alteration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
