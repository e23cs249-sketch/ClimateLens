import React, { useState } from 'react';
import { ShieldCheck, Database, Copy, Check, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { EvidenceSnapshot } from '../services/api.ts';

interface EvidenceCardProps {
  snapshot: EvidenceSnapshot;
  onVerify: (id: string) => void;
  language: 'en' | 'ta';
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  snapshot,
  onVerify,
  language,
}) => {
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard.writeText(snapshot.contentHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="liquid-glass rounded-2xl p-6 border border-white/10 space-y-4 hover:border-[#19B8A5]/40 transition-all shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#19B8A5]" />
            <h4 className="text-sm font-bold text-[#F3F8FA]">{snapshot.locationReference}</h4>
          </div>
          <div className="text-[11px] text-[#A7BAC4] mt-0.5 flex flex-wrap items-center gap-2 font-mono">
            <span>ID: {snapshot.id}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#8CE6E0]">Origin: {snapshot.dataOrigin.replace('_', ' ')}</span>
            <span aria-hidden="true">·</span>
            <span>Recorded: {new Date(snapshot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <button
          onClick={() => onVerify(snapshot.id)}
          className="px-3.5 py-1.5 bg-[#19B8A5]/20 hover:bg-[#19B8A5] text-[#8CE6E0] hover:text-[#071722] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0 border border-[#19B8A5]/30"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'நேர்மை சரிபார்' : 'Verify Integrity'}</span>
        </button>
      </div>

      {/* Freshness & Completeness Unboxed Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[#A7BAC4] block text-[10px] uppercase font-mono font-bold">Data Type</span>
          <span className="font-mono text-[#F3F8FA]">{snapshot.dataType.replace('_', ' ')}</span>
        </div>
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[#A7BAC4] block text-[10px] uppercase font-mono font-bold">Freshness</span>
          <span className={`font-semibold ${snapshot.freshnessStatus === 'fresh' ? 'text-[#19B8A5]' : 'text-[#FFBF69]'}`}>
            {snapshot.freshnessStatus.toUpperCase()}
          </span>
        </div>
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[#A7BAC4] block text-[10px] uppercase font-mono font-bold">Completeness</span>
          <span className="text-[#19B8A5] font-semibold">{snapshot.completenessStatus.toUpperCase()}</span>
        </div>
        <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
          <span className="text-[#A7BAC4] block text-[10px] uppercase font-mono font-bold">Proof Level</span>
          <span className="text-[#8CE6E0] font-semibold">
            {snapshot.proof?.proofType === 'testnet_anchor' ? 'Polygon Amoy Anchor' : 'SHA-256 Local Ledger'}
          </span>
        </div>
      </div>

      {/* SHA-256 Cryptographic Digest */}
      <div className="p-3 bg-black/40 rounded-xl border border-white/10 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-[#A7BAC4] uppercase font-mono font-bold">
          <span>SHA-256 Immutable Content Digest</span>
          <button
            onClick={copyHash}
            className="flex items-center gap-1 text-[#8CE6E0] hover:text-[#19B8A5] font-sans normal-case"
          >
            {copied ? <Check className="w-3 h-3 text-[#19B8A5]" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Hash'}</span>
          </button>
        </div>
        <div className="font-mono text-xs text-[#8CE6E0] break-all select-all tabular-nums">
          {snapshot.contentHash}
        </div>
      </div>

      {/* Expandable canonical JSON representation */}
      <div>
        <button
          onClick={() => setShowPayload(!showPayload)}
          className="text-xs text-[#8CE6E0] hover:text-[#19B8A5] font-bold flex items-center gap-1"
        >
          {showPayload ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showPayload ? 'Hide Canonical Payload' : 'Inspect Canonical Evidence Representation'}</span>
        </button>

        {showPayload && (
          <div className="mt-2 p-3.5 bg-[#071722] text-[#8CE6E0] rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-white/10">
            <pre className="whitespace-pre-wrap break-all">{snapshot.canonicalPayload}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
