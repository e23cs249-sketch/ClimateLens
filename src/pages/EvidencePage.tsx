import React, { useState } from 'react';
import { Database, Filter, ShieldCheck, Download, Search } from 'lucide-react';
import { EvidenceSnapshot } from '../services/api.ts';
import { EvidenceCard } from '../components/EvidenceCard.tsx';

interface EvidencePageProps {
  snapshots: EvidenceSnapshot[];
  onVerify: (id: string) => void;
  language: 'en' | 'ta';
}

export const EvidencePage: React.FC<EvidencePageProps> = ({
  snapshots,
  onVerify,
  language,
}) => {
  const [filterOrigin, setFilterOrigin] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = snapshots.filter((s) => {
    const matchesOrigin = filterOrigin === 'all' || s.dataOrigin === filterOrigin;
    const matchesSearch =
      !searchQuery ||
      s.locationReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contentHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesOrigin && matchesSearch;
  });

  const exportJsonLedger = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshots, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `climatelens_evidence_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 liquid-glass rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <Database className="w-3.5 h-3.5 text-[#19B8A5]" />
            <span>{language === 'ta' ? 'மாற்ற முடியாத ஆதார பதிவுகள்' : 'Cryptographic Evidence Vault'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA] mt-1">
            {language === 'ta' ? 'சேமிக்கப்பட்ட வளிமண்டல சான்றுகள்' : 'Sealed Atmospheric Evidence Ledger'}
          </h1>
          <p className="text-xs text-[#A7BAC4] mt-1">
            Deterministic canonical JSON payloads with SHA-256 integrity digests and testnet anchors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportJsonLedger}
            className="px-4 py-2 text-xs font-bold text-[#071722] bg-[#19B8A5] hover:bg-[#159a8a] rounded-xl transition-all flex items-center gap-2 shadow-md shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Evidence JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 liquid-glass rounded-2xl border border-white/10 shadow-lg">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, snapshot ID or SHA-256 hash prefix..."
            className="w-full pl-9 pr-4 py-2 text-xs text-[#F3F8FA] bg-black/40 border border-white/15 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#19B8A5]"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#19B8A5]" />
        </div>

        {/* Origin Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setFilterOrigin('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterOrigin === 'all' ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs' : 'text-[#A7BAC4] hover:text-white'
            }`}
          >
            All Snapshots ({snapshots.length})
          </button>
          <button
            onClick={() => setFilterOrigin('live_provider')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterOrigin === 'live_provider' ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs' : 'text-[#A7BAC4] hover:text-white'
            }`}
          >
            Live Ingested
          </button>
          <button
            onClick={() => setFilterOrigin('historical_archive')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              filterOrigin === 'historical_archive' ? 'bg-[#19B8A5] text-[#071722] font-bold shadow-xs' : 'text-[#A7BAC4] hover:text-white'
            }`}
          >
            Historical Baseline
          </button>
        </div>
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#A7BAC4] liquid-glass rounded-2xl border border-white/10">
            No evidence records matched your search query.
          </div>
        ) : (
          filtered.map((snapshot) => (
            <EvidenceCard
              key={snapshot.id}
              snapshot={snapshot}
              onVerify={onVerify}
              language={language}
            />
          ))
        )}
      </div>
    </div>
  );
};
