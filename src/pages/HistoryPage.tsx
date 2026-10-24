import React, { useState, useEffect } from 'react';
import { History, RefreshCw } from 'lucide-react';
import { fetchHistoryApi, EvidenceChange, EvidenceSnapshot } from '../services/api.ts';
import { HistoryTimeline } from '../components/HistoryTimeline.tsx';

interface HistoryPageProps {
  onSelectSnapshot: (id: string) => void;
  language: 'en' | 'ta';
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectSnapshot,
  language,
}) => {
  const [changes, setChanges] = useState<EvidenceChange[]>([]);
  const [snapshots, setSnapshots] = useState<EvidenceSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetchHistoryApi();
      setChanges(res.changes || []);
      setSnapshots(res.recentSnapshots || []);
    } catch (err) {
      console.error('History load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 liquid-glass rounded-2xl border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-[#19B8A5] uppercase tracking-wider flex items-center gap-1.5 font-mono">
            <History className="w-3.5 h-3.5 text-[#19B8A5]" />
            <span>{language === 'ta' ? 'சான்றுகள் காலவரிசை' : 'Evidence Evolution Audit'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F8FA] mt-1">
            {language === 'ta' ? 'என்ன மாறியது? (What Changed?)' : 'What Changed? — Atmospheric Shift Tracker'}
          </h1>
          <p className="text-xs text-[#A7BAC4] mt-1">
            Track temperature shifts, humidity swings, and pressure fluctuations between consecutive verifiable snapshots.
          </p>
        </div>

        <button
          onClick={loadHistory}
          disabled={isLoading}
          className="p-2.5 text-[#A7BAC4] hover:text-[#8CE6E0] hover:bg-white/5 rounded-xl border border-white/10 self-start md:self-auto transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#19B8A5]' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-[#A7BAC4] liquid-glass rounded-2xl border border-white/10">
          Loading historical evidence ledger...
        </div>
      ) : (
        <HistoryTimeline
          changes={changes}
          snapshots={snapshots}
          onSelectSnapshot={onSelectSnapshot}
          language={language}
        />
      )}
    </div>
  );
};
